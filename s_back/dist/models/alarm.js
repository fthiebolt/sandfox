"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alarm = exports.alarmSchema = void 0;
const mongoose_1 = require("mongoose");
exports.alarmSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    buildings: {
        type: Array,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    high_level: {
        seuil_min: Number,
        seuil_max: Number,
        required: false
    },
    avg_level: {
        seuil_min: Number,
        seuil_max: Number,
        required: false
    },
    low_level: {
        seuil_min: Number,
        seuil_max: Number,
        required: false
    },
    sms: Boolean,
    email: Boolean,
    notification: Boolean
}, {
    timestamps: true
});
exports.alarmSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified()) {
            this.type = this.type.toString();
            this.buildings = yield Promise.all(this.buildings.map(building => building.toString()));
        }
        this.sms = this.sms ? true : false;
        this.email = this.email ? true : false;
        this.notification = this.notification ? true : false;
        next();
    });
});
exports.Alarm = mongoose_1.model('Alarms', exports.alarmSchema, 'alarms');
