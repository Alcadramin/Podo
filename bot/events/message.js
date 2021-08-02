const { BotEvent } = require('../../lib');

module.exports = class MessageEvent extends BotEvent {
  constructor() {
    super('message');
  }

  async run(bot, message) {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.member) await message.guild.members.fetch(message.author);

    // Database and Prefix
    if (!message.guild.db) await message.guild.setDB();
    const prefix = message.guild.db.prefix;

    // A safety check
    if (!message.guild.me.hasPermission('SEND_MESSAGES')) return;

    // Reply To Mention, but only if they user ONLY mentions the bot
    if (message.content.match(new RegExp(`<@!?${bot.user.id}>`)))
      await message.channel.send(
        message.embed
          .setDescription(`Use \`${prefix}help\` for more help!`)
          .setColor(bot.hex)
      );

    // Declaring arguments, checking if the message starts with the prefix and declaring the cmd
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    // Trying to get the command
    const command = bot.handler.getCommand(cmd);
    if (!command) return;

    if (
      // Check user permissions
      command.perms.every((p) =>
        message.member.hasPermission(p, {
          checkAdmin: true,
          checkOwner: true,
        })
      ) &&
      // Check bot permissions
      command.botPerms.every((p) =>
        message.guild.me.hasPermission(p, { checkAdmin: true })
      )
    ) {
      // Run The Command
      command.run(message, args);
    } else {
      let perms = message.embed
        .setTitle(`Not Enough Permissions`)
        .setColor('#d94337')
        .addField(
          'User Perms',
          `Users need the following permission(s) to run this command: ${
            command.perms.length
              ? command.perms.map((x) => `\`${x}\``).join(' | ')
              : `NONE`
          }`
        )
        .addField(
          'Bot Perms',
          `I need the following permission(s) to run this command: ${
            command.botPerms.length
              ? command.botPerms.map((x) => `\`${x}\``).join(' | ')
              : `NONE`
          }`
        );
      await message.channel.send(perms);
    }
  }
};
