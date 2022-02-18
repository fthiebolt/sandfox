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
    constructor(path, mailer, influxDB) {
        this.path = path;
        this.mailer = mailer;
        this.influxDB = influxDB;
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
                    //console.log("Checking NOT received: ")
                    //console.log(notif)
                    const verif = yield models_1.Notification.findOne({ user_id: notif.user_id, value: notif.value, createdAt: notif.createdAt, buildingName: notif.buildingName });
                    if (verif) {
                        //console.log("CHECKING EXISTING NOTIF : ")
                        //console.log(verif)
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
        setInterval(this.checkNotifications.bind(this), 1000 * 60 * (Number(process.env.NOTIFICATIONS_CHECK_DELAY) || 10));
    }
    checkNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            const usersList = yield models_1.User.find();
            console.log("CHECKING NOTIFICATIONS FOR " + usersList.length + " USERS - @" + Number(process.env.NOTIFICATIONS_CHECK_DELAY) + "min");
            for (let i = 0; i < usersList.length; i++) { //pour chaque utilisateur
                const user = usersList[i];
                const userAlarms = yield models_1.Alarm.find({ user_id: user._id });
                const userNotifications = yield models_1.Notification.find({ user_id: user._id });
                for (let j = 0; j < userAlarms.length; j++) { //pour chaque alarmes d'un utilisateur
                    const alarm = userAlarms[j];
                    let buildingsList = alarm.buildings; // TODO : manage more than first building in array and notify for each buildings if needed
                    let latestNotification = yield models_1.Notification.findOne({ "alarm._id": alarm._id }).sort({ createdAt: -1 });
                    //console.log('latestNotification', latestNotification)
                    //data = IDataModel
                    let dataAfterNotificationDate = [];
                    for (var k = 0; k < buildingsList.length; k++) {
                        let tempData = yield this.influxDB.notifCheck(buildingsList[k], this.buildDataFindCondition(alarm), alarm.type, latestNotification);
                        //console.log("tempdata : ", tempData)
                        if (tempData && tempData.name != "" && !dataAfterNotificationDate.includes(tempData))
                            dataAfterNotificationDate.push(tempData);
                    }
                    if (dataAfterNotificationDate.length > 0)
                        console.log("Sending " + dataAfterNotificationDate.length + " notification.s to " + user._id + ".");
                    dataAfterNotificationDate.map(d => this.sendNotif(d, user, alarm));
                }
            }
        });
    }
    sendNotif(dataAfterNotificationDate, user, alarm) {
        return __awaiter(this, void 0, void 0, function* () {
            const buildingName = dataAfterNotificationDate.name;
            // A new Notification
            const notification = new models_1.Notification({
                user_id: user._id,
                alarm,
                seen: false,
                seen_at: new Date(),
                value: dataAfterNotificationDate.value,
                buildingName
            });
            if (notification.value != undefined) {
                yield notification.save();
                yield this.sendAlarmsForNotification(user.toObject(), alarm.toObject(), notification);
            }
        });
    }
    /**
     *
     * @returns flux filter string (with r as var)
     */
    buildDataFindCondition(alarm) {
        var condition = [];
        if (alarm.high_level.seuil_max != undefined) {
            condition.push(`r._value >${alarm.high_level.seuil_max * 1000}`);
        }
        if (alarm.avg_level.seuil_max != undefined) {
            condition.push(`r._value >${alarm.avg_level.seuil_min * 1000}`);
        }
        if (alarm.low_level.seuil_max != undefined) {
            condition.push(`r._value >${alarm.low_level.seuil_max * 1000}`);
        }
        if (alarm.high_level.seuil_min != undefined) {
            condition.push(`r._value <${alarm.high_level.seuil_min * 1000}`);
        }
        if (alarm.avg_level.seuil_min != undefined) {
            condition.push(`r._value <${alarm.avg_level.seuil_min * 1000}`);
        }
        if (alarm.low_level.seuil_min != undefined) {
            condition.push(`r._value <${alarm.low_level.seuil_min * 1000}`);
        }
        let result = "(" + condition[0];
        condition.splice(0, 1);
        condition.forEach(c => {
            result += " or " + c;
        });
        result += ")";
        return result;
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
