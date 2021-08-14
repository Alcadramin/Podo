const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  formId: String,
  channelId: String,
});

const submissionModel = mongoose.model('submission', submissionSchema);

module.exports = submissionModel;
