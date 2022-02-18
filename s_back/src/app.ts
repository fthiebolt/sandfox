import "colors";
import { config } from "dotenv";

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import * as bodyParser from "body-parser";
import morgan = require("morgan");
export class App {
	public app: express.Application;
	public middlewares: express.RequestHandler[] = [
		helmet(),
		//cors({origin:process.env.FRONT_HOST||''}),
		cors(),
		bodyParser.urlencoded({ extended: true }),
		bodyParser.json(),
		// Log all request on the console (for developpement)
		// morgan('tiny'),
		// morgan(':req[authorization]')
	]
	constructor(controllers:any[], middlewares: express.RequestHandler[] = []) {
		this.app = express();

		// initialize all given middlewares
		middlewares.forEach((middleware: express.RequestHandler) => this.middlewares.push(middleware));
		this.initializeMiddlewares();

		// initialize the controllers
		this.initializeControllers(controllers);

		// serve public static files //sert les fichiers du front au client
		// used in prod
		this.app.use("/",express.static('public',{maxAge:'48h'}))
		this.app.use('*',express.static('public',{maxAge:'48h'}))

	}
	public initializeMiddlewares(): void {
		this.middlewares.forEach((middleware: express.RequestHandler) => this.app.use(middleware));
	}
	public initializeControllers(controllers:any[]) {
		controllers.forEach(controller => this.app.use('/', controller.router));
	}

	/**
	 * 
	 * @param port .env.PORT OR 3000 by default
	 */
	public start(port:number|string= process.env.PORT||3000 ){
		this.app.listen(port,()=>console.log(`Listenning on ${port}`.blue));
	}
}
