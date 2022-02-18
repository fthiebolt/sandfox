import { Router, Request, Response } from "express";

import { ICapter, IData, IController } from "../interfaces";
//import { capterModel, dataModel, Unit, IDataModel } from "../models";

import {FluxTableMetaData, FluxResultObserver, QueryApi} from '@influxdata/influxdb-client'
import { InfluxDatabase } from "../influx.db";
import { IBuilding } from "../interfaces/building";
import { rejects } from "assert";


export class DataController implements IController{
	router!: Router;
	constructor(public path: string, public influxDB: InfluxDatabase) {
        this.initializeRouter();
        //this.influxDB = new InfluxDatabase()		
    }
    initializeRouter() {
		this.router = Router();
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
	private async controller(req: Request, res: Response) {
        try {
            let { type, from, to, buildings } = req.query; //for var name change, change it in front to. Won't work otherwise (undefined param)
            if (!type) { throw new Error('type is missing.') };
            type = String(type)
            //console.log("Controller buildings list : " + buildings)
            const allBuildings: boolean = !buildings;
			const justLatestData: boolean = !(from || to);
			const fromTheBegin: boolean = !(justLatestData && from);
            const toTheEnd: boolean = !(justLatestData && to);
            var buildingsLL : IBuilding[]
            if(allBuildings){
                //get all buildings List (toggle type)
                buildingsLL = await this.influxDB.getBuildingsList(String(type), "")
            } else { //used with front toggle building
                buildingsLL = await this.influxDB.getBuildingsList(String(type), String(buildings))
                //console.log("not all building - " +buildingsLL)
            }


            let data:IData;
            if(justLatestData) data = await this.getLatestData(buildingsLL, type)
            else if (fromTheBegin){
                data = await this.getData(buildingsLL, type, new Date(new Date().getTime()-30*86400*1000))
            } //else if(toTheEnd){
                //this.getData(buildings, type) }
            else data = await this.getData(buildingsLL, type, new Date(String(from)), new Date(String(to)))
            res.json(data)
        } catch (err) {
            res.status(500).json({ message: 'Internal server error' });
            if (process.env.DEBUG === 'true') {
                console.log(err);
            }
        }
    }

    /**
     * both calls influx.db getData() with a change to latest?
     * @returns IData with last() for every type/=>buildings in InfluxDB
     */
    private getLatestData(buildings: IBuilding[], type: string) {
        return this.influxDB.getData(buildings, type, undefined, undefined, true)
    }
    private getData(buildings: IBuilding[], type: string, from?: Date, to?: Date) {
        //console.log("getData buildings list : " + buildings)
        return this.influxDB.getData(buildings, type, from, to)
    }

    /**
     * @todo Query or compute ? To Test
     * @description for now influx.db getData() returns min and max
     */
    private min() {
        //TODO
    }
    private max() {
        //TODO

    }
}