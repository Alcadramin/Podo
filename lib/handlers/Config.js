require('dotenv').config();

module.exports = class Config {
  constructor() {
    this.token = process.env.BOT_TOKEN;
    this.db = process.env.MONGODB_CONNECTION_STRING;
  }

  getToken() {
    return this.token;
  }

  getDb() {
    return this.db;
  }
};
