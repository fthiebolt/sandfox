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
exports.BuildingController = void 0;
const express_1 = require("express");
class BuildingController {
    constructor(path, influxDB) {
        this.path = path;
        this.influxDB = influxDB;
        this.initializeRouter();
    }
    initializeRouter() {
        this.router = express_1.Router();
        // GET /api/buildigs
        this.router.get(this.path + "s", this.getBuildings.bind(this));
    }
    /**
     * @description when db contained only capternames, kept and updated for Influx Demo in case NeoData doesn't name
     * @param req
     * @param res
     * see @influx.db.ts for getBuildingsList()
     */
    getBuildings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { type } = req.query;
                //console.log("TYPE : "+type)
                if (!type) {
                    throw new Error("No type was provided");
                }
                //resArray:{name:string, capterID:string}[] = []
                //get capter list from db (old method assumes 1 capter per building)
                //pour chaque capteur s'il n'est pas déjà ajouté, push
                let buildinglist = yield this.influxDB.getBuildingsList(String(type), "");
                if (!buildinglist.length) {
                    throw new Error("No buildings found for this type");
                }
                res.json(buildinglist);
            }
            catch (err) {
                if (process.env.DEBUG == "true") {
                    console.log(err);
                }
                res.status(400).json({ message: "Bad request" });
            }
        });
    }
}
exports.BuildingController = BuildingController;
