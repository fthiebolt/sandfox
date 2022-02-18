import { Injectable } from '@angular/core';
import { of, Observable, BehaviorSubject } from 'rxjs';
@Injectable({
	providedIn: 'root'
})
export class UIService {
	public sidenavWidth =  new BehaviorSubject(0);
	public mapHeight = of(this.vh(100)); // 50vh
	public lineChartHeight;
	public headerHeight;
	public dashboardSelected;
	public addAlarm = of(false);
	public _hidden = of(true);
	public innerWidth = window.innerWidth;
	public innerHeight = window.innerHeight;
	public colors = [
		'#389bd3',
		'#5FE3A1',
		'#A3A1FB',
		'#FED54F',
		'#E57373',
		'#90ee02',
		'#ee6002',
		'#aa7fb6',
		'#57D9FE',
		'#58b661',
		'#a16c3f',
		'#fcbd1f',
		'#00dee3'];
	public isLoading:Observable<boolean> =of(true);
	constructor() {
		this.mapHeight = of(this.vh(50) - this.rem(4)); // 50vh
		this.lineChartHeight = of(this.vh(50));
		this.headerHeight = this.rem(4);
	}
	rem(n): number {
		return parseFloat(getComputedStyle(document.documentElement).fontSize) * n;
	}
	vh(n) {
		return document.documentElement.clientHeight * (n / 100);
	}
	updateHeight(lineChartHeight?) {
		if (lineChartHeight !== undefined) {
			this.lineChartHeight = of(lineChartHeight);
			this.mapHeight = of(document.documentElement.clientHeight - lineChartHeight - this.rem(4));
		} else {
			this.mapHeight = of(this.vh(50) - this.rem(4)); // 50vh
			this.lineChartHeight = of(this.vh(50));
		}
	}
	dashSelect(c) {
		this.dashboardSelected = of(c);
	}
}
