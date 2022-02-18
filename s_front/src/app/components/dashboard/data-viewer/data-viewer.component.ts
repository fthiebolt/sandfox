import { Component, OnInit } from '@angular/core';
import { UIService } from 'src/app/services/ui.service';
import { of } from 'rxjs';

@Component({
	selector: 'app-data-viewer',
	templateUrl: './data-viewer.component.html',
	styleUrls: ['./data-viewer.component.scss']
})
export class DataViewerComponent implements OnInit {
	_selected = of('');

	constructor(public uiService: UIService) { }

	ngOnInit() {
		this.uiService._hidden.subscribe(hidden => {
			hidden ? this.hide() : this.show();
		})
	}
	onClick(button) {
		this._selected.subscribe(selected => {
			if (selected === button) {
				this._selected = of("");
				this.hide();
			} else {
				this._selected = of(button);
				this.show();
			}
		});
	}
	show() {
		this.uiService.updateHeight();
		this.uiService._hidden = of(false);
	}
	hide() {
		this.uiService.updateHeight(0);
		this.uiService._hidden = of(true);
	}
}