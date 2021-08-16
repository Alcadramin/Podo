'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.User = void 0;
var User = /** @class */ (function () {
  function User(client) {
    var _this = this;
    /**
     * Get user account details for this JotForm user. Including user account type, avatar URL, name, email, website URL and account limits.
     */
    this.getUser = function () {
      return _this.client.Request('GET', '/user');
    };
    /**
     * Get number of form submissions received this month. Also, get number of SSL form submissions, payment form submissions and upload space used by user.
     */
    this.getUsage = function () {
      return _this.client.Request('GET', '/user/usage');
    };
    /**
     * Get a list of forms for this account. Includes basic details such as title of the form, when it was created, number of new and total submissions.
     */
    this.getForms = function () {
      return _this.client.Request('GET', '/user/forms');
    };
    /**
     * Get a list of all submissions for all forms on this account. The answers array has the submission data. Created_at is the date of the submission.
     * @param offset Start of each result set for submission data. Useful for pagination. Default: 0.
     * @param limit Number of results in each result set for submission data. Default is 20.
     * @param filter Filters the query results to fetch a specific submissions range. Example: {"created_at:gt":"2013-01-01 00:00:00"} Example: {"formIDs":["your-form-id","your-form-id#2"]} Example: {"fullText":"John Brown"}
     * @param orderby Order results by a submission field name: id, form_id, IP, created_at, status, new, flag, updated_at.
     * @param direction ASC (ascending) or DESC (descending)
     * @param nocache No cache. True | False.
     */
    this.getSubmissions = function (
      offset,
      limit,
      filter,
      orderby,
      direction,
      nocache
    ) {
      return _this.client.Request(
        'GET',
        '/user/submissions?filter=' +
          (filter || '') +
          '&offset=' +
          (offset || '') +
          '&limit' +
          (limit || '') +
          '&orderby=' +
          (orderby || '') +
          '&nocache=' +
          (nocache || '') +
          '&direction=' +
          (direction || '')
      );
    };
    /**
     * Get a list of sub users for this accounts and list of forms and form folders with access privileges.
     */
    this.getSubusers = function () {
      return _this.client.Request('GET', '/user/subusers');
    };
    /**
     * Get a list of form folders for this account. Returns name of the folder and owner of the folder for shared folders.
     */
    this.getFolders = function () {
      return _this.client.Request('GET', '/user/folders');
    };
    /**
     * Get user's time zone and language.
     */
    this.getSettings = function () {
      return _this.client.Request('GET', '/user/settings');
    };
    /**
     * List of URLS for reports in this account. Includes reports for all of the forms. ie. Excel, CSV, printable charts, embeddable HTML tables.
     */
    this.getReports = function () {
      return _this.client.Request('GET', '/user/reports');
    };
    /**
     * User activity log about things like forms created/modified/deleted, account logins and other operations.
     */
    this.getHistory = function () {
      return _this.client.Request('GET', '/user/history');
    };
    /**
     * Register a new user with username, password and email.
     * @param username Username.
     * @param password Password.
     * @param email Email.
     */
    this.registerUser = function (username, password, email) {
      var params = new URLSearchParams({
        username: username,
        password: password,
        email: email,
      });
      return _this.client.Request('POST', '/user/register', params);
    };
    /**
     * Update user's settings like time zone and language.
     * @param data
     * @example
     * {
     *  name: "Name",
     *  email: "name@example.com",
     *  website: "http://example.com",
     *  time_zone: "Europe/Istanbul",
     *  company: "Company",
     *  securityQuestion: "Super Secret Secutiy Question?",
     *  securityAnswer: "Ultra Secret Answer",
     *  industry: "Tech",
     * }
     */
    this.updateUserSettings = function (data) {
      var params = new URLSearchParams(data);
      return _this.client.Request('POST', '/user/settings', params);
    };
    this.client = client;
  }
  return User;
})();
exports.User = User;
