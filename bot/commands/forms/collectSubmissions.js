const { Command, Embed } = require('../../../lib');

module.exports = class collectSubmissions extends Command {
  constructor() {
    super('collectsubmissions', {
      description: 'Collect submissions in realtime with Webhooks.',
      usage: '<Channel> <Form ID>',
    });
  }

  async run(message, [key, ...args]) {
    const userModel = require('../../../lib/models/User');
    const submissionModel = require('../../../lib/models/SubmissionHooks');
    const { bot, Sentry } = require('../../events/ready');
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

      let submissionChannel = message.mentions.channels.first();

      if (!submissionChannel) {
        return message.channel.send(
          Embed.error(':x: You have to mention a valid channel!').setAuthor(
            'Error'
          )
        );
      }

      const formId = args[0];

      if (!formId) {
        return message.channel.send(
          Embed.error(":x: You didn't give a Form ID!")
            .addField(
              'How to obtain Form ID?',
              'https://form.jotform.com/1232198321674328 -> `1232198321674328` is the Form ID.'
            )
            .setAuthor('Error')
        );
      }

      const channel = bot.channels.cache.get(submissionChannel.id);

      console.log(channel);

      if (!channel) {
        return message.channel.send(
          Embed.error(":x: I don't have access to this channel!").setAuthor(
            'Error'
          )
        );
      }

      const JF = new JotForm();
      JF.setApiKey(apiKey);

      await JF.form.getForm(formId).catch((err) => {
        console.log(err);
        return message.channel.send(
          Embed.error(':x: Form does not exist!').addField('Form ID', formId)
        );
      });

      await JF.form
        .createFormWebhook(formId, 'http://195.174.236.242:1337/hooks')
        .then(async (res) => {
          await submissionModel.create({
            formId: formId,
            channelId: submissionChannel.id,
          });

          return message.channel.send(
            Embed.success(
              `You will receive new submissions here: ${submissionChannel}`
            ).setAuthor('Success')
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
