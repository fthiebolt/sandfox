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
exports.AuthController = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = require("jsonwebtoken");
const login_controller_1 = require("./login.controller");
const user_1 = require("../models/user");
const signup_controller_1 = require("./signup.controller");
const user_verification_controller_1 = require("./user-verification.controller");
const reset_controller_1 = require("./reset.controller");
const ping_controller_1 = require("./ping.controller");
class AuthController {
    constructor(path, secureGetPaths = [], securePostPaths = [], securePutPaths = [], secureDeletePaths = [], mailer) {
        this.path = path;
        this.secureGetPaths = secureGetPaths;
        this.securePostPaths = securePostPaths;
        this.securePutPaths = securePutPaths;
        this.secureDeletePaths = secureDeletePaths;
        this.mailer = mailer;
        this.router = express_1.Router();
        this.initializeControllers();
        this.securePaths();
        this.initializeRouter();
    }
    initializeControllers() {
        this.loginController = new login_controller_1.LoginController(`${this.path}/login`);
        this.signupController = new signup_controller_1.SignupController(`${this.path}/register`, `${this.path}/confirme`, this.mailer);
        this.userVerificationControllre = new user_verification_controller_1.UserVerificationController(`${this.path}/confirme`);
        this.resetController = new reset_controller_1.ResetController(`${this.path}/reset`, this.mailer);
        this.pingController = new ping_controller_1.PingController(`${this.path}/ping`);
    }
    initializeRouter() {
        // protected paths
        // controllers routes
        this.router.use(this.loginController.router);
        this.router.use(this.signupController.router);
        this.router.use(this.userVerificationControllre.router);
        this.router.use(this.resetController.router);
        this.router.use(this.pingController.router);
    }
    checkAuth(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.headers.authorization) {
                    throw 'Missing authorization header';
                }
                const token = req.headers.authorization.split(' ')[1];
                let payload = Object(jsonwebtoken_1.decode(token));
                const user = yield user_1.User.findOne({ username: payload.user.username });
                if (!user) {
                    throw 'Username not found in the db.';
                }
                payload = Object(yield jsonwebtoken_1.verify(token, user.password));
                // User contains the password (from the db)
                req.headers.authorization = JSON.stringify(user);
                next();
            }
            catch (err) {
                res.status(403).json({ message: 'Not autheticated' });
                if (process.env.DEBUG === 'true') {
                    console.log(err);
                }
            }
        });
    }
    securePaths() {
        this.secureGetPaths.forEach(path => this.router.get(path + "*", this.checkAuth));
        this.securePostPaths.forEach(path => this.router.post(path + "*", this.checkAuth));
        this.securePutPaths.forEach(path => this.router.put(path + "*", this.checkAuth));
        this.secureDeletePaths.forEach(path => this.router.delete(path + "*", this.checkAuth));
    }
}
exports.AuthController = AuthController;
