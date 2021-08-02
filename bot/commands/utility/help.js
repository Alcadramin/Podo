const { Command, Embed } = require('../../../lib');

module.exports = class Help extends Command {
  constructor() {
    super('help', {
      aliases: ['h'],
      description: 'Shows command usage and function.',
      usage: '[Command Name]',
    });
  }

  async run(message, args) {
    const { Sentry } = require('../../events/ready');

    try {
      args[0]
        ? getCMD(this.bot, message, args[0].toLowerCase())
        : getAll(this.bot, message);
    } catch (err) {
      console.log(err);
      const errorId = Sentry.captureException(err);

      return message.channel.send(
        Embed.error(
          `🐞 Something went wrong, please tell the support server the error ID: \`${errorId}\``
        )
      );
    }
  }
};

function getAll(bot, message) {
  const helpEmbed = message.embed
    .setTitle('All Commands List')
    .setColor(bot.hex)
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setFooter(
      `${message.guild.db.prefix}help [Command Name] • Doesn't matter if lowercase/uppercase.`,
      bot.user.displayAvatarURL()
    );

  const command = (category) => {
    return bot.commands
      .filter((cmd) => cmd.category === category && cmd.category !== 'admin')
      .map((cmd) => `\`${message.guild.db.prefix}${cmd.name}\``)
      .join(', ');
  };

  let info = bot.commands
    .reduce(
      (acc, val) => (acc.includes(val.category) ? acc : [...acc, val.category]),
      []
    )
    .map((cat) => `**${cat[0].toUpperCase() + cat.slice(1)}**\n${command(cat)}`)
    .reduce((string, category) => string + '\n' + category);

  info = info.split('\n').filter((item) => item !== '**Admin**');
  return message.channel.send(helpEmbed.setDescription(info));
}

function getCMD(bot, message, input) {
  const helpEmbed = message.embed
    .setTitle('Command Help And Info')
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setFooter(
      'Syntax: <> means Required • [] means Optional',
      bot.user.displayAvatarURL()
    );

  let command;

  if (!input.includes('eval')) {
    command = bot.handler.getCommand(input);
  }

  let info = `No info found for the command: ${input.toLowerCase()}!`;

  if (!command) return message.sm(info);

  if (command.name) info = `**Command Name:** \`${command.name}\``;
  if (command.aliases.length)
    info += `\n**Aliases:** ${command.aliases
      .map((a) => `\`${a}\``)
      .join(' | ')}`;
  if (command.description) info += `\n**Description:** ${command.description}`;
  if (command.perms.length)
    info += `\n**User Permissions:** ${command.perms
      .map((a) => `\`${a}\``)
      .join(' | ')}`;
  if (command.botPerms.length)
    info += `\n**Bot Permissions:** ${command.botPerms
      .map((a) => `\`${a}\``)
      .join(' | ')}`;
  if (command.usage)
    helpEmbed.addField('Arguments / Usage: ', `${command.usage}`);

  return message.channel.send(helpEmbed.setDescription(info));
}
