"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = exports.unitSchema = exports.UnitConv = void 0;
const mongoose_1 = require("mongoose");
/**
 */
class UnitConv {
    constructor(type) {
        this.type = type;
        this.unit = this.convert(type);
    }
    convert(type) {
        //TODO
        switch (type) {
            case "Electricité":
                return "KwH";
            case "Calorie":
                return "Kcal";
            case "Air_comprimé":
                return "m\u00B3/h";
            default:
                return "?";
        }
    }
    getUnit() {
        return this.unit;
    }
    getType() {
        return this.type;
    }
}
exports.UnitConv = UnitConv;
exports.unitSchema = new mongoose_1.Schema({
    type: String,
    unit: String
});
exports.Unit = mongoose_1.model("Unit", exports.unitSchema, "unit");
