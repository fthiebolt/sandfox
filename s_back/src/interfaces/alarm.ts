import { Schema } from "mongoose";

export interface IAlarm{
	alarm_id:string;
	user_id: string;
	buildings: string[],
	type: string,
	high_level: {
		seuil_min: number;
		seuil_max: number;
	};
	avg_level: {
		seuil_min: number;
		seuil_max: number;
	};
	low_level: {
		seuil_min: number;
		seuil_max: number;
	};
	sms: boolean;
	email: boolean;
	notification: boolean;
}