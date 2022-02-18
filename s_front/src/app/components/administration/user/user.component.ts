import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, IUser } from 'src/app/services/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { UIService } from 'src/app/services/ui.service';
import { AlertMessagesService } from 'src/app/services/alert-messages.service';
import { isEqual } from "lodash";
@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
	userId: BehaviorSubject<string | null>
	user: BehaviorSubject<IUser | null>
	userUpdate: FormGroup;
	userFormIsChanged: BehaviorSubject<boolean>
	constructor(private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private uiService: UIService,
		private alertMessageService: AlertMessagesService
	) {
		this.userId = new BehaviorSubject(null);
		this.user = new BehaviorSubject(null);
		this.userUpdate = new FormGroup({
			role: new FormControl(''),
			email: new FormControl(''),
			phoneNumber: new FormControl(''),
			firstName: new FormControl(''),
			lastName: new FormControl(''),
			username: new FormControl(''),
			activated: new FormControl(false)
		})
		this.userFormIsChanged = new BehaviorSubject(false)
	}

	ngOnInit() {
		this.uiService.isLoading = of(true)
		this.userId.subscribe(id => {
			if (id) {
				this.authService.get<IUser>('/api/user/' + id).subscribe(u => {
					this.user.next(u)
					this.uiService.isLoading = of(false)
				})
			}
		}, () => {
			this.uiService.isLoading = of(false)
			this.alertMessageService.pushErrorMessage('Echec de récuperation des données')
			this.router.navigateByUrl('/administrator/users')
		})
		this.user.subscribe(u => {
			if (!u) { return }
			this.userUpdate.controls.username.setValue(u.username)
			this.userUpdate.controls.firstName.setValue(u.first_name)
			this.userUpdate.controls.lastName.setValue(u.last_name)
			this.userUpdate.controls.phoneNumber.setValue(u.phone_number ? u.phone_number : '')
			this.userUpdate.controls.email.setValue(u.email)
			this.userUpdate.controls.activated.setValue(u.activated)

			this.userUpdate.controls.role.setValue(u.role)
			// this.userUpdate.setValue(u)
		})
		this.userUpdate.valueChanges.subscribe(c => {
			this.userFormIsChanged.next(!isEqual(this.getFormUser(), this.user.value))
		})
		this.updateUserId()
	}
	updateUserId() {
		this.route.params.subscribe(params => {
			const { id } = params
			if (!id) {
				this.router.navigateByUrl('/administrator/users')
			}
			this.userId.next(id)
		}, () => {
			this.uiService.isLoading = of(false)
			this.alertMessageService.pushErrorMessage('Echec de récuperation des données')
		})
	}
	onSubmit() {
		this.authService.put('/api/user/' + this.userId.value, this.getFormUser()).subscribe(() => {
			this.alertMessageService.pushSuccessMessage('L\'utilisateur est mise à jour avec success')
			this.router.navigateByUrl('/administration/users')
		}, (err) => {
			this.alertMessageService.pushErrorMessage(err.error.message || 'Echec de connexion au serveur')
		})
	}
	getFormUser(): IUser {
		const user: IUser = {
			id: this.userId.value,
			role: this.userUpdate.controls.role.value,
			email: this.userUpdate.controls.email.value,
			first_name: this.userUpdate.controls.firstName.value,
			last_name: this.userUpdate.controls.lastName.value,
			username: this.userUpdate.controls.username.value
		}
		if (this.userUpdate.controls.phoneNumber.value) {
			user.phone_number = this.userUpdate.controls.phoneNumber.value
		}

		user.activated = this.userUpdate.controls.activated.value ? true : false

		return user
	}
	onDelete() {
		if (this.userId.value) {
			this.authService.delete('/api/user/' + this.userId.value).subscribe(() => {
				this.alertMessageService.pushSuccessMessage('L\'utilisateur a été supprimé avec success')
				this.router.navigateByUrl('/administration/users')
			}, (err) => {
				this.alertMessageService.pushErrorMessage(err.error.message || 'Echec de connexion au serveur')
			})
		}
	}
	resetPassword() {
		if (this.userId.value) {
			this.authService.get('/api/auth/reset/' + this.userId.value).subscribe(() => {
				this.alertMessageService.pushSuccessMessage('un mail a été envoyé afin de reinstaller le mot de passe')
				this.router.navigateByUrl('/administration/users')
			}, () => {
				this.alertMessageService.pushErrorMessage('Erreur de connexion au serveur')
			})
		}
	}
}
