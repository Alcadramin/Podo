const { Command, Embed } = require('../../../lib');

module.exports = class Prefix extends Command {
  constructor() {
    super('prefix', {
      description: 'Allows you to change the bot prefix.',
      perms: ['ADMINISTRATOR'],
      usage: '<New Value>',
    });
  }

  async run(message, [key, ...args]) {
    const { Sentry } = require('../../events/ready');

    try {
      if (!key) return message.sm(`Please input the new prefix value!`);

      message.guild.db.prefix = key;
      message.guild.db.save().catch(console.log);

      message.sm(`Server prefix changed to \`${key}\`!`);
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
