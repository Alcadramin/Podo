const { Command, Embed } = require('../../../lib');

module.exports = class deleteForm extends Command {
  constructor() {
    super('deleteForm', {
      description: 'Delete a form.',
      usage: '<Form ID>',
    });
  }

  async run(message, [...args]) {
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

      const formId = args[0];

      if (!formId) {
        return message.channel.send(
          Embed.error("You didn't give a Form ID!")
            .addFields(
              {
                name: 'How to obtain Form ID?',
                value:
                  'https://form.jotform.com/1232198321674328 -> `1232198321674328` is the Form ID.',
              },
              {
                name: 'Run this command to get your forms',
                value: '`!myforms`',
              }
            )
            .setAuthor('Error')
        );
      }

      const JF = new JotForm();
      JF.setApiKey(apiKey);

      JF.form
        .deleteForm(formId)
        .then(() => {
          return message.channel.send(
            Embed.success(
              'Form is deleted. You can recover your form from https://www.jotform.com/myforms/ in 30 days.'
            ).setAuthor('Success')
          );
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
