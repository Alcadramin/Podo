const ascii = require('ascii-table');
const { readdirSync } = require('fs');

module.exports = class Handler {
  constructor(bot) {
    this.bot = bot;
  }

  loadCommand(dir) {
    console.log(`
      ##  #######  ######## ########  #######  ########  ##     ##
      ## ##     ##    ##    ##       ##     ## ##     ## ###   ###
      ## ##     ##    ##    ##       ##     ## ##     ## #### ####
      ## ##     ##    ##    ######   ##     ## ########  ## ### ##
##    ## ##     ##    ##    ##       ##     ## ##   ##   ##     ##
##    ## ##     ##    ##    ##       ##     ## ##    ##  ##     ##
 ######   #######     ##    ##        #######  ##     ## ##     ##
    `);

    const table = new ascii('Commands').setHeading('Name', 'Status');
    const categories = readdirSync(dir).filter((f) => !f.endsWith('.js'));

    categories.forEach((cat) => {
      readdirSync(`${dir}/${cat}`)
        .filter((f) => f.endsWith('.js'))
        .forEach((file) => {
          try {
            let cmd = require(`${dir}/${cat}/${file}`); // Get the file
            cmd = new cmd(); // Create a new command instance

            cmd.bot = this.bot; // Make bot easy to access from command file
            cmd.category = cat; // Set command category

            // Add the file to the commands collection
            this.bot.commands.set(cmd.name, cmd);
            table.addRow(file, '✅ Running!');
          } catch (e) {
            table.addRow(file, `❌ Couldn't Load => ${e}!`);
          }
        });
    });
    console.log(table.toString());
  }

  loadEvents(dir) {
    const table = new ascii('Events').setHeading('Name', 'Status');

    readdirSync(dir)
      .filter((f) => f.endsWith('.js'))
      .forEach((file) => {
        try {
          let evt = require(`${dir}/${file}`); // Get the file
          evt = new evt(); // Create a new event instance

          // Run the events on bot instance
          this.bot.on(evt.event, evt.run.bind(null, this.bot));
          table.addRow(file, '✅ Running!');
        } catch (e) {
          table.addRow(file, `❌ Couldn't Load => ${e}!`);
        }
      });
    console.log(table.toString());
  }

  getCommand(cmd) {
    return (
      this.bot.commands.find(
        (c) => c.name.toLowerCase() === cmd || c.aliases.includes(cmd)
      ) || null
    );
  }
};
