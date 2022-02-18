import { Router, Request, Response } from "express";

import { IUser } from "../interfaces";
import { ValidationResult, ObjectSchema, object, string, validate, boolean } from 'joi';
import { User, IUserModel, UserVerificationToken } from "../models";
import { Mailer } from "../services/mailer";
import { validateUser } from "./utils";
export class SignupController {
	router: Router;
	constructor(public path: string, public userConfirmPath: string, public mailer: Mailer) {
		this.router = Router();
		this.initializeRoutes();
	}
	initializeRoutes() {
		this.router.post(this.path, this.createAccount.bind(this));
		this.router.get(this.path,(req,res)=>{
			res.redirect(process.env.FRONT_HOST+'/'+process.env.FRONT_HOME+'/?success=Votre compte a bien été créé')
		})
	}
	public async createAccount(req: Request, res: Response) {
		try {
			if (!req.headers.authorization) { throw new Error('Not authenticated'); }
			const user: IUserModel = JSON.parse(req.headers.authorization);
			if (user.role !== "administrator") { throw new Error('You don\'t have the permission do perfume this action.') }
			const { username, email, first_name, last_name, password, phone_number, role } = req.body;
			if (!(username && email && first_name && last_name && password && role)) {
				throw new Error('Missing attributes.');
			}
			let userForm: IUser = { username, email, first_name, last_name, password, role, activated: false, attempts:0 }
			// Xss attack security & some input filtration
			userForm = {
				username: userForm.username.toString().toLowerCase(),
				email: userForm.email.toString().toLowerCase(),
				first_name: userForm.first_name.toString().toLowerCase(),
				last_name: userForm.last_name.toString().toLowerCase(),
				password: userForm.password.toString(),
				role: role.toString(),
				activated: userForm.activated,
				attempts: userForm.attempts
			}
			if (phone_number) {
				userForm.phone_number = phone_number.toString();
			}
			const validatedUserForm = await validateUser(userForm).catch(err=>{
				res.status(403).json({message:err.message})
			});
			// Check if the username or the email already used
			if (await User.findOne({ username })) { throw new Error("Utilisateur existe déjà"); }
			if (await User.findOne({ email })) { throw new Error("Cette address mail est déjà utilisé"); }
			let newUser = new User(validatedUserForm);
			await newUser.validate();
			newUser = await newUser.save().catch(err => { throw new Error('Internal server error'); })
			const token = await new UserVerificationToken({
				user_id: newUser._id,
				token: UserVerificationToken.schema.methods.randomToken()
			}).save();
			await this.mailer.sendVerification(this.userConfirmPath, newUser, token).catch(err => { throw new Error('Internal server error'); });
			res.json({message:'Success'});
		} catch (err) {
			res.status(403).json({ message: err.message || err });
			if (process.env.DEBUG === 'true') {
				console.log(err);
			}
		}

	}

}