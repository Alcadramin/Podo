const { Command, Embed } = require('../../../lib');

module.exports = class Purge extends Command {
  constructor() {
    super('purge', {
      description: 'Purges the messages by given number.',
      perms: ['ADMINISTRATOR'],
      usage: '[1-100]',
    });
  }

  async run(message, args) {
    const { Sentry } = require('../../events/ready');

    try {
      if (!message.member.hasPermission('ADMINISTRATOR'))
        return message.channel.send(
          Embed.error(
            "Sorry, you don't have permissions to use this!",
            'ADMINISTRATOR'
          )
        );
      const deleteCount = parseInt(args[0], 10);

      if (!deleteCount || deleteCount < 1 || deleteCount > 100)
        return message.channel.send(
          Embed.error(
            'Please provide a number between 1 and 100 for the number of messages to delete'
          )
        );

      const fetched = await message.channel.messages.fetch({
        limit: deleteCount,
      });

      message.channel
        .send(
          Embed.success(
            fetched.size +
              ` deleted messages by **${message.author.tag}**. This message will delete itself in 30 seconds.`
          )
        )
        .then((msg) => {
          msg.delete({ timeout: 3 * 1000 });
        })
        .catch((err) => {
          const errorId = Sentry.captureException(err);

          return message.channel.send(
            Embed.error(
              `🐞 Something went wrong, please tell the support server the error ID: \`${errorId}\``
            )
          );
        });

      message.channel.bulkDelete(fetched, true).catch((err) => {
        const errorId = Sentry.captureException(err);

        return message.channel.send(
          Embed.error(
            `🐞 Something went wrong, please tell the support server the error ID: \`${errorId}\``
          )
        );
      });
    } catch (err) {
      const errorId = Sentry.captureException(err);

      return message.channel.send(
        Embed.error(
          `🐞 Something went wrong, please tell the support server the error ID: \`${errorId}\``
        )
      );
    }
  }
};
