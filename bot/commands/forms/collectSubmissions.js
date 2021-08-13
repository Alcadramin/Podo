const { Command, Embed } = require('../../../lib');

// Change 'Template' to Command name.
module.exports = class collectSubmissions extends Command {
  constructor() {
    super('collectsubmissions', {
      description: 'Collect submissions in realtime with Webhooks.',
      usage: '<Channel> <Form ID>',
    });
  }

  async run(message, [key, ...args]) {
    const userModel = require('../../../lib/models/User');
    const { bot, Sentry } = require('../../events/ready');
    const fetch = require('node-fetch');

    try {
      const user = await userModel.findOne({ userId: message.author.id });
      const apiKey = await user.decryptKey(user.apiKey);

      if (!apiKey) {
        return message.channel.send(
          Embed.error(
            'You should login first! You can login with `login` command!'
          ).setAuthor('Error')
        );
      }

      if (!message.author.hasPermission('MANAGE_WEBHOOKS')) {
        return message.channel.send(
          Embed.error(':x: You are not authorized to do this!')
        );
      }

      if (message.guild.me.hasPermission('MANAGE_WEBHOOKS')) {
        return message.channel.send(
          Embed.error(':x: I have not been allowed to make webhooks!')
        );
      }

      // Giveaway channel
      let submissionChannel = message.mentions.channels.first();
      // If no channel is mentionned
      if (!submissionChannel) {
        return message.channel.send(
          Embed.error(':x: You have to mention a valid channel!')
        );
      }

      const formId = args[1];

      const channel = bot.channels.cache.get(submissionChannel);
      let formName = '';

      await fetch(`https://api.jotform.com/form/${formId}`, {
        method: 'GET',
        headers: {
          APIKEY: apiKey,
        },
      })
        .then((res) => res.json())
        .then((res) => {
          formName = res.content.title;
        });

      channel
        .createWebhook(formName, {
          avatar:
            'https://www.jotform.com/resources/assets/logo/jotform-icon-white-280x280.jpg',
        })
        .then((webhook) => {
          await fetch(`https://api.jotform.com/form/${formId}/webhooks`, {
            method: 'POST',
            headers: {
              APIKEY: apiKey,
            },
            body: JSON.stringify({
              webhookURL: webhook,
            }),
          })
            .then((res) => res.json())
            .then((res) => {
              if (json.responseCode === 401) {
                return message.channel.send(
                  Embed.error(`${json.message}`).setAuthor('Error').addFields({
                    name: 'Error',
                    value: 'Something went wrong. Please try again.',
                    inline: false,
                  })
                );
              } else {
                return message.channel.send(
                  Embed.success(
                    `Webhook successfully created, you will recieve submissions here!`
                  )
                );
              }
            });
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
