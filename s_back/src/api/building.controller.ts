import { IController } from "../interfaces";
import { Router, Request, Response } from "express";
import { InfluxDatabase } from "../influx.db";

export class BuildingController implements IController{
    public router!: Router
	constructor(public path: string, public influxDB:InfluxDatabase){
		this.initializeRouter()
	}
	initializeRouter(){
		this.router = Router();
		// GET /api/buildigs
		this.router.get(this.path+"s",this.getBuildings.bind(this))
	}
	/**
	 * @description when db contained only capternames, kept and updated for Influx Demo in case NeoData doesn't name 
	 * @param req 
	 * @param res 
	 * see @influx.db.ts for getBuildingsList()
	 */
	async getBuildings(req:Request, res:Response){
        try {
			const {type} = req.query
			//console.log("TYPE : "+type)
            if(!type){ throw new Error("No type was provided");}
            //resArray:{name:string, capterID:string}[] = []
            //get capter list from db (old method assumes 1 capter per building)
            //pour chaque capteur s'il n'est pas déjà ajouté, push
			let buildinglist = await this.influxDB.getBuildingsList(String(type), "")
            if(!buildinglist.length){ throw new Error("No buildings found for this type");}

            res.json(buildinglist)
        } catch(err) {
			if(process.env.DEBUG=="true"){
				console.log(err);
			}
			res.status(400).json({message:"Bad request"});
		}
	}
}