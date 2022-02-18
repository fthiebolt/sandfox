import { Schema, model, Document, Model } from "mongoose";

/**
 */
export class UnitConv {
	private type:string;
	private unit:string;
	constructor(type:string){
		this.type = type;
		this.unit = this.convert(type)
	}

	private convert(type:string):string{
		//TODO
		switch(type){
			case "Electricité":
				return "KwH"
			case "Calorie":
				return "Kcal"
			case "Air_comprimé":
				return "m\u00B3/h"

			default:
				return "?"
		}
	}
	public getUnit(){
		return this.unit
	}
	public getType(){
		return this.type
	}
}

/**
 * @deprecated used with Mongo
 */
export interface IUnitModel extends Document{
	type: string, 
	unit: string
}
export const unitSchema:Schema<IUnitModel> = new Schema<IUnitModel>({
	type: String, 
	unit: String
});
export const Unit: Model<IUnitModel>= model("Unit",unitSchema,"unit");