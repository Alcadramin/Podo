const { Command, Embed } = require('../../../lib');

const wait = (time) => new Promise((r) => setTimeout(r, time));
module.exports = class Ping extends Command {
  constructor() {
    super('ping', {
      aliases: ['check'],
      description: 'Returns the bot latency and the API latency.',
    });
  }

  async run(message, args) {
    const { Sentry } = require('../../events/ready');

    try {
      const msg = await message.channel.send('Ok getting the ping!');
      await wait(2000);
      const pingEmbed = message.embed
        .setTitle('Bot Ping')
        .addField(
          'Bot Latency',
          `${Math.floor(msg.createdTimestamp - message.createdTimestamp)}ms`,
          true
        )
        .addField('API Latency', `${Math.round(this.bot.ws.ping)}ms`, true)
        .setThumbnail(message.guild.iconURL({ dynamic: true }));

      await msg.edit('Here, got the ping for you:', pingEmbed);
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
