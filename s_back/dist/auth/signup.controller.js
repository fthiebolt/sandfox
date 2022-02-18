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
exports.SignupController = void 0;
const express_1 = require("express");
const models_1 = require("../models");
const utils_1 = require("./utils");
class SignupController {
    constructor(path, userConfirmPath, mailer) {
        this.path = path;
        this.userConfirmPath = userConfirmPath;
        this.mailer = mailer;
        this.router = express_1.Router();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(this.path, this.createAccount.bind(this));
        this.router.get(this.path, (req, res) => {
            res.redirect(process.env.FRONT_HOST + '/' + process.env.FRONT_HOME + '/?success=Votre compte a bien été créé');
        });
    }
    createAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const user = JSON.parse(req.headers.authorization);
                if (user.role !== "administrator") {
                    throw new Error('You don\'t have the permission do perfume this action.');
                }
                const { username, email, first_name, last_name, password, phone_number, role } = req.body;
                if (!(username && email && first_name && last_name && password && role)) {
                    throw new Error('Missing attributes.');
                }
                let userForm = { username, email, first_name, last_name, password, role, activated: false, attempts: 0 };
                // Xss attack security & some input filtration
                userForm = {
                    username: userForm.username.toString().toLowerCase(),
                    email: userForm.email.toString().toLowerCase(),
                    first_name: userForm.first_name.toString().toLowerCase(),
                    last_name: userForm.last_name.toString().toLowerCase(),
                    password: userForm.password.toString(),
                    role: role.toString(),
                    activated: userForm.activated,
                    attempts: userForm.attempts
                };
                if (phone_number) {
                    userForm.phone_number = phone_number.toString();
                }
                const validatedUserForm = yield utils_1.validateUser(userForm).catch(err => {
                    res.status(403).json({ message: err.message });
                });
                // Check if the username or the email already used
                if (yield models_1.User.findOne({ username })) {
                    throw new Error("Utilisateur existe déjà");
                }
                if (yield models_1.User.findOne({ email })) {
                    throw new Error("Cette address mail est déjà utilisé");
                }
                let newUser = new models_1.User(validatedUserForm);
                yield newUser.validate();
                newUser = yield newUser.save().catch(err => { throw new Error('Internal server error'); });
                const token = yield new models_1.UserVerificationToken({
                    user_id: newUser._id,
                    token: models_1.UserVerificationToken.schema.methods.randomToken()
                }).save();
                yield this.mailer.sendVerification(this.userConfirmPath, newUser, token).catch(err => { throw new Error('Internal server error'); });
                res.json({ message: 'Success' });
            }
            catch (err) {
                res.status(403).json({ message: err.message || err });
                if (process.env.DEBUG === 'true') {
                    console.log(err);
                }
            }
        });
    }
}
exports.SignupController = SignupController;
