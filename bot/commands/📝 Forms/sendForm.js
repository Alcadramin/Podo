const { Command, Embed } = require('../../../lib');

module.exports = class sendForm extends Command {
  constructor() {
    super('sendForm', {
      description:
        'Send your form link to specified channel with your message.',
      perms: ['MANAGE_MESSAGES'],
      usage: '<Channel> <Form ID> [Your Message]',
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

      const formId = args[0];

      if (!message.member.hasPermission('MANAGE_MESSAGES')) {
        return message.channel.send(
          Embed.error(
            'You do not have permission for managing messages.'
          ).setAuthor('Error')
        );
      }

      if (!message.guild.me.hasPermission('ADMINISTRATOR')) {
        return message.channel.send(
          Embed.error("I don't have permission to do this!").setAuthor('Error')
        );
      }

      let formChannel = message.mentions.channels.first();

      if (!formChannel) {
        return message.channel.send(
          Embed.error('You have to mention a valid channel!').setAuthor('Error')
        );
      }

      await args.shift();
      const userMsg = args.join(' ');

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

      let formDetails;

      await JF.form
        .getForm(formId)
        .then((res) => {
          formDetails = res.content;
        })
        .catch((err) => {
          console.log(err);
          return message.channel.send(
            Embed.error(
              "  This form does not exist or doesn't belong to you!"
            ).setAuthor('Error')
          );
        });

      let createEmbed;

      if (userMsg) {
        createEmbed = Embed.success(`${userMsg}`)
          .setAuthor(`${formDetails.title}`)
          .addField('Submit From Here:', `${formDetails.url}`);
      } else {
        createEmbed = Embed.success(
          `Hey @here, ${message.author.username} has a form that you might interested with.`
        )
          .setAuthor(`${formDetails.title}`)
          .addField('Submit From Here:', `${formDetails.url}`);
      }

      return formChannel.send(createEmbed);
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
