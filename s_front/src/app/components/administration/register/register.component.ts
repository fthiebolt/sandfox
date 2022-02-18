import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertMessagesService } from 'src/app/services/alert-messages.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
	registerForm = new FormGroup({
		username: new FormControl(''),
		password: new FormControl(''),
		password2: new FormControl(''),
		email: new FormControl(''),
		last_name: new FormControl(''),
		first_name: new FormControl(''),
		phone_number: new FormControl(''),
		role: new FormControl('')
	});
	constructor(public authService: AuthService, public alertMessagesService: AlertMessagesService, private router: Router) {
		// this.authService._user.subscribe(console.log);
	}

	ngOnInit() {
	}
	onSubmit() {
		const { username, password, password2, email, last_name, first_name, phone_number } = this.registerForm.value;
		if (!(password && password2 && password === password2)) {
			this.alertMessagesService.pushErrorMessage('Les deux mots de passe ne sont pas identique')
		}
		else if (password.length < 7) {
			this.alertMessagesService.pushErrorMessage('Le mot de pass est très court')
		} else {
			this.authService.post('/api/auth/register', this.registerForm.value).subscribe(() => {
				this.alertMessagesService.pushSuccessMessage('L\'utilisateur a été créé avec success')
				this.router.navigateByUrl('/administration')
			}, (err) => {
				this.alertMessagesService.pushErrorMessage(err.error.message || "Erreur de connexion au serveur")
			})
		}
		// this.authService.register(username, password, password2, email, first_name, last_name, phone_number);

	}
	onClosed(): void {
		this.alertMessagesService._errorMessage.next(null);

	}
}
