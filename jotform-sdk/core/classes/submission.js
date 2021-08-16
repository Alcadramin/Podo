'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Submission = void 0;
var Submission = /** @class */ (function () {
  function Submission(client) {
    var _this = this;
    /**
     * Similar to **getFormSubmissions**. But only get a single submission.
     * @param submissionId Submission ID.
     */
    this.getSubmission = function (submissionId) {
      return _this.client.Request('GET', '/submission/' + submissionId);
    };
    /**
     * Edit a single submission.
     * @param submissionId Submission ID.
     * @param data Submission data.
     */
    this.editSubmission = function (submissionId, data) {
      return _this.client.Request('POST', '/submission/' + submissionId, data);
    };
    /**
     * Delete a single submission.
     * @param submissionId Submission ID.
     */
    this.deleteSubmission = function (submissionId) {
      return _this.client.Request('DELETE', '/submission/' + submissionId);
    };
    this.client = client;
  }
  return Submission;
})();
exports.Submission = Submission;
