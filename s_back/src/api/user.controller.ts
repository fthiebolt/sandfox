import { IController, IUser } from "../interfaces";
import { Router, Request, Response } from "express";
import { IUserModel, User, UserVerificationToken, Alarm } from "../models";
import { validateUser } from "../auth/utils";

export class UserController implements IController {
	router: Router
	constructor(public path: string) {
		this.router = Router()
		this.initializeRouter()
	}
	initializeRouter() {
		// GET admin /api/users users list
		this.router.get(this.path + "s", this.getAllUsers.bind(this))
		// GET admin /api/user/:id user details
		this.router.get(this.path + "/:id", this.getUser.bind(this))
		// PUT admin /api/user/:id with {user}
		this.router.put(this.path + "/:id", this.updateUser.bind(this))
		// DELETE admin /api/user/:id 
		this.router.delete(this.path+"/:id", this.deleteUser.bind(this))
	}
	async getAllUsers(req: Request, res: Response) {
		try {
			if (!req.headers.authorization) { throw new Error('Not authenticated'); }
			const user: IUserModel = JSON.parse(req.headers.authorization);
			if (user.role !== "administrator") { throw new Error("User don't have the admin permissions.") }
			const users = await User.find({})
			res.json(await Promise.all(users.map(user => ({
				id: user._id,
				username: user.username,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
				role: user.role,
				phone_number: user.phone_number,
				activated: user.activated

			}))))
		} catch (err) {
			res.status(404).json({ message: "You don't have the permissions" })
		}
	}
	async getUser(req: Request, res: Response) {
		try {
			const { id } = req.params
			if (!id) { throw new Error() }
			if (!req.headers.authorization) { throw new Error('Not authenticated'); }
			const user: IUserModel = JSON.parse(req.headers.authorization);
			if (user.role !== "administrator") { throw new Error("User don't have the admin permissions.") }
			const requestedUser = await User.findById(id)
			if (!requestedUser) {
				res.status(404).json({ message: "User not found." })
				return
			}
			res.json({
				id: requestedUser._id,
				username: requestedUser.username,
				email: requestedUser.email,
				first_name: requestedUser.first_name,
				last_name: requestedUser.last_name,
				role: requestedUser.role,
				phone_number: requestedUser.phone_number,
				activated: requestedUser.activated
			})
		} catch (err) {
			console.log(err)
			res.status(404).json({ message: "You don't have the permissions" })
		}
	}
	async updateUser(req: Request, res: Response) {
		try {
			const { id } = req.params
			if (!id) { throw new Error() }
			if (!req.headers.authorization) { throw new Error('Not authenticated'); }
			const user: IUserModel = JSON.parse(req.headers.authorization);
			if (user.role !== "administrator") { throw new Error("User don't have the admin permissions.") }
			const {
				username,
				email,
				first_name,
				last_name,
				role,
				phone_number,
				activated
			} = req.body;
			const userToUpdate = await User.findById(id)
			if (!userToUpdate) { throw new Error('User is not found') }

			Object.assign(userToUpdate, {
				username: username.toString().toLowerCase(),
				email: email.toString().toLowerCase(),
				first_name: first_name.toString().toLowerCase(),
				last_name: last_name.toString().toLowerCase(),
				role: role.toString().toLowerCase(),
				phone_number: phone_number ? phone_number.toString().toLowerCase() : undefined,
				activated
			})
			await validateUser(userToUpdate.toObject())
			await userToUpdate.save()
			res.json({ message: "success" })
		} catch (err) {
			res.status(404).json({ message: err.message })

		}
	}
	async deleteUser(req: Request, res: Response) {
		try {
			const { id } = req.params
			if (!id) { throw new Error() }
			if (!req.headers.authorization) { throw new Error('Not authenticated'); }
			const user: IUserModel = JSON.parse(req.headers.authorization);
			if (user.role !== "administrator") { throw new Error("User don't have the admin permissions.") }
			// delete all alarms and token 
			// TODO: Delete notifications
			await UserVerificationToken.deleteMany({ user_id: id })
			await Alarm.deleteMany({ user_id: id })
			await User.findByIdAndDelete(id)
			res.json({ message: 'success' })
		} catch (err) {
			res.status(503).json({message:"internal server error"})
		}
	}
}