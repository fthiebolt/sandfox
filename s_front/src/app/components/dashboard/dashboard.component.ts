import { Component, OnInit, Injectable} from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UIService } from 'src/app/services/ui.service';
import { DataManagerService } from 'src/app/services/data-manager.service';
//import { SwPush } from '@angular/service-worker/'; // uncomment when prod && server OK 

const PUBLIC_VAPID_SERVER_KEY = 'BCpilViE1g7SUhvLw1dkvC67hNDhd1OtlIxN8lJVeh4dfg66KpvnY0FTHATHZasSkBHVO3xdfLC7aBnOGDsi1ZA'

@Injectable()
@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
	_filter = of(false);
	_info = of(true);

	constructor(private authService: AuthService, public uiService: UIService, public dataManagerService: DataManagerService, /*private swPush : SwPush*/) {
		uiService.dashboardSelected = of('map');
		//console.log(swPush.isEnabled)
	}

	ngOnInit() {
		//this.subscribeToPush()
	}
	toggleFilterButton() {
		this._filter.subscribe(f => this._filter = of(!f));
	}
	toggleFilter(filter) {
		const filters = this.dataManagerService.choosedFilterLevels.value;

		filters[filter] = !filters[filter];
		this.dataManagerService.choosedFilterLevels.next(filters);
	}
	toggleInfo() {
		this._info.subscribe(info => {
			this._info = of(!info);
		});
	}
	/**
	 * Push notifications skeleton, uncomment SwPush when in prod mode to test  
	 */
	/*
	private async subscribeToPush(){
		try{
			const sub = await this.swPush.requestSubscription({
				serverPublicKey: PUBLIC_VAPID_SERVER_KEY,
			})
			const res = await this.authService.put('/api/notification', sub).toPromise();
			console.log(res)
		} catch(error) {
			console.error("Unable to subscribe : " + error)
		}
	}
	*/
}
