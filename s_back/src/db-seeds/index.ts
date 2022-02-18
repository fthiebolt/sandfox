import { config } from "dotenv";
import "colors";
import { capterModel } from "../models/capter";
import { Database } from "../database";
import { dataModel } from "../models/data";
import { Unit } from "../models/unit";
import { dataExporter } from "./import-data";
import { captersList } from "./capters";
import { units } from "./units";
/**
 * @deprecated OLD, used with mongo based app (see 0.1.0)
 * kept in case of db change
 */
(async()=>{
	try{
		config();
		const database = new Database();
		await database.connect({useNewUrlParser:true});

		for (let i = 0; i < captersList.length; i++) {
			const e = captersList[i];
			const Capter = capterModel(e.name);
			await Capter.insertMany(e.list);
			await dataExporter(e.name,e.name+'.json')	
		}
		await Unit.insertMany(units);
		console.log("SUCCESS".bgGreen);
		process.exit(0);
	}catch(err){
		console.log('Failed to export data');
		console.log(err);
	}
})()