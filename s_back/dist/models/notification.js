"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.notificationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.notificationSchema = new mongoose_1.Schema({
    last_date: Date,
    user_id: String,
    alarm: {
        _id: mongoose_1.Schema.Types.ObjectId,
        buildings: {
            type: Array,
        },
        type: {
            type: String,
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
    },
    seen: Boolean,
    seen_at: Date,
    value: Number,
    buildingName: String,
}, {
    timestamps: true
});
exports.Notification = mongoose_1.model('Notification', exports.notificationSchema, 'notification');
