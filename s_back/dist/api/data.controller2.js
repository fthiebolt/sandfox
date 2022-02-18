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
    constructor(path) {
        this.path = path;
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
     */
    controller(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { type, from, to, buildingsL } = req.query;
                if (!type) {
                    throw new Error('type is missing.');
                }
                ;
                type = String(type);
                const allBuildings = !buildingsL;
                const justLatestData = !(from || to);
                const fromTheBegin = !(justLatestData && from);
                const toTheEnd = !(justLatestData && to);
                var buildings;
                if (allBuildings) {
                    //get all buildings List
                    buildings = this.influxDB.getBuildingsList(String(type), "");
                }
                else {
                    buildings = this.influxDB.getBuildingsList(String(type), String(buildingsL));
                }
                let data;
                if (justLatestData)
                    data = yield this.getLatestData(buildings, type);
                else if (fromTheBegin) {
                    data = yield this.getData(buildings, type, new Date());
                } //else if(toTheEnd){
                //this.getData(buildings, type) }
                else
                    data = yield this.getData(buildings, type, new Date(String(from)), new Date(String(to)));
            }
            catch (err) {
                res.status(500).json({ message: 'Internal server error' });
                if (process.env.DEBUG === 'true') {
                    console.log(err);
                }
            }
        });
    }
    getLatestData(buildings, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.influxDB.getData(buildings, type);
        });
    }
    getData(buildings, type, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    min() {
    }
    max() {
    }
}
exports.DataController = DataController;
