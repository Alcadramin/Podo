const { Command, Embed } = require('../../../lib');

module.exports = class Logout extends Command {
  constructor() {
    super('logout', {
      description: 'Logout from your account.',
    });
  }

  async run(message, [key, ...args]) {
    const { Sentry } = require('../../events/ready');
    const userModel = require('../../../lib/models/User');

    try {
      await userModel
        .findOneAndDelete({ userId: message.author.id })
        .then(() => {
          return message.channel.send(
            Embed.success('You are logged out successfully.').setAuthor(
              'Logged out.'
            )
          );
        })
        .catch((err) => {
          console.log(err);
          Sentry.captureException(err);
          return message.channel.send(
            Embed.error(
              ' \u274E Something went wrong. Please try again.'
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
