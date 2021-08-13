"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
var axios_1 = __importDefault(require("axios"));
var Client = /** @class */ (function () {
    function Client() {
        var _this = this;
        this.setAxios = function () {
            axios_1.default.defaults.baseURL = 'https://api.jotform.com';
        };
        this.setApiKey = function (apiKey) {
            axios_1.default.defaults.headers = __assign(__assign({}, _this.defaultHeaders), { APIKEY: apiKey });
        };
        this.Request = function (method, path, data) {
            return new Promise(function (resolve, reject) {
                axios_1.default({
                    url: path,
                    method: method,
                    data: data,
                })
                    .then(function (response) {
                    if (response.data.responseCode !== 200) {
                        reject(response.data.message);
                    }
                    resolve(response.data);
                })
                    .catch(function (error) { return reject(error.response.data); });
            });
        };
        this.defaultHeaders = {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            timeout: 20000,
        };
        this.setAxios();
    }
    return Client;
}());
exports.Client = Client;
