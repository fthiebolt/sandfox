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
exports.NotificationsController = void 0;
const models_1 = require("../models");
const express_1 = require("express");
//const webpush = require('web-push');
/*
//Change vapid Keys in .env and front-end dashboard if needed
const vapidKeys = webpush.generateVAPIDKeys();
console.log(JSON.stringify(vapidKeys))
*/
class NotificationsController {
    constructor(path, mailer) {
        this.path = path;
        this.mailer = mailer;
        this.router = express_1.Router();
        this.userNotif = [];
        /*webpush.setVapidDetails(
          'mailto:sandfox.mailer@google.com',
          process.env.VAPID_PUBLIC,
          process.env.VAPID_PRIVATE
        );*/
        this.initializeRouter();
        this.start();
    }
    initializeRouter() {
        this.router.get(this.path + "s", this.getNotifications.bind(this));
        this.router.put(this.path, this.seenNotif.bind(this));
    }
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const user = JSON.parse(req.headers.authorization);
                const notsList = yield models_1.Notification.find({ user_id: user._id }).sort({ date: -1 });
                res.json(yield Promise.all(notsList.map((n) => n.toObject())));
            }
            catch (err) {
                res.status(404).json({ message: "Internal server error" });
            }
        });
    }
    seenNotif(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.headers.authorization) {
                    throw new Error('Not authenticated');
                }
                const user = JSON.parse(req.headers.authorization);
                let jreq = JSON.stringify(req.body);
                if (jreq.hasOwnProperty('endpoint')) { //S'il s'agit de l'apiPush
                    console.log({ userID: user._id, subscription: req.body });
                    this.userNotif.push({ userID: user._id, subscription: req.body });
                }
                else { //Sinon traitement d'une nouvelle notification vue
                    const notif = req.body;
                    const verif = yield models_1.Notification.findOne({ user_id: notif.user_id, value: notif.value, createdAt: notif.createdAt, buildingName: notif.buildingName });
                    if (verif) {
                        yield verif.updateOne(notif);
                        res.json(notif);
                    }
                    else {
                        throw new Error('Notif id and user_id combination not found in the db');
                    }
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
    start() {
        setInterval(this.checkNotifications.bind(this), 1000 * 10); /*1000 * 60 * (Number(process.env.NOTIFICATIONS_CHECK_DELAY) || 1)*/
    }
    checkNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            const usersList = yield models_1.User.find();
            for (let i = 0; i < usersList.length; i++) { //pour chaque utilisateur
                const user = usersList[i];
                const userAlarms = yield models_1.Alarm.find({ user_id: user._id });
                const userNotifications = yield models_1.Notification.find({ user_id: user._id });
                for (let j = 0; j < userAlarms.length; j++) { //pour chaque alarmes d'un utilisateur
                    const alarm = userAlarms[j];
                    let buildingsList = alarm.buildings; // TODO : manage more than first building in array and notify for each buildings if needed
                    const Capter = models_1.capterModel(alarm.type);
                    const latestNotification = yield models_1.Notification.findOne({ "alarm._id": alarm._id }).sort({ createdAt: -1 });
                    //console.log('latestNotification', latestNotification)
                    const Data = yield models_1.dataModel(alarm.type);
                    let dataAfterNotificationDate = [];
                    if (latestNotification) {
                        for (var k = 0; k < buildingsList.length; k++) {
                            let tempData = null;
                            let capterName = null;
                            capterName = ((yield Capter.findOne({ name: buildingsList[k] })) || { name: "" }).capter_id;
                            tempData = yield Data.findOne({ name: capterName, date: { $gt: latestNotification.createdAt }, $or: this.buildDataFindCondition(alarm) }).sort({ data: -1 });
                            if (tempData && !dataAfterNotificationDate.includes(tempData))
                                dataAfterNotificationDate.push(tempData);
                        }
                    }
                    else {
                        for (var k = 0; k < buildingsList.length; k++) {
                            let tempData = null;
                            let capterName = null;
                            capterName = ((yield Capter.findOne({ name: buildingsList[k] })) || { name: "" }).capter_id;
                            tempData = yield Data.findOne({ name: capterName, $or: this.buildDataFindCondition(alarm) });
                            if (tempData && !dataAfterNotificationDate.includes(tempData))
                                dataAfterNotificationDate.push(tempData);
                        }
                    }
                    dataAfterNotificationDate.map(d => this.sendNotif(d, user, alarm));
                }
            }
        });
    }
    sendNotif(dataAfterNotificationDate, user, alarm) {
        return __awaiter(this, void 0, void 0, function* () {
            var Capter = models_1.capterModel(alarm.type);
            const buildingName = ((yield Capter.findOne({ capter_id: dataAfterNotificationDate.name })) || { name: "" }).name;
            // A new Notification
            const notification = new models_1.Notification({
                user_id: user._id,
                alarm,
                seen: false,
                value: dataAfterNotificationDate.value,
                buildingName
            });
            if (notification.value != undefined) {
                yield notification.save();
                yield this.sendAlarmsForNotification(user.toObject(), alarm.toObject(), notification);
            }
        });
    }
    buildDataFindCondition(alarm) {
        const condition = [];
        if (alarm.high_level.seuil_max != undefined) {
            condition.push({
                value: { "$gt": alarm.high_level.seuil_max }
            });
        }
        if (alarm.avg_level.seuil_max != undefined) {
            condition.push({
                value: { "$gt": alarm.avg_level.seuil_max }
            });
        }
        if (alarm.low_level.seuil_max != undefined) {
            condition.push({
                value: { "$gt": alarm.low_level.seuil_max }
            });
        }
        if (alarm.high_level.seuil_min != undefined) {
            condition.push({
                value: { "$lt": alarm.high_level.seuil_min }
            });
        }
        if (alarm.avg_level.seuil_min != undefined) {
            condition.push({
                value: { "$lt": alarm.avg_level.seuil_min }
            });
        }
        if (alarm.low_level.seuil_min != undefined) {
            condition.push({
                value: { "$lt": alarm.low_level.seuil_min }
            });
        }
        return condition;
    }
    sendAlarmsForNotification(user, alarm, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: send email and websocket
            if (alarm.email) {
                yield this.mailer.sendAlert(user);
            }
            if (alarm.sms) {
                // TODO: Envoyer un sms au numero de telephone si il user a un numero
            }
            if (notification) {
                // TODO test in prod-only with APIkeys and updated front (uncomment needed)
                /*let index = this.userNotif.findIndex(n => n.userID == notification.user_id)
                if (index) {
                  try{
                    webpush.sendNotification(this.userNotif[index].subscription, 'Your Push Payload Text');
                  } catch(error){
                    console.log("Unable to send Notification to " + notification.user_id +" : " + error)
                  }
                }
                */
            }
        });
    }
}
exports.NotificationsController = NotificationsController;
/*
{
    lastDate: Date,
    user_id: string,
    alarm_id: string
}
*/ 
