import {  Router, Response, Request, NextFunction } from "express";
import { verify, decode } from "jsonwebtoken";

import { LoginController, IPayload } from "./login.controller";
import { User } from "../models/user";
import { Mailer } from "../services/mailer";
import { SignupController } from "./signup.controller";
import { UserVerificationController } from "./user-verification.controller";
import { ResetController } from "./reset.controller";
import { PingController } from "./ping.controller";

export class AuthController {
	router!: Router;
	loginController!: LoginController;
	signupController! : SignupController;
	userVerificationControllre!: UserVerificationController;
	resetController!: ResetController;
	pingController!:PingController;
	constructor(public path:string,public  secureGetPaths: string[] = [], public  securePostPaths: string[] = [],  public securePutPaths: string[] = [],public  secureDeletePaths: string[] = [], public mailer:Mailer) {
		this.router = Router();

		this.initializeControllers();
		this.securePaths();
		this.initializeRouter();
	}
	initializeControllers() {
		this.loginController = new LoginController(`${this.path}/login`);
		this.signupController = new SignupController(`${this.path}/register`,`${this.path}/confirme`, this.mailer);
		this.userVerificationControllre = new UserVerificationController(`${this.path}/confirme`);
		this.resetController = new ResetController(`${this.path}/reset`, this.mailer);
		this.pingController = new PingController(`${this.path}/ping`)
	}
	initializeRouter() {
		// protected paths
		// controllers routes
		this.router.use(this.loginController.router);
		this.router.use(this.signupController.router);
		this.router.use(this.userVerificationControllre.router);
		this.router.use(this.resetController.router);
		this.router.use(this.pingController.router)
	}
	private async checkAuth(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.headers.authorization) { throw 'Missing authorization header'; }
			const token = req.headers.authorization.split(' ')[1];
			let payload: IPayload = Object(decode(token));
			const user = await User.findOne({ username: payload.user.username });
			if (!user) { throw 'Username not found in the db.'; }
			payload = Object(await verify(token, user.password));
			// User contains the password (from the db)
			req.headers.authorization = JSON.stringify(user);
			next();
		} catch (err) {
			res.status(403).json({ message: 'Not autheticated' });

			if (process.env.DEBUG === 'true') {
				console.log(err);
			}
		}
	}
	securePaths(){
		this.secureGetPaths.forEach(path => this.router.get(path+"*", this.checkAuth));
		this.securePostPaths.forEach(path => this.router.post(path+"*", this.checkAuth));
		this.securePutPaths.forEach(path => this.router.put(path+"*", this.checkAuth));
		this.secureDeletePaths.forEach(path => this.router.delete(path+"*", this.checkAuth));
	}

}
