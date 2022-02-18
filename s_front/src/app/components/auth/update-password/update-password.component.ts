import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormControl } from '@angular/forms';
import { AlertMessagesService } from 'src/app/services/alert-messages.service';
@Component({
	selector: 'app-update-password',
	templateUrl: './update-password.component.html',
	styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnInit {
	resetPassword: FormGroup;
	userId: string
	token: string
	constructor(private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private alertMessageService: AlertMessagesService
	) {
		this.resetPassword = new FormGroup({
			newPassword: new FormControl('')
		})
	}
	ngOnInit() {
		this.getRequestParams()
	}
	getRequestParams() {
		this.route.queryParams.subscribe(params => {
			const { user_id, token } = params
			if (!(user_id && token && !this.authService.updateStatus())) {
				this.router.navigateByUrl('/')
			} else {
				this.userId = user_id
				this.token = token
			}
		})
	}

	async onSubmit() {
		const newPassword = this.resetPassword.value.newPassword
		if (newPassword) {
			try {

				const resp = await this.authService.post('/api/auth/reset', {
					password: newPassword,
					user_id: this.userId,
					token: this.token
				}).toPromise()
				this.alertMessageService.pushSuccessMessage('Votre mot de passe est mise à jour')
				this.router.navigateByUrl('/login')
			} catch (err) {
				this.alertMessageService.pushErrorMessage('Mot de passe invalide!')
			}
		}
	}
}
