"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NDInfluxDatabase = void 0;
const influxdb_client_1 = require("@influxdata/influxdb-client");
require('dotenv').config();
const DEMO = true; //demoMode else goes to NeoData
const TOKEN = process.env.INFLUX_TOKEN;
const ORG = process.env.INFLUX_ORG;
//const BUCKET = process.env.INFLUX_BUCKET;
const URL = process.env.INFLUX_URL;
const BUCKET = "sensors_week";
const DATADIR_PATH = './src/db-seeds/data-2019/';
const typeTab = ["Electricité", "Calorie", "Air_comprimé"];
/**
 * @class InfluxDatabase
 * @description Used as Query / Writing API to InfluxDB, DEMO refers to private generated data DB
 */
class NDInfluxDatabase {
    constructor() {
    }
    /**
     * @method connectDB
     * @description Connects to selected DB (see const TOKEN URL ORG BUCKET) and creates query&writing Api
     *
     */
    connectDB() {
        try {
            console.log("Connecting to NeoData");
            this.client = new influxdb_client_1.InfluxDB({ url: String(URL), token: TOKEN });
            this.queryApi = this.client.getQueryApi(String(ORG));
        }
        catch (error) {
            console.error("Unable to connect selected InfluxDB" + error);
        }
    }
    tester() {
        var _a;
        let fluxQuery = `from(bucket:"${String(BUCKET)}") |> range(start:-1d) |> last()`;
        (_a = this.queryApi) === null || _a === void 0 ? void 0 : _a.queryRows(fluxQuery, {
            next(row, tableMeta) {
                const b = tableMeta.toObject(row);
                //console.log(b)
                console.log(b._measurement + ", " + b._time + " |> " + b._field + " |> " + b.location + "/" + b.building + "/" + b.room + "__" + b.kind + "/" + b.subID + "/" + b.unitID + " - \t" + b._value);
            },
            error(error) {
                console.error('QUERY FAILED', error);
            }, complete() {
                console.log("QUERY SUCCESS");
            }
        });
    }
}
exports.NDInfluxDatabase = NDInfluxDatabase;
