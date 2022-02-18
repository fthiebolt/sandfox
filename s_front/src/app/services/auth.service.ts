import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as jwtDecode from 'jwt-decode';

import { environment } from "../../environments/environment";
import { AlertMessagesService } from './alert-messages.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
export interface IUser {
	id?: string;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	role: string;
	phone_number?: string;
	activated?: boolean
}
interface IPayload {
	user: IUser;
	exp: number;
	iat: number;
}
@Injectable({
	providedIn: 'root'
})
export class AuthService {
	public url: string = environment.server_url;
	user: BehaviorSubject<IUser> = new BehaviorSubject(null);
	unprotectedRoutes = ['/reset']
	constructor(public http: HttpClient, public alertMessagesService: AlertMessagesService, public router: Router) {
		this.updateStatus();
		this.ping()
	}
	login(username: string, password: string) {
		this.http.post<{ token: string }>(this.url + '/api/auth/login', { username, password }).subscribe(resp => {
			const token = resp.token;
			if (token) {
				localStorage.setItem('user_token', token);
				const payload: IPayload = jwtDecode(token);
				this.updateStatus();
			}
		}, (err) => {
			this.alertMessagesService.pushErrorMessage("Nom d'utilisateur ou mot de pass incorrecte.");
		});
	}
	setSession(token: string) {
		localStorage.setItem('user_token', token);
	}
	public logout() {
		localStorage.removeItem('user_token');
		this.updateStatus();
		this.router.navigateByUrl('/login')
	}
	public updateStatus(): boolean {
		const token = localStorage.getItem('user_token');
		if (token) {
			const payload: IPayload = jwtDecode(token);
			if (payload.exp > new Date().getTime() / 1000) {
				this.user.next(payload.user);
				return true;
			}
		}
		this.user.next(null);
		return false;
	}
	public get<T>(path: string, options = {}): Observable<T> {
		options = this.addAuthHeader(options);
		return this.http.get<T>(this.url + path, options)

	}
	public post<T>(path: string, body: any = {}, options = {}): Observable<T> {
		options = this.addAuthHeader(options);
		return this.http.post<T>(this.url + path, body, options)
	}
	public delete<T>(path: string, options = {}): Observable<T> {
		options = this.addAuthHeader(options);
		return this.http.delete<T>(this.url + path, options)
	}
	public put<T>(path: string, body, options = {}): Observable<T> {
		options = this.addAuthHeader(options);
		return this.http.put<T>(this.url + path, body, options)
	}
	addAuthHeader(options) {
		Object.assign(options, { headers: { authorization: `Bearer ${localStorage.getItem('user_token')}` } });
		return options;
	}
	public ping() {
		if (this.updateStatus()) {
			const options = this.addAuthHeader({});
			this.http.get(this.url + "/api/auth/ping", options).subscribe(() => {
				// Ok
			}, () => {
				this.logout()
			})
		}
	}

}