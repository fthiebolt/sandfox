import { Component, OnInit } from '@angular/core';
import { UIService } from './services/ui.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	title = 'SandFox';
	constructor(public uiService: UIService,
	) {

	}
	ngOnInit() {

	}
}
