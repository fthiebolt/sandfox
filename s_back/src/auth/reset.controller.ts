import { IController } from "../interfaces";
import { Router, Response, Request } from "express";
import { Mailer } from "../services/mailer";
import { User, IUserModel, UserVerificationToken } from "../models";
import { validateUser } from "./utils";

export class ResetController implements IController {
	router: Router

	constructor(private path: string, private mailer: Mailer) {
		this.router = Router()
		this.initializeRouter()
	}

	initializeRouter() {
		// GET /api/auth/reset?username="string"
		this.router.get(this.path+'/:id', this.sendResetMail.bind(this))
		// POST /api/auth/reset {new password, token, user_id}
		this.router.post(this.path, this.resetPassword.bind(this))
	}
	/**
	 * Send password reset email to the user, need an identified admin user to request the action.
	 * @param req 
	 * @param res 
	 */
	async sendResetMail(req: Request, res: Response) {
		try {
			if (!req.headers.authorization) { throw new Error('Not authenticated'); }
			const requestOriginUser: IUserModel = JSON.parse(req.headers.authorization)
			if (!(requestOriginUser && requestOriginUser.role === "administrator")) {
				throw new Error('You don\'t have the permission.')
			}

			const { id } = req.params;
			if (!id) { throw new Error("no id was provided.") }
			const user = await User.findById(id)
			if (!user) { throw new Error('user not found.') }
			// create the password verification token
			const token = await new UserVerificationToken({
				user_id: user._id,
				token: UserVerificationToken.schema.methods.randomToken()
			}).save();
			this.mailer.sendResetPassword( user, token)
			res.json({ message: "success" })
		} catch (err) {
			res.status(404).json({ message: "Request error" });
			console.log(err)
		}
	}
	async resetPassword(req: Request, res: Response) {
		try {
			const {password, user_id, token} = req.body
			if(!(password && user_id && token)){ throw new Error('Missing attributes.')}
			const verificationToken = await UserVerificationToken.findOne({user_id, token})
			if(!verificationToken){ throw new Error('Token not found in the db.')}
			// reset the password
			const user = await User.findById(user_id)
			if(!user){ throw new Error('User not found in the database')}
			user.password = password
			console.log(user.toObject())
			await validateUser(user.toObject())
			await user.save()
			verificationToken.remove()
			res.json({message:"Success"})
		} catch (err) {
			res.status(404).json({ message: "Request error" });
			console.log(err)
		}
	}
}