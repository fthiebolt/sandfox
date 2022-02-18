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
exports.ResetController = void 0;
const express_1 = require("express");
const models_1 = require("../models");
const utils_1 = require("./utils");
class ResetController {
    constructor(path, mailer) {
        this.path = path;
        this.mailer = mailer;
        this.router = express_1.Router();
        this.initializeRouter();
    }
    initializeRouter() {
        // GET /api/auth/reset?username="string"
        this.router.get(this.path + '/:id', this.sendResetMail.bind(this));
        // POST /api/auth/reset {new password, token, user_id}
        this.router.post(this.path, this.resetPassword.bind(this));
    }
    /**
     * Send password reset email to the user, need an identified admin user to request the action.
     * @param req
     * @param res
     */
    sendResetMail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const requestOriginUser = JSON.parse(req.headers.authorization);
                if (!(requestOriginUser && requestOriginUser.role === "administrator")) {
                    throw new Error('You don\'t have the permission.');
                }
                const { id } = req.params;
                if (!id) {
                    throw new Error("no id was provided.");
                }
                const user = yield models_1.User.findById(id);
                if (!user) {
                    throw new Error('user not found.');
                }
                // create the password verification token
                const token = yield new models_1.UserVerificationToken({
                    user_id: user._id,
                    token: models_1.UserVerificationToken.schema.methods.randomToken()
                }).save();
                this.mailer.sendResetPassword(user, token);
                res.json({ message: "success" });
            }
            catch (err) {
                res.status(404).json({ message: "Request error" });
                console.log(err);
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { password, user_id, token } = req.body;
                if (!(password && user_id && token)) {
                    throw new Error('Missing attributes.');
                }
                const verificationToken = yield models_1.UserVerificationToken.findOne({ user_id, token });
                if (!verificationToken) {
                    throw new Error('Token not found in the db.');
                }
                // reset the password
                const user = yield models_1.User.findById(user_id);
                if (!user) {
                    throw new Error('User not found in the database');
                }
                user.password = password;
                console.log(user.toObject());
                yield utils_1.validateUser(user.toObject());
                yield user.save();
                verificationToken.remove();
                res.json({ message: "Success" });
            }
            catch (err) {
                res.status(404).json({ message: "Request error" });
                console.log(err);
            }
        });
    }
}
exports.ResetController = ResetController;
