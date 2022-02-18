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
exports.User = exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("bcrypt");
exports.userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    activated: {
        type: Boolean,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    phone_number: String,
    attempts: Number
}, {
    timestamps: true
});
exports.userSchema.pre('save', function protectPassword(next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (this.isModified('password')) {
                this.password = yield bcrypt_1.hash(this.password, yield bcrypt_1.genSalt(10));
            }
            next();
        }
        catch (err) {
            if (process.env.DEBUG === 'true') {
                console.log(err);
            }
        }
    });
});
exports.userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield bcrypt_1.compare(candidatePassword, this.password);
        }
        catch (err) {
            if (process.env.DEBUG === 'true') {
                console.log(err);
            }
        }
        return false;
    });
};
exports.User = mongoose_1.model('Users', exports.userSchema, 'users');
// export = User;
