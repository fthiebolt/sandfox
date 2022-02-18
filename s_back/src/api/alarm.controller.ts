import { Router, Response, Request } from "express";
import { IController, IAlarm } from "../interfaces";
import { IUserModel, Alarm, IAlarmModel } from "../models";


/**
 * @class AlarmController
 * @description Rest api mongoDB alarm modifications
 * @methods createAlarm/updateAlarm/deleteAlarm/isValid/getAlarms
 */
export class AlarmController implements IController{
	router!: Router;
	constructor(public path: string) {
		this.initializeRouter();
	}

	initializeRouter() {
		this.router = Router();
		//  GET /api/alarms get alarms list
		this.router.get(this.path + 's', this.getAlarms);
		// POST /api/alarm with new alarm  
		this.router.post(this.path, this.createAlarm.bind(this));
		// PUT /api/alarm update existing alarm 
		this.router.put(this.path, this.updateAlarm.bind(this));
		// DELETE /api/alarm delete a given alarm 
		this.router.delete(this.path+'/:id', this.deleteAlarm.bind(this));
	}
	/**
	 * 
	 * @param req body must be IAlarm type
	 * @param res frontexpects IAlarmModel as a result
	 */
	async createAlarm(req: Request, res: Response) {
		try {
			if (!req.headers.authorization) { throw new Error('Not authenticated'); } 
			const user: IUserModel = JSON.parse(req.headers.authorization); //checks userid / username and auth
			let alarmForm: IAlarm = req.body;
			this.isValide(alarmForm).catch(err => {
				res.status(400).json({ message: err.message || err });
			})
			alarmForm.user_id = user._id;
			// TODO: Check if additionnal attributes from req.body is stored in the db
			const alarm: IAlarmModel = await new Alarm(alarmForm).save();
			alarm.alarm_id = alarm._id;
			res.json(alarm);
		} catch (err) {
			res.status(500).json({ message: 'Internal server error' });
			if (process.env.DEBUG === 'true') {
				console.log(err);
			}
		}
	}
	/**
	 * @description finds alarm in db and updates (called by front end pop-up alarm mod)
	 * @param req 
	 * @param res 
	 */
	async updateAlarm(req: Request, res: Response) {
		try {
			if (!req.headers.authorization) { throw new Error('Not authenticated'); }
			const user: IUserModel = JSON.parse(req.headers.authorization);

			// TODO: Check if additionnal attributes from req.body is stored in the db
			const alarmForm = req.body;
			const alarm = await Alarm.findOne({ _id:  (alarmForm.alarm_id || alarmForm._id), user_id: alarmForm.user_id });
			if (alarm) {
				await alarm.updateOne(alarmForm);
				res.json(alarm);
			}
			if (!alarm) { throw new Error('Alarm id and user_id combination not found in the db'); }
		} catch (err) {
			res.status(500).json({ message: 'Internal server error' });
			if (process.env.DEBUG === 'true') {
				console.log(err);
			}
		}
	}
	/**
	 * 
	 * @param req 
	 * @param res 
	 */
	async deleteAlarm(req: Request, res: Response) {
		try {
			if (!req.headers.authorization) { throw new Error('Not authenticated'); }
			const user: IUserModel = JSON.parse(req.headers.authorization);
			const alarm =  await Alarm.findOne({ _id:req.params.id, user_id: user._id });
			if(!alarm) throw new Error('Could find the alarm in the db');
			await alarm.remove();
			res.json({ message: 'Success' });
		} catch (err) {
			res.status(500).json({ message: 'Internal server error' });
			if (process.env.DEBUG === 'true') {
				console.log(err);
			}
		}
	}
	async isValide(alarm: IAlarm): Promise<void> {
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
	}
	async getAlarms(req: Request, res: Response) {
		try {
			if (!req.headers.authorization) { throw new Error('Not authenticated'); }
			const user: IUserModel = JSON.parse(req.headers.authorization);
			const alarms = await Alarm.find({ user_id: user._id });
			const resArray: IAlarm[] = await Promise.all(alarms.map((alarm: IAlarmModel) => {
				const e: IAlarm = Object.assign(alarm, { "alarm_id": alarm._id })
				return e;
			}));
			res.json(resArray);
		} catch (err) {
			res.status(500).json({ message: 'Internal server error' });
			if (process.env.DEBUG === 'true') {
				console.log(err);
			}
		}
	}
}