const { Command, Embed } = require('../../../lib');

// Change 'Template' to Command name.
module.exports = class Template extends Command {
  constructor() {
    // change 'template' to command name use camelCase
    super('template', {
      description: 'Command description',
      perms: ['ADMINISTRATOR'],
      usage: '<Required Value> [Optional Value]', // <required> [optional] ARGUMENTS WILL GO HERE!
    });
  }

  // You can use [key, ...args] if you need key then args || [...args] or args if you just need arguments
  // [..args] will give you all arguments as an array
  // args is just singulary you've to use it like args[0], args[1]
  async run(message, [key, ...args]) {
    // All of your package imports will go here!
    const { Sentry } = require('../../events/ready');
    // If you need client from Discord.Client() import following line here
    // const { bot } = require('../../events/ready'); and use as bot

    try {
      // Put everything related to command here don't delete Try Catch that's for error handling.
      message.channel.send(Embed.success('Hello World!'));
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
