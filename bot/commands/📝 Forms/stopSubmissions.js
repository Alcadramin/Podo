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
    const { isEmpty } = require('lodash');
    require('dotenv').config();

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

        if (isEmpty(submissions)) {
          return message.channel.send(
            Embed.error(
              'There is no form submissions to listen right now, you can add with: `!startsubmissions` command!'
            ).setAuthor('Not Found')
          );
        }

        const createEmbed = await Embed.success(
          'I am currently listening these forms. Please give me the **Form ID** from which you want to stop receiving the submissions. '
        ).setAuthor('Form List');

        for (let i = 0; i < submissions.length; i++) {
          createEmbed.addField(
            submissions[i].formName || 'No Title',
            `https://form.jotform.com/${submissions[i].formId} - **Form ID:** ${submissions[i].formId}`
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
            (key) =>
              res.content[key] ===
              `${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${
                process.env.DOMAIN
              }/hooks`
          );
        })
        .catch(async (err) => {
          console.log(err);
          Sentry.captureException(err);
          await submissionModel.findOneAndDelete({
            formId: formId,
          });

          return message.channel.send(
            Embed.error(
              "Seems your form is deleted or you don't have access to this form anymore. I am removing the submission collection."
            ).setAuthor('Removed')
          );
        });

      if (webhookId) {
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
            Sentry.captureException(err);
            return message.channel.send(
              Embed.error(
                '\u274E Something went wrong. Please try again.'
              ).setAuthor('Error')
            );
          });
      }
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
