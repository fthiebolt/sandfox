/**
 * IData as used and expected by front
 * add rooms everywhere if needed. Search @room too, most outputs are ready
 */
export interface IData{
	values:{
		name:string; // building's name
		data:{
			value: number;
			date: Date;
		}[];
	}[];
	min?: number,
	max?: number,
	unit?: string
}


/*export interface IData{
	values:{
		location:string;
		name:string; // building's name
		room?:string;
		data:{
			value: number;
			date: Date;
		}[];
	}[];
	min?: number,
	max?: number,
	unit?: string
}*/