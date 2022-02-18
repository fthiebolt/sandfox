import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AlarmesComponent } from './components/alarmes/alarmes.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/auth/login/login.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { UpdatePasswordComponent } from './components/auth/update-password/update-password.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { UsersComponent } from './components/administration/users/users.component';
import { UserComponent } from './components/administration/user/user.component';
import { RegisterComponent } from './components/administration/register/register.component';

const routes: Routes = [

	{
		path: '',
		redirectTo: '/dashboard',
		pathMatch: 'full'
	},
	{
		path: 'dashboard',
		component: DashboardComponent,
	},
	{
		path: 'alarms',
		component: AlarmesComponent
	},

	{
		path: 'notifications',
		component: NotificationsComponent
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'reset',
		component: UpdatePasswordComponent
	},
	{
		path: 'administration',
		component: AdministrationComponent
	},
	{
		path: 'administration/users',
		component: UsersComponent
	},
	{
		path: 'administration/user/:id',
		component: UserComponent
	},
	{
		path: 'administration/register',
		component: RegisterComponent
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
