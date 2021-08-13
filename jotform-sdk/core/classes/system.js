"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = void 0;
var System = /** @class */ (function () {
    function System(client) {
        var _this = this;
        /**
         * Get limit and prices of a plan.
         * @param plan  Name of the requested plan. Must be one of the following: | **FREE** | **BRONZE** | **SILVER** | **GOLD** | **PLATINUM** |
         */
        this.getPlans = function (plan) {
            return _this.client.Request('GET', "/system/plan/" + plan);
        };
        this.client = client;
    }
    return System;
}());
exports.System = System;
