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
exports.UserController = void 0;
const express_1 = require("express");
const models_1 = require("../models");
const utils_1 = require("../auth/utils");
class UserController {
    constructor(path) {
        this.path = path;
        this.router = express_1.Router();
        this.initializeRouter();
    }
    initializeRouter() {
        // GET admin /api/users users list
        this.router.get(this.path + "s", this.getAllUsers.bind(this));
        // GET admin /api/user/:id user details
        this.router.get(this.path + "/:id", this.getUser.bind(this));
        // PUT admin /api/user/:id with {user}
        this.router.put(this.path + "/:id", this.updateUser.bind(this));
        // DELETE admin /api/user/:id 
        this.router.delete(this.path + "/:id", this.deleteUser.bind(this));
    }
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const user = JSON.parse(req.headers.authorization);
                if (user.role !== "administrator") {
                    throw new Error("User don't have the admin permissions.");
                }
                const users = yield models_1.User.find({});
                res.json(yield Promise.all(users.map(user => ({
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    phone_number: user.phone_number,
                    activated: user.activated
                }))));
            }
            catch (err) {
                res.status(404).json({ message: "You don't have the permissions" });
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new Error();
                }
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const user = JSON.parse(req.headers.authorization);
                if (user.role !== "administrator") {
                    throw new Error("User don't have the admin permissions.");
                }
                const requestedUser = yield models_1.User.findById(id);
                if (!requestedUser) {
                    res.status(404).json({ message: "User not found." });
                    return;
                }
                res.json({
                    id: requestedUser._id,
                    username: requestedUser.username,
                    email: requestedUser.email,
                    first_name: requestedUser.first_name,
                    last_name: requestedUser.last_name,
                    role: requestedUser.role,
                    phone_number: requestedUser.phone_number,
                    activated: requestedUser.activated
                });
            }
            catch (err) {
                console.log(err);
                res.status(404).json({ message: "You don't have the permissions" });
            }
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new Error();
                }
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const user = JSON.parse(req.headers.authorization);
                if (user.role !== "administrator") {
                    throw new Error("User don't have the admin permissions.");
                }
                const { username, email, first_name, last_name, role, phone_number, activated } = req.body;
                const userToUpdate = yield models_1.User.findById(id);
                if (!userToUpdate) {
                    throw new Error('User is not found');
                }
                Object.assign(userToUpdate, {
                    username: username.toString().toLowerCase(),
                    email: email.toString().toLowerCase(),
                    first_name: first_name.toString().toLowerCase(),
                    last_name: last_name.toString().toLowerCase(),
                    role: role.toString().toLowerCase(),
                    phone_number: phone_number ? phone_number.toString().toLowerCase() : undefined,
                    activated
                });
                yield utils_1.validateUser(userToUpdate.toObject());
                yield userToUpdate.save();
                res.json({ message: "success" });
            }
            catch (err) {
                res.status(404).json({ message: err.message });
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new Error();
                }
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const user = JSON.parse(req.headers.authorization);
                if (user.role !== "administrator") {
                    throw new Error("User don't have the admin permissions.");
                }
                // delete all alarms and token 
                // TODO: Delete notifications
                yield models_1.UserVerificationToken.deleteMany({ user_id: id });
                yield models_1.Alarm.deleteMany({ user_id: id });
                yield models_1.User.findByIdAndDelete(id);
                res.json({ message: 'success' });
            }
            catch (err) {
                res.status(503).json({ message: "internal server error" });
            }
        });
    }
}
exports.UserController = UserController;
