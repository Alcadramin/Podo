const { Structures, MessageEmbed } = require('discord.js');
const { searchQuery } = require('./../utils');

module.exports = () =>
  Structures.extend(
    'Message',
    (Message) =>
      class extends Message {
        sm(content = 'No content') {
          return this.channel.send(new MessageEmbed().setDescription(content));
        }

        findChannels(channel) {
          return (
            this.mentions.channels.first() ||
            this.guild.channels.cache.find(
              (m) => m.name === channel || m.id === channel
            ) ||
            null
          );
        }

        get embed() {
          return new MessageEmbed()
            .setFooter(
              this.client.user.username,
              this.client.user.displayAvatarURL()
            )
            .setTimestamp();
        }

        async findMember(query = '') {
          if (this.mentions.members.first())
            return this.mentions.members.first();
          if (this.mentions.users.first() && !this.mentions.members.first()) {
            return await this.guild.members.fetch(this.mentions.users.first());
          }
          return (
            this.guild.members.cache.get(query) ||
            this.guild.members.cache.find((x) =>
              searchQuery(query, x.user.username)
            ) ||
            null
          );
        }

        comparePosition(member) {
          return (
            this.member.roles.highest.position > member.roles.highest.position
          );
        }
      }
  );
