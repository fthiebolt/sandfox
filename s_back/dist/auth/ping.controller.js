"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingController = void 0;
const express_1 = require("express");
class PingController {
    constructor(path) {
        this.path = path;
        this.router = express_1.Router();
        this.initializeRouter();
    }
    initializeRouter() {
        this.router.get(this.path, this.ping.bind(this));
    }
    ping(req, res) {
        try {
            if (!req.headers.authorization) {
                throw new Error('Not authenticated');
            }
            const user = JSON.parse(req.headers.authorization);
            if (!user) {
                throw new Error();
            }
            res.json({ message: "success" });
        }
        catch (err) {
            res.json({ message: "Not authenticated" });
        }
    }
}
exports.PingController = PingController;
