const { Command, Embed } = require('../../../lib');

module.exports = class MyForms extends Command {
  constructor() {
    super('myForms', {
      description:
        'Get list of your forms. You can use this command to find form IDs.',
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
        .getForms()
        .then((res) => {
          const createEmbed =
            Embed.success(`I got your forms! 🐱`).setAuthor('My Forms');

          res.content.map((el) => {
            createEmbed.addField(
              `${el.title || 'No Title'} - ${el.status}`,
              `${el.url} - **Form ID:** ${el.id}`
            );
          });

          return message.channel.send(createEmbed);
        })
        .catch((err) => {
          console.log(err);
          return message.channel.send(
            Embed.error(
              '\u274E Something went wrong. Please try again.'
            ).setAuthor('Error')
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
