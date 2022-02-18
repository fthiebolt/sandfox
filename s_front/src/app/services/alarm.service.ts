import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

import { AlertMessagesService } from './alert-messages.service';
import { DataManagerService } from './data-manager.service';

export interface IAlarm {
	_id: string;
	user_id: string;
	buildings: string[];
	type: string;
	high_level?: {
		seuil_max?: number;
		seuil_min?: number;
	};
	avg_level?: {
		seuil_max?: number;
		seuil_min?: number;
	};
	low_level?: {
		seuil_max?: number;
		seuil_min?: number;
	};
	notification: boolean;
	sms: boolean;
	email: boolean;
}
export interface INotifcation {
	_id: string;
	value: number;
	date: Date;
	alarm: IAlarm;
}
@Injectable({
	providedIn: 'root'
})
export class AlarmService {
	public emptyAlarm: IAlarm = {
		_id: null,
		buildings: [],
		email: null,
		sms: null,
		notification: null,
		type: null,
		user_id: null
	};
	public alarms: BehaviorSubject<IAlarm[]> = new BehaviorSubject([]);
	// public notifications: BehaviorSubject<>

	constructor(private authService: AuthService,
		private alertMessagesService: AlertMessagesService, private dataManagerService: DataManagerService) { }

	public async addAlarm(alarm: IAlarm): Promise<boolean> {
		if (!(alarm.buildings && alarm.type) || !alarm.buildings.length) {
			this.alertMessagesService.pushErrorMessage('Il manque des bâtiments ou type d\'energie.');
			return false;
		} else {
			const resp = await this.authService.post<{ message: string }>('/api/alarm', alarm).toPromise();
			this.alertMessagesService.pushSuccessMessage(resp.message);
			this.updateAlarms();
			return true;
		}
	}
	updateAlarms() {
		this.authService.get<IAlarm[]>('/api/alarms').subscribe(res => {
			this.alarms.next(res);
		}, (err) => {
			this.alertMessagesService.pushErrorMessage('Echec de récuperation de la liste d\'alarmes');
		});
	}
	async updateAlarm(alarm: IAlarm) {
		const res = await this.authService.put('/api/alarm/', alarm).toPromise();
		this.updateAlarms();
	}
	deleteAlarm(id: string) {
		this.authService.delete('/api/alarm/' + id).subscribe((res) => {
			//SUCCESS
			this.alertMessagesService.pushSuccessMessage("L'alarme a été supprimé");
			this.updateAlarms();

		}, (err) => {
			//FAILED
			this.alertMessagesService.pushErrorMessage("Echec de suppression de l'alarme");
		});
	}
}
