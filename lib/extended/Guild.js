const { Structures } = require('discord.js');
const guildModel = require('../models/Guild');

module.exports = () =>
  Structures.extend(
    'Guild',
    (Guild) =>
      class extends Guild {
        constructor() {
          super(...arguments);
          this.database;
          this.setDB();
        }

        async setDB() {
          await guildModel.findOne({ id: this.id }).then((guild) => {
            this.database =
              guild ||
              new guildModel({
                id: this.id,
                prefix: '.',
              });
          });
        }

        get db() {
          return this.database;
        }
      }
  );
