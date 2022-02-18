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
exports.AlarmController = void 0;
const express_1 = require("express");
const models_1 = require("../models");
/**
 * @class AlarmController
 * @description Rest api mongoDB alarm modifications
 * @methods createAlarm/updateAlarm/deleteAlarm/isValid/getAlarms
 */
class AlarmController {
    constructor(path) {
        this.path = path;
        this.initializeRouter();
    }
    initializeRouter() {
        this.router = express_1.Router();
        //  GET /api/alarms get alarms list
        this.router.get(this.path + 's', this.getAlarms);
        // POST /api/alarm with new alarm  
        this.router.post(this.path, this.createAlarm.bind(this));
        // PUT /api/alarm update existing alarm 
        this.router.put(this.path, this.updateAlarm.bind(this));
        // DELETE /api/alarm delete a given alarm 
        this.router.delete(this.path + '/:id', this.deleteAlarm.bind(this));
    }
    /**
     *
     * @param req body must be IAlarm type
     * @param res frontexpects IAlarmModel as a result
     */
    createAlarm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const user = JSON.parse(req.headers.authorization); //checks userid / username and auth
                let alarmForm = req.body;
                this.isValide(alarmForm).catch(err => {
                    res.status(400).json({ message: err.message || err });
                });
                alarmForm.user_id = user._id;
                // TODO: Check if additionnal attributes from req.body is stored in the db
                const alarm = yield new models_1.Alarm(alarmForm).save();
                alarm.alarm_id = alarm._id;
                res.json(alarm);
            }
            catch (err) {
                res.status(500).json({ message: 'Internal server error' });
                if (process.env.DEBUG === 'true') {
                    console.log(err);
                }
            }
        });
    }
    /**
     * @description finds alarm in db and updates (called by front end pop-up alarm mod)
     * @param req
     * @param res
     */
    updateAlarm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const user = JSON.parse(req.headers.authorization);
                // TODO: Check if additionnal attributes from req.body is stored in the db
                const alarmForm = req.body;
                const alarm = yield models_1.Alarm.findOne({ _id: (alarmForm.alarm_id || alarmForm._id), user_id: alarmForm.user_id });
                if (alarm) {
                    yield alarm.updateOne(alarmForm);
                    res.json(alarm);
                }
                if (!alarm) {
                    throw new Error('Alarm id and user_id combination not found in the db');
                }
            }
            catch (err) {
                res.status(500).json({ message: 'Internal server error' });
                if (process.env.DEBUG === 'true') {
                    console.log(err);
                }
            }
        });
    }
    /**
     *
     * @param req
     * @param res
     */
    deleteAlarm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const user = JSON.parse(req.headers.authorization);
                const alarm = yield models_1.Alarm.findOne({ _id: req.params.id, user_id: user._id });
                if (!alarm)
                    throw new Error('Could find the alarm in the db');
                yield alarm.remove();
                res.json({ message: 'Success' });
            }
            catch (err) {
                res.status(500).json({ message: 'Internal server error' });
                if (process.env.DEBUG === 'true') {
                    console.log(err);
                }
            }
        });
    }
    isValide(alarm) {
        return __awaiter(this, void 0, void 0, function* () {
            if (alarm.high_level.seuil_max == undefined && alarm.high_level.seuil_min == undefined
                && alarm.avg_level.seuil_max == undefined && alarm.avg_level.seuil_min == undefined
                && alarm.low_level.seuil_max == undefined && alarm.low_level.seuil_min == undefined) {
                throw new Error('Il faut au moins une valeur de seuil');
            }
            if (!(alarm.buildings && alarm.buildings.length)) {
                throw new Error('Il faut séléctionner au moins un bâtiment');
            }
            if (!alarm.type) {
                throw new Error('Il faut choisir un type d\'energie');
            }
            // Success
            return;
        });
    }
    getAlarms(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const user = JSON.parse(req.headers.authorization);
                const alarms = yield models_1.Alarm.find({ user_id: user._id });
                const resArray = yield Promise.all(alarms.map((alarm) => {
                    const e = Object.assign(alarm, { "alarm_id": alarm._id });
                    return e;
                }));
                res.json(resArray);
            }
            catch (err) {
                res.status(500).json({ message: 'Internal server error' });
                if (process.env.DEBUG === 'true') {
                    console.log(err);
                }
            }
        });
    }
}
exports.AlarmController = AlarmController;
