const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: String,
  formId: String,
  formName: String,
  channelId: String,
});

const submissionModel = mongoose.model('submission', submissionSchema);

module.exports = submissionModel;
