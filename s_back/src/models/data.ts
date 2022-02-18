import { Document, Schema, Model, model } from "mongoose";

export interface IDataModel extends Document{
	name: string,
	value: number,
	date: Date
}

export const dataSchema: Schema<IDataModel> = new Schema<IDataModel>({
	name: String,
	value: Number,
	date: Date
},{
	strict: false
});

/**
 * @deprecated Used with mongo
 */
export function dataModel(type: string):Model<IDataModel>{
	return model<IDataModel>('Data',dataSchema,type);
}