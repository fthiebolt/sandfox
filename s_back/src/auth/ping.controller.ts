import { IController } from "../interfaces";
import { Router, Request, Response } from "express";
import { IUserModel } from "../models";

export class PingController implements IController{
	router: Router

	constructor(private path: string) {
		this.router = Router()
		this.initializeRouter()
	}
	initializeRouter(){
		this.router.get(this.path, this.ping.bind(this))
	}
	ping(req: Request, res: Response){
		try{
			if (!req.headers.authorization) { throw new Error('Not authenticated'); }
			const user: IUserModel = JSON.parse(req.headers.authorization);
			if(!user){
				throw new Error()
			}
			res.json({message:"success"})
		}catch(err){
			res.json({message:"Not authenticated"})
		}
	}
}