const mongoose = require('mongoose');
const { AES } = require('crypto-js');

const userSchema = new mongoose.Schema({
  userId: String,
  name: String,
  username: String,
  status: String,
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
    const decrypt = AES.decrypt(encrypted, process.env.AES_SECRET);
    if (!decypt) {
      reject();
    } else {
      resolve(decrypt);
    }
  });
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
