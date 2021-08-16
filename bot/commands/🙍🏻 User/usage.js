const { Command, Embed } = require('../../../lib');

module.exports = class Usage extends Command {
  constructor() {
    super('usage', {
      description: 'Get number of form submissions received this month.',
      usage: '',
    });
  }

  async run(message, [key, ...args]) {
    const userModel = require('../../../lib/models/User');
    const { Sentry } = require('../../events/ready');
    const { JotForm } = require('../../../jotform-sdk');

    try {
      const user = await userModel.findOne({ userId: message.author.id });

      if (!user) {
        return message.channel.send(
          Embed.error(
            'You should login first! You can login with `login` command!'
          ).setAuthor('Error')
        );
      }

      const apiKey = await user.decryptKey(user.apiKey);

      const JF = new JotForm();
      JF.setApiKey(apiKey);

      await JF.user
        .getUsage()
        .then((res) => {
          return message.channel.send(
            Embed.success('Here is your monthly usage.')
              .setAuthor('Usage')
              .addFields(
                {
                  name: 'Submission',
                  value: res.content.submissions,
                  inline: true,
                },
                {
                  name: 'SSL Submission',
                  value: res.content.ssl_submissions,
                },
                {
                  name: 'Uploads',
                  value: res.content.uploads,
                  inline: true,
                },
                {
                  name: 'Payments',
                  value: res.content.payments,
                }
              )
          );
        })
        .catch((err) => {
          console.log(err);
          Sentry.captureException(err);
          return message.channel.send(
            Embed.error('\u274E Something went wrong, try again later.')
          );
        });
    } catch (err) {
      console.error(err);
      const errorId = Sentry.captureException(err);

      return message.channel.send(
        Embed.error(
          `🐞 Something went wrong, please tell the support server the error ID: \`${errorId}\``
        )
      );
    }
  }
};
