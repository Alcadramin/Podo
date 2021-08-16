'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Report = void 0;
var Report = /** @class */ (function () {
  function Report(client) {
    var _this = this;
    /**
     * Get more information about a data report.
     * @param reportId Report ID.
     */
    this.getReport = function (reportId) {
      return _this.client.Request('GET', '/report/' + reportId);
    };
    /**
     * Delete an existing report.
     * @param reportId Report ID.
     */
    this.deleteReport = function (reportId) {
      return _this.client.Request('DELETE', '/report/' + reportId);
    };
    this.client = client;
  }
  return Report;
})();
exports.Report = Report;
