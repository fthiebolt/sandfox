"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const colors_1 = __importDefault(require("colors"));
const app_1 = require("./app");
const database_1 = require("./database");
const auth_1 = require("./auth");
const mailer_1 = require("./services/mailer");
const alarm_controller_1 = require("./api/alarm.controller");
const data_controller_1 = require("./api/data.controller");
const building_controller_1 = require("./api/building.controller");
const user_controller_1 = require("./api/user.controller");
const notification_controller_1 = require("./api/notification.controller");
const influx_db_1 = require("./influx.db");
//import { NDInfluxDatabase} from "./neodata"
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            colors_1.default;
            // Load the config file .env
            dotenv_1.config();
            if (process.env.DEBUG === 'true') {
                console.log('Running in debug mode'.bgMagenta);
            }
            //influxDB
            const influxDataB = new influx_db_1.InfluxDatabase();
            influxDataB.connectDB();
            influxDataB.autoCheck(61);
            //const NeoData = new NDInfluxDatabase()
            //NeoData.connectDB()
            //NeoData.tester()
            //await influxDataB.writeJsonData();
            // Connect to the mongo database
            // contains users, tokens, old datas, ...
            const database = new database_1.Database();
            yield database.connect({ useNewUrlParser: true });
            // Mail service
            const mailer = new mailer_1.Mailer();
            // Start the express app
            const protectedGetPaths = [
                '/api/auth/reset',
                '/api/auth/ping',
                '/api/notification*',
                '/api/alarm*',
                '/api/data',
                '/api/building*',
                "/api/user*",
            ];
            const protectedPostPaths = [
                '/api/auth/register',
                '/api/alarm*',
                '/api/data',
                '/api/building*',
                "/api/user*",
            ];
            const protectedPutPaths = [
                '/api/auth/register',
                '/api/auth/reset',
                '/api/alarm*',
                '/api/data',
                '/api/notification',
                '/api/building*',
                "/api/user*",
            ];
            const protectedDeletePaths = [
                '/api/auth/register',
                '/api/auth/reset',
                '/api/alarm*',
                '/api/data',
                '/api/building*',
                "/api/user*",
            ];
            const app = new app_1.App([
                new auth_1.AuthController('/api/auth', protectedGetPaths, protectedPostPaths, protectedPutPaths, protectedDeletePaths, mailer),
                new alarm_controller_1.AlarmController('/api/alarm'),
                new data_controller_1.DataController('/api/data', influxDataB),
                new building_controller_1.BuildingController('/api/building', influxDataB),
                new user_controller_1.UserController("/api/user"),
                new notification_controller_1.NotificationsController('/api/notification', mailer, influxDataB)
            ]);
            app.start();
        }
        catch (err) {
            console.error('Failed to start the server'.red);
            if (process.env.DEBUG === 'true') {
                console.log(err);
            }
            process.exit(1);
        }
    });
}
main();
