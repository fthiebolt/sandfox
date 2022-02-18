import { Schema, Model, model } from "mongoose";
import { IUserVerificationToken } from "../interfaces/user";
import { randomBytes } from "crypto";

export const userVerificationSchema:Schema<IUserVerificationToken> = new Schema<IUserVerificationToken>({
	user_id:{
		type:Schema.Types.ObjectId,
		required: true
	},
	token:String
},{
	timestamps:true
});

userVerificationSchema.methods.randomToken = ()=>{
	return randomBytes(32).toString('hex');
}
export const UserVerificationToken :Model<IUserVerificationToken> = model<IUserVerificationToken>('User verification tokens',
	userVerificationSchema,'user_Verification_tokens');