const { Client, Collection } = require('discord.js');
const Handler = require('./Handler');
const Config = require('../handlers/Config');
const mongoose = require('mongoose');
const path = require('path');
require('../extended/Message')();

module.exports = class Bot extends Client {
  constructor() {
    super();

    this.config = new Config();
    this.handler = new Handler(this);
    this.commands = new Collection();
  }

  async load(
    { commands, events } = {
      commands: path.join(__dirname + './../../bot/commands'),
      events: path.join(__dirname + './../../bot/events'),
    }
  ) {
    this.handler.loadCommand(commands);
    this.handler.loadEvents(events);

    await mongoose.connect(this.config.getDb(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.on('error', (err) => {
      throw new Error(err);
    });
    console.log('Connected to MongoDB!');

    super
      .login(this.config.getToken())
      .then(() => {
        console.log(`${this.user.username} is now online!`);
      })
      .catch((err) => {
        throw new Error(err);
      });
  }
};
