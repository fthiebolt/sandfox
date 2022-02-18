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
exports.LoginController = void 0;
const express_1 = require("express");
const user_1 = require("../models/user");
const jsonwebtoken_1 = require("jsonwebtoken");
class LoginController {
    constructor(path) {
        this.path = path;
        this.router = express_1.Router();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(this.path, this.signin);
    }
    signin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { password, username } = req.body;
                if (!(username && password)) {
                    throw 'Missing username or/and password from request body';
                }
                password = password.toString();
                username = username.toString();
                const user = yield user_1.User.findOne({ username });
                if (!user) {
                    throw 'Username doesn\'t exist in the database';
                }
                if (user.attempts == undefined) {
                    user.attempts = 0;
                    yield user.save();
                }
                if (user.attempts > Number(process.env.MAX_LOGIN_ATTEMP)) {
                    user.activated = false;
                    yield user.save();
                    res.redirect(process.env.FRONT_HOST + '/' + process.env.FRONT_HOME + '/?error=Votre compte a été désactivé, contactez le resposable');
                    return;
                }
                // Check the password
                const isMatch = yield user.comparePassword(password);
                // TODO: Increment attempts if password is incorrect and disactivate the user if it is superieur to process.env.MAX_LOGIN_ATTEMP
                if (!isMatch) {
                    user.attempts++;
                    yield user.save();
                    throw 'Incorrect password';
                }
                if (!user.activated) {
                    res.status(403).json({ message: "Voulliez consulter votre messagerie." });
                    return;
                }
                // Generate a jwt
                let payload = {
                    user: {
                        username: user.username,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        role: user.role
                    }
                };
                const token = jsonwebtoken_1.sign(payload, user.password, { expiresIn: process.env.EXP_DAYS + 'days' });
                res.json({ token });
            }
            catch (err) {
                res.status(403).json({ message: 'Invalide username or password' });
                if (process.env.DEBUG === 'true') {
                    console.log(err);
                }
            }
        });
    }
}
exports.LoginController = LoginController;
