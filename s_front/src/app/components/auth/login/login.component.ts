import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { AuthService, IUser } from 'src/app/services/auth.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
	_password: Observable<boolean> = of(false);
	signinForm = new FormGroup({
		username: new FormControl(''),
		password: new FormControl(''),
	});
	constructor(private router: Router, public authService: AuthService) {
		this.authService.user.subscribe((u: IUser) => {
			if (u) {
				this.goHome();
			}
		});
	}

	ngOnInit() {
	}
	onSubmit() {
		this.authService.login(this.signinForm.value.username, this.signinForm.value.password)
	}
	togglePassword() {
		this._password = this._password.pipe(map(p => p = !p));
	}
	goHome() {
		this.router.navigate(['/']);

	}
}
