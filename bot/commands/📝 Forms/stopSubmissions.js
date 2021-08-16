const { Command, Embed } = require('../../../lib');

module.exports = class stopSubmissions extends Command {
  constructor() {
    super('stopSubmissions', {
      description: 'Stop collecting submissions for selected form.',
      usage: '<Form ID>',
    });
  }

  async run(message, [...args]) {
    const userModel = require('../../../lib/models/User');
    const submissionModel = require('../../../lib/models/SubmissionHooks');
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

      const formId = args[0];

      if (!formId) {
        const submissions = await submissionModel.find({
          userId: message.author.id,
        });

        const createEmbed = await Embed.success(
          'I am currently listening these forms. Please give me the **Form ID** from which you want to stop receiving the submissions. '
        ).setAuthor('List');

        for (let i = 0; i < submissions.length; i++) {
          createEmbed.addField(
            submissions[i].formName || 'No Title',
            `**Form ID:** ${submissions[i].formId}`
          );
        }

        return message.channel.send(createEmbed);
      }

      const JF = new JotForm();
      JF.setApiKey(apiKey);

      let webhookId;

      await JF.form
        .getFormWebhooks(formId)
        .then((res) => {
          webhookId = Object.keys(res.content).find(
            (key) => res.content[key] === 'http://195.174.236.242:1337/hooks'
          );
        })
        .catch((err) => {
          console.log(err);
          return message.channel.send(
            Embed.error('Something went wrong. Please try again.').setAuthor(
              'Error'
            )
          );
        });

      await JF.form
        .deleteFormWebhook(formId, webhookId)
        .then(async () => {
          await submissionModel
            .findOneAndDelete({
              formId: formId,
            })
            .then(() => {
              return message.channel.send(
                Embed.success(
                  'You will no longer receive submissions for this form.'
                ).setAuthor('Success')
              );
            });
        })
        .catch((err) => {
          console.log(err);
          return message.channel.send(
            Embed.error('Something went wrong. Please try again.').setAuthor(
              'Error'
            )
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
