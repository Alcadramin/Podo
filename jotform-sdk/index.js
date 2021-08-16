'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.JotForm = void 0;
var client_1 = require('./core/client');
var user_1 = require('./core/classes/user');
var form_1 = require('./core/classes/form');
var submission_1 = require('./core/classes/submission');
var report_1 = require('./core/classes/report');
var folder_1 = require('./core/classes/folder');
var system_1 = require('./core/classes/system');
var JotForm = /** @class */ (function () {
  function JotForm() {
    var _this = this;
    /**
     * @param apiKey Your personal API key.
     */
    this.setApiKey = function (apiKey) {
      _this.client.setApiKey(apiKey);
    };
    this.client = new client_1.Client();
    this.user = new user_1.User(this.client);
    this.form = new form_1.Form(this.client);
    this.submission = new submission_1.Submission(this.client);
    this.report = new report_1.Report(this.client);
    this.folder = new folder_1.Folder(this.client);
    this.system = new system_1.System(this.client);
  }
  return JotForm;
})();
exports.JotForm = JotForm;
