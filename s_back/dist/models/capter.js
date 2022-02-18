"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capterModel = exports.capterSchema = void 0;
const mongoose_1 = require("mongoose");
exports.capterSchema = new mongoose_1.Schema({
    capter_id: String,
    name: String
});
/**
 * @deprecated used with mongo
 */
function capterModel(type) {
    return mongoose_1.model('Capters', exports.capterSchema, `${type}_capters_list`);
}
exports.capterModel = capterModel;
