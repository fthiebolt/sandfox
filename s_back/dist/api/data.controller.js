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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataController = void 0;
const express_1 = require("express");
class DataController {
    constructor(path, influxDB) {
        this.path = path;
        this.influxDB = influxDB;
        this.initializeRouter();
        //this.influxDB = new InfluxDatabase()		
    }
    initializeRouter() {
        this.router = express_1.Router();
        // Get /api/data/?type=:type&[from=:date]&[to=:date]&[buildings=:building[]]
        this.router.get(this.path, this.controller.bind(this));
    }
    /**
     * get the consommation data from the database
     * @param req.query.type :string			energetic type of the data
     * @param req.query.buildings? :string[]	the buildings, to get the data for, if it's empty --> all buildings
     * @param req.query.from? :Date 			begining data itervale, if empty --> from the first date
     * @param req.query.to? :Date				end data intervale, if empty --> get data until last date.
     * if from and to are empty --> get last data for each building
     * @todo from/to system, see influx.db.ts
     */
    controller(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { type, from, to, buildings } = req.query; //for var name change, change it in front to. Won't work otherwise (undefined param)
                if (!type) {
                    throw new Error('type is missing.');
                }
                ;
                type = String(type);
                //console.log("Controller buildings list : " + buildings)
                const allBuildings = !buildings;
                const justLatestData = !(from || to);
                const fromTheBegin = !(justLatestData && from);
                const toTheEnd = !(justLatestData && to);
                var buildingsLL;
                if (allBuildings) {
                    //get all buildings List (toggle type)
                    buildingsLL = yield this.influxDB.getBuildingsList(String(type), "");
                }
                else { //used with front toggle building
                    buildingsLL = yield this.influxDB.getBuildingsList(String(type), String(buildings));
                    //console.log("not all building - " +buildingsLL)
                }
                let data;
                if (justLatestData)
                    data = yield this.getLatestData(buildingsLL, type);
                else if (fromTheBegin) {
                    data = yield this.getData(buildingsLL, type, new Date(new Date().getTime() - 30 * 86400 * 1000));
                } //else if(toTheEnd){
                //this.getData(buildings, type) }
                else
                    data = yield this.getData(buildingsLL, type, new Date(String(from)), new Date(String(to)));
                res.json(data);
            }
            catch (err) {
                res.status(500).json({ message: 'Internal server error' });
                if (process.env.DEBUG === 'true') {
                    console.log(err);
                }
            }
        });
    }
    /**
     * both calls influx.db getData() with a change to latest?
     * @returns IData with last() for every type/=>buildings in InfluxDB
     */
    getLatestData(buildings, type) {
        return this.influxDB.getData(buildings, type, undefined, undefined, true);
    }
    getData(buildings, type, from, to) {
        //console.log("getData buildings list : " + buildings)
        return this.influxDB.getData(buildings, type, from, to);
    }
    /**
     * @todo Query or compute ? To Test
     * @description for now influx.db getData() returns min and max
     */
    min() {
        //TODO
    }
    max() {
        //TODO
    }
}
exports.DataController = DataController;
