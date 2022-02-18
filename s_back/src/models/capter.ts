import { Schema, model, Document, Model } from "mongoose";
import { ICapter } from "../interfaces/capter";
/**
 * @deprecated used with mongo, kept in case of db change
 */
interface ICapterModel extends ICapter, Document{}
export const capterSchema:Schema<ICapterModel>= new Schema<ICapterModel>({
	capter_id: String, 
	name: String
});

/**
 * @deprecated used with mongo
 */
export function capterModel(type:string){
	return model<ICapterModel>('Capters',capterSchema,`${type}_capters_list`);
}