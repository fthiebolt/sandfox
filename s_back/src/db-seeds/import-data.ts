import { flatten, sortBy } from "lodash";
import { readFileSync } from "fs";
import { dataModel } from "../models/data";
import moment = require("moment");

/**
 * @deprecated OLD, used with mongo based app (see 0.1.0)
 * kept in case of db change
 */
export const dataExporter = (async (type: string, filename:string) => {
	// TODO: get the input json file as a parameter
	try {
		let dataToExport: any = readFileSync(__dirname +'/'+ filename);
		console.log(`[${type}] Fichier chargé`.blue);

		dataToExport = JSON.parse(dataToExport);
		dataToExport = await Promise.all(dataToExport.map(async (e: any, i: number) => {
			return (await Promise.all(Object.keys(e)
				.map(key => ({
					name: key.toString(),
					value: Number(e[key]),
					date: moment(e.date, "DD/MM/YYYY hh:mm:ss").toDate()
				}))
			)).filter(e => e && e.value && !isNaN(e.value) && e.date instanceof Date && !isNaN(e.date.getTime()))
		}
		));
		dataToExport = flatten(dataToExport);
		dataToExport = sortBy(dataToExport, e => e.date);
		const seperatedData = seperateByName(dataToExport);
		const keys = Object.keys(seperatedData);
		let res = [];
		for (let j = 0; j < keys.length; ++j) {
			const resp = counterToDaily(seperatedData[keys[j]]);
			res.push(resp);
		}
		res = flatten(res);
		console.log(`[${type}] Trasformed data`.cyan);
		const Data = dataModel(type);
		await Data.insertMany(res)
		console.log(`[${type}] Success`.green);

	} catch (err) {
		if (err) {
			console.log('Failed'.red);
			console.log(err);
		} else {
		}
	}
});

/*
{
	name: string,
	value: number,
	date: Date
}
*/
interface IData {
	name: string;
	value: number;
	date: Date;
}
function seperateByName(arr: IData[]) {
	const res: any = {};
	for (let i = 0; i < arr.length; i++) {
		const e = arr[i];
		if (!res[e.name]) {
			res[e.name] = [];
		}
		res[e.name].push(e);
	}
	return res;
}
function counterToDaily(arr: IData[]): IData[] {
	const res: IData[] = [];
	let prev = arr[0];
	let firstIndex = 0;
	for (let i = 0; i < arr.length; i++) {
		prev = arr[i];
		if (prev) {
			firstIndex = i;
			break;
		}
	}
	let time = prev.date.getTime() + (1000 * 60 * 60);
	let dataMissingCounter = 0;
	// DEBUG
	let b = true
	let reset = 0;
	for (let i = firstIndex + 1; i < arr.length; i++) {
		const e = arr[i];
		if (time != e.date.getTime()) {
			dataMissingCounter += Math.abs(e.date.getTime() - time) / (1000 * 60 * 60);
			time = e.date.getTime();
		}
		if (time == e.date.getTime() && e.value && !isNaN(e.value) && e.value >= prev.value) {
			if (dataMissingCounter) {
				// Calculate the delta and push element to the array and finally reset the counter
				const delta = Math.abs(e.value - prev.value);
				const value = delta / dataMissingCounter;
				for (let j = 0; j <= dataMissingCounter; j++) {
					res.push({
						name: e.name,
						date: new Date(prev.date.getTime() + (j * (1000 * 60 * 60))),
						value
					});
				}
				dataMissingCounter = 0;
			}else{
				res.push({
					name:e.name,
					value: e.value - prev.value,
					date: e.date
				})
			}
			prev = e;
			time += 1000 * 60 * 60 // +1 hour
		}
		else if (e.value && !isNaN(e.value) && e.value < prev.value) {
			// TODO: check if i should see 10 or 20 element forward to detect errors or it's fine
			reset++;
			prev = e;
			e.value = 0;
			dataMissingCounter++
		} else {
			console.log('Blocked'.rainbow)
		}
	}
	return res;
}