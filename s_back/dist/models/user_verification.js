"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserVerificationToken = exports.userVerificationSchema = void 0;
const mongoose_1 = require("mongoose");
const crypto_1 = require("crypto");
exports.userVerificationSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    token: String
}, {
    timestamps: true
});
exports.userVerificationSchema.methods.randomToken = () => {
    return crypto_1.randomBytes(32).toString('hex');
};
exports.UserVerificationToken = mongoose_1.model('User verification tokens', exports.userVerificationSchema, 'user_Verification_tokens');
