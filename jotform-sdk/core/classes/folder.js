"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Folder = void 0;
var Folder = /** @class */ (function () {
    function Folder(client) {
        var _this = this;
        /**
         * Get a list of forms in a folder, and other details about the form such as folder color.
         * @param folderId Folder ID.
         */
        this.getFolder = function (folderId) {
            return _this.client.Request('GET', "/folder/" + folderId);
        };
        this.client = client;
    }
    return Folder;
}());
exports.Folder = Folder;
