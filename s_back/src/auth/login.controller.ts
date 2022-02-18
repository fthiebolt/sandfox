import { Router, Request, Response } from "express";
import { User } from "../models/user";
import { sign, decode, verify, } from "jsonwebtoken";

export interface IPayload {
	user: {
		username: string;
		email: string;
		first_name: string;
		last_name: string;
		role: string
	}
}
export class LoginController {
	router: Router = Router();
	constructor(public path: string) {
		this.initializeRoutes();
	}
	initializeRoutes() {

		this.router.post(this.path, this.signin);
	}
	public async signin(req: Request, res: Response) {
		try {
			let { password, username } = req.body;

			if (!(username && password)) { throw 'Missing username or/and password from request body'; }
			password = password.toString();
			username = username.toString();
			const user = await User.findOne({ username });
			if (!user) { throw 'Username doesn\'t exist in the database'; }
			if (user.attempts == undefined) {
				user.attempts = 0
				await user.save()
			}
			if (user.attempts > Number(process.env.MAX_LOGIN_ATTEMP)) {
				user.activated = false
				await user.save()
				res.redirect(process.env.FRONT_HOST + '/' + process.env.FRONT_HOME + '/?error=Votre compte a été désactivé, contactez le resposable')
				return;
			}

			// Check the password
			const isMatch = await user.comparePassword(password);
			// TODO: Increment attempts if password is incorrect and disactivate the user if it is superieur to process.env.MAX_LOGIN_ATTEMP
			if (!isMatch) {
				user.attempts++
				await user.save()
				throw 'Incorrect password';
			}

			if (!user.activated) {
				res.status(403).json({ message: "Voulliez consulter votre messagerie." });
				return;
			}
			// Generate a jwt
			let payload: IPayload = {
				user: {
					username: user.username,
					email: user.email,
					first_name: user.first_name,
					last_name: user.last_name,
					role: user.role
				}
			};
			const token = sign(payload, user.password, { expiresIn: process.env.EXP_DAYS + 'days' });
			res.json({ token })

		} catch (err) {
			res.status(403).json({ message: 'Invalide username or password' });
			if (process.env.DEBUG === 'true') {
				console.log(err);
			}
		}
	}
}