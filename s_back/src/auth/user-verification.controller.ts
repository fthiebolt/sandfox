import { Router, Request, Response } from "express";

import { UserVerificationToken } from "../models/user_verification";
import { IUserVerificationToken } from "../interfaces/user";
import { User } from "../models/user";

export class UserVerificationController {
	router: Router;
	constructor(public path: string) {
		this.router = Router();
		this.initializeRouter();
	}

	initializeRouter() {
		// Post /auth/confirme?user_id=:id&token=:token
		this.router.get(this.path, this.validateUserAccount.bind(this))
	}
	async validateUserAccount(req: Request, res: Response) {
		try {

			const { user_id, token } = req.query;
			if (!(user_id && token)) { throw new Error('Missing attributes'); }
			const userVerificationToken = await UserVerificationToken.findOne({ user_id, token });
			if (!userVerificationToken) { throw new Error('Can\'t find the token in the db.'); }
			// Else success
			const user = await User.findById(user_id);
			if (!user) { throw new Error('User doesn\'t exist anymore'); }
			// Activate the user account
			const resp = await User.findByIdAndUpdate(user._id, { activated: true })
			if (!resp) { throw new Error() }
			// Delete the verification token
			await UserVerificationToken.findOneAndDelete({ token })
			// Redirect to the home page with success message
			res.redirect(process.env.FRONT_HOST + '/' + process.env.FRONT_HOME + '/?success=Votre compte a été validé avec succes')
		} catch (err) {
			res.status(404).json({ message: 'Failed to verify the user' });
			if (process.env.DEBUG === 'true') {
				console.log(err);
			}
		}
	}

}