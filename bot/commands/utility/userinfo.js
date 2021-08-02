const { Command, Embed } = require('../../../lib');

module.exports = class Userinfo extends Command {
  constructor() {
    super('userinfo', {
      description:
        "Fetches and displays user info. It will fetch your info if you don't mention someone.",
      perms: [],
      usage: '[mention]',
    });
  }

  async run(message, [key, ...args]) {
    const { Sentry } = require('../../events/ready');

    try {
      const user = message.mentions.users.first() || message.member.user;
      const member = message.guild.members.cache.get(user.id);

      return message.channel.send(
        Embed.success('')
          .setAuthor(`User info for ${user.username}`, user.displayAvatarURL())
          .addFields(
            {
              name: 'User Tag',
              value: user.tag,
              inline: true,
            },
            {
              name: 'Nickname',
              value: member.nickname || 'None',
              inline: true,
            },
            {
              name: 'ID',
              value: member.id,
              inline: true,
            },
            {
              name: 'Joined Server',
              value: new Date(member.joinedTimestamp).toLocaleDateString(),
              inline: true,
            },
            {
              name: 'Joined Discord',
              value: new Date(user.createdTimestamp).toLocaleDateString(),
              inline: true,
            },
            {
              name: 'Roles',
              value: member.roles.cache.size - 1,
              inline: true,
            },
            {
              name: 'Is Bot',
              value: user.bot ? 'Yes' : 'No',
            }
          )
      );
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
