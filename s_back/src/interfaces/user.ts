import { Document, Schema } from "mongoose";

export interface IUser{
	username:string;
	email:string;
	first_name:string;
	last_name:string;
	password: string; 
	activated: boolean;
	role: string;
	phone_number?:string;
	attempts:number
};
export interface IUserVerificationToken extends Document{
	user_id: Schema.Types.ObjectId;
	token: string;
	randomToken():string;
}