const { searchQuery } = require('./utils');
const userModel = require('./models/User');

module.exports.UserModel = userModel;
module.exports = {
  Bot: require('./client/Bot'),
  Command: require('./handlers/Command'),
  Embed: require('./handlers/Embed'),
  BotEvent: require('./handlers/Event'),
  searchQuery,
};
