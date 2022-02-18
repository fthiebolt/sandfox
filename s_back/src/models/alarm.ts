import { IAlarm } from "../interfaces/alarm";
import { Document, Schema, model, Model } from "mongoose";


export interface IAlarmModel extends IAlarm, Document{

}

export const alarmSchema: Schema<IAlarmModel> = new Schema<IAlarmModel>({
	user_id: {
		type: Schema.Types.ObjectId,
		required: true
	  },
	  buildings: {
		type: Array,
		required: true
	  },
	  type: {
		type: String,
		required: true
	  },
	  high_level: {
		seuil_min: Number,
		seuil_max: Number,
		required: false
	  },
	  avg_level: {
		seuil_min: Number,
		seuil_max: Number,
		required: false
	  },
	  low_level: {
		seuil_min: Number,
		seuil_max: Number,
		required: false
	  },
	  sms: Boolean,
	  email: Boolean,
	  notification: Boolean
},{
	timestamps:true
});
alarmSchema.pre<IAlarmModel>('save',async function(next){
	if(this.isModified()){
		this.type= this.type.toString();
		this.buildings = await Promise.all(this.buildings.map(building=> building.toString()));
	}
	this.sms = this.sms ? true: false;
	this.email = this.email ? true: false;
	this.notification = this.notification ? true: false;
	next();
});
export const Alarm: Model<IAlarmModel> = model<IAlarmModel>('Alarms',alarmSchema,'alarms');