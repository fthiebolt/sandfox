"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataModel = exports.dataSchema = void 0;
const mongoose_1 = require("mongoose");
exports.dataSchema = new mongoose_1.Schema({
    name: String,
    value: Number,
    date: Date
}, {
    strict: false
});
/**
 * @deprecated Used with mongo
 */
function dataModel(type) {
    return mongoose_1.model('Data', exports.dataSchema, type);
}
exports.dataModel = dataModel;
