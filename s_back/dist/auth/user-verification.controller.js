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
exports.UserVerificationController = void 0;
const express_1 = require("express");
const user_verification_1 = require("../models/user_verification");
const user_1 = require("../models/user");
class UserVerificationController {
    constructor(path) {
        this.path = path;
        this.router = express_1.Router();
        this.initializeRouter();
    }
    initializeRouter() {
        // Post /auth/confirme?user_id=:id&token=:token
        this.router.get(this.path, this.validateUserAccount.bind(this));
    }
    validateUserAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id, token } = req.query;
                if (!(user_id && token)) {
                    throw new Error('Missing attributes');
                }
                const userVerificationToken = yield user_verification_1.UserVerificationToken.findOne({ user_id, token });
                if (!userVerificationToken) {
                    throw new Error('Can\'t find the token in the db.');
                }
                // Else success
                const user = yield user_1.User.findById(user_id);
                if (!user) {
                    throw new Error('User doesn\'t exist anymore');
                }
                // Activate the user account
                const resp = yield user_1.User.findByIdAndUpdate(user._id, { activated: true });
                if (!resp) {
                    throw new Error();
                }
                // Delete the verification token
                yield user_verification_1.UserVerificationToken.findOneAndDelete({ token });
                // Redirect to the home page with success message
                res.redirect(process.env.FRONT_HOST + '/' + process.env.FRONT_HOME + '/?success=Votre compte a été validé avec succes');
            }
            catch (err) {
                res.status(404).json({ message: 'Failed to verify the user' });
                if (process.env.DEBUG === 'true') {
                    console.log(err);
                }
            }
        });
    }
}
exports.UserVerificationController = UserVerificationController;
