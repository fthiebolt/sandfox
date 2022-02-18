import { Injectable } from '@angular/core';
import { BehaviorSubject, of, from } from 'rxjs';
import { findIndex } from 'lodash';
import { AuthService } from './auth.service';
import { AlertMessagesService } from './alert-messages.service';
import { UIService } from './ui.service';



export interface IData {
	values: {
		name: string; // building's name
		data: {
			value: number;
			date: Date;
		}[];
		hidden?: boolean;
	}[];
	min?: number,
	max?: number,
	unit?: string
}


interface IFilterLevels {
	low: boolean;
	avg: boolean;
	high: boolean;
}
@Injectable({
	providedIn: 'root'
})

export class DataManagerService {
	// TODO: continue the rest of units
	public choosedType: BehaviorSubject<string> = new BehaviorSubject("");
	public choosedBuildings: BehaviorSubject<string[]> = new BehaviorSubject([]);
	public buildingDatas: BehaviorSubject<IData | null> = new BehaviorSubject(null);
	public allBuildingsLatestData: BehaviorSubject<IData | null> = new BehaviorSubject(null);

	public choosedFilterLevels: BehaviorSubject<IFilterLevels> =
		new BehaviorSubject({ low: true, avg: true, high: true });
	public buildings: BehaviorSubject<{ name: string, capterId: string }[]> = new BehaviorSubject([]);
	constructor(private authService: AuthService, private alertMessagesService: AlertMessagesService, private uiService: UIService) {

		// update datas list on buildings change
		this.choosedBuildings.subscribe(async () => {

			try {
				this.uiService.isLoading = of(true);
				// line chart data update
				await this.updateSelectedBuildings(await this.choosedType.value);
			} catch (err) {
				this.alertMessagesService.pushErrorMessage('Echec de récuperation de données');
			} finally {
				this.uiService.isLoading = of(false);
			}
		});
		// update datas list on type change
		this.choosedType.subscribe(async type => {
			try {
				//console.log(type)
				this.uiService.isLoading = of(true);
				await this.choosedType.value;
				// map data
				await this.updateLatestBuildings();
				// line chart data
				await this.updateSelectedBuildings(type);
				// update buildings list
				await this.updateBuildingsList(type);
			} catch (err) {
				this.alertMessagesService.pushErrorMessage('Echec de récuperation de données');
			} finally {
				this.uiService.isLoading = of(false);
			}
		});

		// Filter building on filter levels buttons click
		this.choosedFilterLevels.subscribe(levels => {
			this.filterData(levels);
		});
		this.updateLatestBuildings();

	}
	async updateBuildingsList(type: string) {
		try {
			if (!type) {
				this.buildings.next([])
			} else {
				this.buildings.next(await this.authService.get<{ name: string, capterId}[]>('/api/buildings', { params: { type } }).toPromise())
			}
		} catch (err) {
			this.alertMessagesService.pushErrorMessage('Error de recuperation de la liste des batiments');
		}
	}

	toggleType(type: string) {
		this.buildingDatas.next(null); //fix to type datas refresh
		if (this.choosedType) {
			const t = this.choosedType.value;
			this.choosedType.next(t === type ? "" : type);
		} else {
			this.choosedType.next(type);
		}
	}

	/**
	 * toggle the building from selected buildings (if the building deosn't exist it will be added, else it will be removed from the array)
	 * @param building building name
	 */
	toggleBuilding(building: string) {
		const choosedBuildings = this.choosedBuildings.value;
		let buildingIndex = choosedBuildings.findIndex(e => e === building);
		if (buildingIndex >= 0) //remove
			while (buildingIndex >= 0) {
				choosedBuildings.splice(buildingIndex, 1)
				buildingIndex = choosedBuildings.findIndex(e => e === building);
			}
		else //add
			choosedBuildings.push(building);
		this.choosedBuildings.next(choosedBuildings);
	}

	getData(building: string, type: string) {
		if (building && type) {
			return this.authService.get<IData | null>('/api/data/', { params: { buildings: building, type, to: new Date().getTime() } });
		}
	}
	async updateLatestBuildings() {
		try {

			// TODO: Change energy to selected type
			const type = this.choosedType.value;
			if (type) {
				const datas = await this.authService.get<IData | null>('/api/data/', { params: { type } }).toPromise();
				this.allBuildingsLatestData.next(datas);
				await this.filterData(this.choosedFilterLevels.value);
			}
			else {
				this.allBuildingsLatestData.next(null);
			}
		} catch (err) {
			// ERROR FAILED TO GET DATA
			this.allBuildingsLatestData.next(null);
			this.alertMessagesService.pushErrorMessage('Echec de récuperation des données des bâtiments');
		};
	}

	// For chart line
	async updateSelectedBuildings(type: string) {
		if (!type) { return; }
		const buildings: string[] = this.choosedBuildings.value;
		let datas = this.buildingDatas.value;
		// TODO: Add the buildigs list and re calculate the min and the max
		for (let index = 0; index < buildings.length; index++) {
			const building = buildings[index];
			const indexInDatas = !datas ? -1 : findIndex(datas.values, (data) => data.name === building);
			if (indexInDatas === -1 || !datas.unit) {
				// fetch the data for the new building
				let buildingData = await this.getData(building, type).toPromise()
					.catch(() => this.alertMessagesService.pushErrorMessage('Echec de récuperation des données des bâtiments'));
				//console.log(buildingData)
					if (buildingData && buildingData.values.length > 0) {
					if (!datas) { datas = buildingData }
					else { datas.values.push(buildingData.values[0]); }
					datas.unit = buildingData.unit;
				}
			}
		}
		// remove additionnal unselected data
		if (!datas) { return; }
		//console.log("DATAS : " + datas)
		for (let index = 0; index < datas.values.length; index++) {
			const buildingData = datas.values[index];
			const indexInBuildings = findIndex(buildings, (building) => building === buildingData.name);
			//console.log(`Index :${index} - bdata :  ${buildingData} + indexInBuilding`)

			if (indexInBuildings == -1) {
				// Delete the element
				datas.values.splice(index, 1);
			}
		}
		//console.log("END : " + datas)
		datas = this.updateStats(datas);
		this.buildingDatas.next(datas);
	}

	//   Hide filtered building (map)
	async filterData(filters: IFilterLevels) {
		const buildingsLatestData = this.allBuildingsLatestData.value;
		if (!buildingsLatestData) { return; }
		for (let i = 0; i < buildingsLatestData.values.length; i++) {
			const building = buildingsLatestData.values[i];
			if (!(building.data && building.data.length)) {
				building.hidden = true;
			}
			const percentage = building.data[0].value / (buildingsLatestData.max - buildingsLatestData.min) * 100;
			if (!filters.high && percentage > 66) {
				building.hidden = true;
			} else if (!filters.avg && percentage > 33 && percentage < 66) {
				building.hidden = true;
			} else if (!filters.low && percentage < 33) {
				building.hidden = true;
			} else {
				building.hidden = false;
			}
		}
		this.allBuildingsLatestData.next(buildingsLatestData);
	}
	updateStats(data: IData) {
		if (data.values && data.values.length > 0 && data.values[0].data && data.values[0].data.length > 0) {
			let max = data.values[0].data[0].value;
			let min = data.values[0].data[0].value;
			for (let i = 0; i < data.values.length; i++) {
				const building = data.values[i];
				for (let j = 0; j < building.data.length; j++) {
					const v = building.data[j];
					//somCar = somCar + (v.value * v.value)
					if (max < v.value) {
						max = v.value;
					}
					if (min > v.value) {
						min = v.value;
					}
				}
			}
			data.min = min;
			data.max = max;
			return data;
		} else {
			data.min = 0;
			data.max = 0;
			return data;
		}
	}
}
