import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
export interface IMessage {
	message: string;
	date: Date;
}

@Injectable({
	providedIn: 'root'
})
export class AlertMessagesService {
	_successMessage: BehaviorSubject<IMessage> = new BehaviorSubject(null);
	_errorMessage: BehaviorSubject<IMessage> = new BehaviorSubject(null);
	constructor(
		private route: ActivatedRoute
	) {
		// Check get param for message notifications
		this.route.queryParams.subscribe(params => {
			const { error, success } = params
			if (error) {
				this.pushErrorMessage(error)
			}
			if (success) {
				this.pushSuccessMessage(success)
			}
		})

	}
	pushErrorMessage(message) {
		if (!message || message == "") { return; }
		message = { message, date: new Date() };
		if (!message) { return; } else {
			this._errorMessage.next(message);
		}
	}
	pushSuccessMessage(message) {

		if (!message || message == "") { return; }
		message = { message, date: new Date() };
		if (!message) { return; } else {
			this._successMessage.next(message);
		}
	}
}
