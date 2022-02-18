import { Schema, Model, model, Document, HookNextFunction } from "mongoose";
import { hash, genSalt, compare } from "bcrypt";

import { IUser  } from "../interfaces/user";
export interface IUserModel extends IUser, Document{
	comparePassword(candidatePassword: String):Promise<Boolean>;
}
export const userSchema:Schema<IUserModel> = new Schema<IUserModel>({
	username:{
		type:String,
		required: true
	},
	email:{
		type: String,
		required: true
	},
	first_name: {
		type:String, 
		required: true
	},
	last_name:{
		type:String, 
		required: true
	},
	password: {
		type:String,
		required: true
	},
	activated: {
		type:Boolean,
		required: true
	},
	role: {
		type:String,
		required: true
	},
	phone_number: String, 
	attempts: Number
},{
	timestamps:true
});

userSchema.pre<IUserModel>('save',async function protectPassword(next){
	try{
		if(this.isModified('password')){
			this.password = await hash(this.password,await genSalt(10))
		}
		next();
	}catch(err){
		if(process.env.DEBUG==='true'){
			console.log(err);
		}
	}
})
userSchema.methods.comparePassword= async function (candidatePassword){
	try{
		return await compare(candidatePassword, this.password);
	}catch(err){
		if(process.env.DEBUG==='true'){
			console.log(err);
		}
	}
	return false;
}
export const User: Model<IUserModel> = model<IUserModel>('Users',userSchema,'users');
// export = User;
