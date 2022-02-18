import { User, Alarm, Notification, IAlarmModel, INotificationModel, IDataModel } from "../models";

import { IController, IUser, IAlarm, INotification } from "../interfaces";
import { Router, Request, Response } from "express";
import { IUserModel } from "../models";
import { Mailer } from "../services/mailer";

import { InfluxDatabase } from "../influx.db";

//const webpush = require('web-push');
/*
//Change vapid Keys in .env and front-end dashboard if needed
const vapidKeys = webpush.generateVAPIDKeys();
console.log(JSON.stringify(vapidKeys))
*/
export class NotificationsController implements IController {
  // wsList: WebSocket[];
  router: Router
  private userNotif: {userID: string, subscription: any}[]
  constructor(public path: string, private mailer: Mailer, public influxDB:InfluxDatabase) {
    this.router = Router()
    this.userNotif = []
    /*webpush.setVapidDetails(
      'mailto:sandfox.mailer@google.com',
      process.env.VAPID_PUBLIC,
      process.env.VAPID_PRIVATE
    );*/
    this.initializeRouter()
    this.start()

  }
  
  initializeRouter() {
    this.router.get(this.path + "s", this.getNotifications.bind(this))
    this.router.put(this.path, this.seenNotif.bind(this))
  }
  async getNotifications(req: Request, res: Response) {
    try {
      if (!req.headers.authorization) { throw new Error('Not authenticated'); }
      const user: IUserModel = JSON.parse(req.headers.authorization);
      const notsList = await Notification.find({ user_id: user._id }).sort({ date: -1 })
      res.json(await Promise.all(notsList.map((n: INotificationModel) => n.toObject())))
    } catch (err) {
      res.status(404).json({ message: "Internal server error" })
    }
  }
  async seenNotif(req: Request, res: Response){
    try{
      if(!req.headers.authorization) { throw new Error('Not authenticated'); }
      const user: IUserModel = JSON.parse(req.headers.authorization);
      let jreq = JSON.stringify(req.body)

      if(jreq.hasOwnProperty('endpoint')){ //S'il s'agit de l'apiPush
        console.log({userID: user._id, subscription: req.body})
        this.userNotif.push({userID: user._id, subscription: req.body})
      } else { //Sinon traitement d'une nouvelle notification vue
        const notif: INotification = req.body
        const verif = await Notification.findOne({user_id: notif.user_id, value: notif.value, createdAt: notif.createdAt, buildingName: notif.buildingName})
        if(verif){
          await verif.updateOne(notif)
          res.json(notif)
        } else {
          throw new Error('Notif id and user_id combination not found in the db'); 
        }
      }
      
    } catch (err) {
			res.status(500).json({ message: 'Internal server error' });
			if (process.env.DEBUG === 'true') {
				console.log(err);
      }
    }
  }
  start() {
    setInterval(this.checkNotifications.bind(this), 1000 * 60 * (Number(process.env.NOTIFICATIONS_CHECK_DELAY) || 10))
  }
  async checkNotifications() {
    const usersList = await User.find()
    console.log("CHECKING NOTIFICATIONS FOR " + usersList.length + " USERS - @"+Number(process.env.NOTIFICATIONS_CHECK_DELAY)+"min")
    for (let i = 0; i < usersList.length; i++) { //pour chaque utilisateur
      const user = usersList[i];
      const userAlarms: IAlarmModel[] = await Alarm.find({ user_id: user._id });
      const userNotifications = await Notification.find({ user_id: user._id });
      for (let j = 0; j < userAlarms.length; j++) { //pour chaque alarmes d'un utilisateur
        const alarm = userAlarms[j];
        let buildingsList = alarm.buildings; // TODO : manage more than first building in array and notify for each buildings if needed
        let latestNotification = await Notification.findOne({ "alarm._id": alarm._id }).sort({ createdAt: -1 });
        //console.log('latestNotification', latestNotification)
        //data = IDataModel
        let dataAfterNotificationDate: {name: string, value: number, date: Date}[] = [];
        for(var k=0; k < buildingsList.length; k++){
          let tempData = await this.influxDB.notifCheck(buildingsList[k], this.buildDataFindCondition(alarm), alarm.type, latestNotification);
          if (tempData && tempData.name != ""  && !dataAfterNotificationDate.includes(tempData)) dataAfterNotificationDate.push(tempData);
        }
        dataAfterNotificationDate.map(d => this.sendNotif(d, user, alarm));
      }
    }
  }
  private async sendNotif(dataAfterNotificationDate: any, user: IUserModel, alarm: IAlarmModel) {
      const buildingName = dataAfterNotificationDate.name;
      // A new Notification
      const notification = new Notification({
        user_id: user._id,
        alarm,
        seen: false,
        seen_at: new Date(),
        value: dataAfterNotificationDate.value,
        buildingName
      });
      if (notification.value != undefined) {
        await notification.save();
        await this.sendAlarmsForNotification(user.toObject(), alarm.toObject(), notification);
      }

  }

  /**
   * 
   * @returns flux filter string (with r as var)
   */
  private buildDataFindCondition(alarm: IAlarmModel):string {
    var condition = []
    if (alarm.high_level.seuil_max != undefined) {
      condition.push(
        `r._value >${alarm.high_level.seuil_max*1000}`
      );
    }
    if (alarm.avg_level.seuil_max != undefined) {
      condition.push(
        `r._value >${alarm.avg_level.seuil_min*1000}`
      );
    }
    if (alarm.low_level.seuil_max != undefined) {
      condition.push(
        `r._value >${alarm.low_level.seuil_max*1000}`
      );
    }
    if (alarm.high_level.seuil_min != undefined) {
      condition.push(
        `r._value <${alarm.high_level.seuil_min*1000}`
      );
    }
    if (alarm.avg_level.seuil_min != undefined) {
      condition.push(
        `r._value <${alarm.avg_level.seuil_min*1000}`
      );
    }
    if (alarm.low_level.seuil_min != undefined) {
      condition.push(
        `r._value <${alarm.low_level.seuil_min*1000}`
      );
    }
    let result = "("+condition[0];
    condition.splice(0,1);
    condition.forEach(c => {
      result += " or " + c 
    })
    result+= ")"
    return result
  }
  async sendAlarmsForNotification(user: IUser, alarm: IAlarm, notification: INotificationModel) {
    // TODO: send email and websocket
    if (alarm.email) {
      await this.mailer.sendAlert(user)
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

  }
}