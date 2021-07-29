const { Schema, model } = require('mongoose');
const { AES } = require('crypto-js');
require('dotenv').config();

const userSchema = new Schema({
  discordId: String,
  username: String,
  apiKey: String,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('apiKey')) {
    return next();
  }

  try {
    const encrypted = AES.encrypt(this.apiKey, process.env.AES_SECRET);
    this.apiKey = encrypted;

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.decryptKey = function () {
  const encrypted = this.apiKey;
  return new Promise((resolve, reject) => {
    const decypt = AES.decrypt(encrypted, process.env.AES_SECRET);
    if (!decypt) {
      reject();
    } else {
      resolve(decypt);
    }
  });
};

const userModel = new model('user', userSchema);
module.exports = userModel;
