const mongoose = require('mongoose');
require('dotenv').config();

const guildSchema = new mongoose.Schema({
  id: String,
  prefix: String,
});

const guildModel = mongoose.model('Guild', guildSchema);

module.exports = guildModel;
