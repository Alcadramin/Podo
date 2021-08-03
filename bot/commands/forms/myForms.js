const { Command, Embed } = require('../../../lib');

module.exports = class MyForms extends Command {
  constructor() {
    super('myforms', {
      description:
        'Get list of your forms. You can use this command to find form IDs.',
      usage: '',
    });
  }

  async run(message, [key, ...args]) {
    const userModel = require('../../../lib/models/User');
    const { Sentry } = require('../../events/ready');
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

      await fetch('https://api.jotform.com/user/forms', {
        method: 'GET',
        headers: {
          APIKEY: apiKey,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.responseCode === 200) {
            const content = json.content;
            const embed =
              Embed.success(`I got your forms! 🐱`).setAuthor('My Forms');

            content.map((el) => {
              embed.addFields(
                {
                  name: el.title,
                  value: `${el.url} (${el.status})`,
                },
                { name: 'Form ID', value: el.id }
              );
            });

            return message.channel.send(embed);
          }
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
