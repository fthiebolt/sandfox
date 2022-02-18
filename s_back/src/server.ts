import { config } from "dotenv";
import colors from "colors";

import { App } from "./app";
import { Database } from "./database";
import { AuthController } from "./auth";
import { Mailer } from "./services/mailer";
import { AlarmController } from "./api/alarm.controller";
import { DataController } from "./api/data.controller";
import { BuildingController } from "./api/building.controller";
import { UserController } from "./api/user.controller";
import { NotificationsController } from "./api/notification.controller";
import { InfluxDatabase } from "./influx.db";
//import { NDInfluxDatabase} from "./neodata"
async function main() {
	try {
		colors
		// Load the config file .env
		config();
		if (process.env.DEBUG === 'true') {
			console.log('Running in debug mode'.bgMagenta);
		}
		//influxDB
		const influxDataB = new InfluxDatabase();
		influxDataB.connectDB();
		influxDataB.autoCheck(61)

		//const NeoData = new NDInfluxDatabase()
		//NeoData.connectDB()
		//NeoData.tester()

		//await influxDataB.writeJsonData();

		// Connect to the mongo database
		// contains users, tokens, old datas, ...
		const database = new Database();
		await database.connect({ useNewUrlParser: true });

		// Mail service
		const mailer = new Mailer();

		// Start the express app
		const protectedGetPaths = [
			'/api/auth/reset',
			'/api/auth/ping',
			'/api/notification*',
			'/api/alarm*',
			'/api/data',
			'/api/building*',
			"/api/user*",
		]
		const protectedPostPaths = [
			'/api/auth/register',
			'/api/alarm*',
			'/api/data',
			'/api/building*',
			"/api/user*",
		]
		const protectedPutPaths = [
			'/api/auth/register',
			'/api/auth/reset',
			'/api/alarm*',
			'/api/data',
			'/api/notification',
			'/api/building*',
			"/api/user*",
		]
		const protectedDeletePaths = [
			'/api/auth/register',
			'/api/auth/reset',
			'/api/alarm*',
			'/api/data',
			'/api/building*',
			"/api/user*",
		]
		const app = new App([
			new AuthController('/api/auth', protectedGetPaths, protectedPostPaths, protectedPutPaths, protectedDeletePaths, mailer),
			new AlarmController('/api/alarm'),
			new DataController('/api/data', influxDataB),
			new BuildingController('/api/building', influxDataB),
			new UserController("/api/user"),
			new NotificationsController('/api/notification',mailer, influxDataB)
		]);
		app.start();

	} catch (err) {
		console.error('Failed to start the server'.red);
		if (process.env.DEBUG === 'true') {
			console.log(err);
		}
		process.exit(1);
	}

}

main();