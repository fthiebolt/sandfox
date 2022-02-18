import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUser, AuthService } from 'src/app/services/auth.service';
import { AlertMessagesService } from 'src/app/services/alert-messages.service';

@Component({
	selector: 'app-users',
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
	users: BehaviorSubject<IUser[]>
	constructor(
		private authService: AuthService,
		private alertMessagesService: AlertMessagesService
	) {
		this.users = new BehaviorSubject([])
	}

	async ngOnInit() {
		this.updateUsersList()
	}
	async updateUsersList() {
		try {
			this.users.next(await this.authService.get<IUser[]>('/api/users').toPromise())
		} catch (err) {
			this.alertMessagesService.pushErrorMessage('Echec de connexion au serveur')
		}
	}
}
