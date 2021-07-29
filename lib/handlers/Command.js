module.exports = class Command {
  constructor(
    name,
    options = {
      aliases: [],
      description: 'None',
      usage: 'None',
      perms: [],
      botPerms: [],
    }
  ) {
    this.name = name;
    this.aliases = options.aliases || [];
    this.description = options.description || 'No description yet!';
    this.usage = options.usage || 'None';
    this.perms = options.perms || [];
    this.botPerms = options.botPerms || [];
  }

  run(message) {
    message.error(`This command is not exist!`);
  }
};
