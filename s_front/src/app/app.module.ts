import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {registerLocaleData} from '@angular/common'
import localeFr from '@angular/common/locales/fr'
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule, AlertModule } from 'ngx-bootstrap';
import { LineChartModule } from "@swimlane/ngx-charts";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MapComponent } from './components/dashboard/map/map.component';
import { SidenavComponent } from './components/dashboard/sidenav/sidenav.component';
import { DataViewerComponent } from './components/dashboard/data-viewer/data-viewer.component';
import { ListComponent } from './components/dashboard/list/list.component';
import { AlarmesComponent } from './components/alarmes/alarmes.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddAlarmeComponent } from './components/dashboard/sidenav/add-alarme/add-alarme.component';
import { GeneralViewComponent } from './components/dashboard/data-viewer/line-chart/general-view/general-view.component';
import { LoginComponent } from './components/auth/login/login.component';
import { JStringifyPipe } from './pipes/jstringify.pipe';
import { LineChartComponent } from './components/dashboard/data-viewer/line-chart/line-chart.component';
import { PieChartComponent } from './components/dashboard/data-viewer/pie-chart/pie-chart.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { MessagesPopupComponent } from './components/messages-popup/messages-popup.component';
import { DataViewer2Component } from './components/dashboard/data-viewer2/data-viewer2.component';
import { RegisterComponent } from './components/administration/register/register.component';
import { LoadingComponent } from './components/loading/loading.component';
import { TimelineComponent } from './components/dashboard/data-viewer/timeline/timeline.component';
import { UpdatePasswordComponent } from './components/auth/update-password/update-password.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { UsersComponent } from './components/administration/users/users.component';
import { UserComponent } from './components/administration/user/user.component';
import { ServiceWorkerModule } from '@angular/service-worker'
import { environment } from 'src/environments/environment';

// Set fr local for date format inside html files 
registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MapComponent,
    SidenavComponent,
    DataViewerComponent,
    ListComponent,
    AlarmesComponent,
    DashboardComponent,
    AddAlarmeComponent,
    GeneralViewComponent,
    LoginComponent,
    JStringifyPipe,
    LineChartComponent,
    PieChartComponent,
    NotificationsComponent,
    MessagesPopupComponent,
    DataViewer2Component,
    RegisterComponent,
    LoadingComponent,
    TimelineComponent,
    UpdatePasswordComponent,
    AdministrationComponent,
    UsersComponent,
    UserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    //ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }), //used for Push notifications, only for prod mode
    BrowserAnimationsModule,
    LineChartModule,
    // Bootstrap components
    BsDropdownModule.forRoot(),
    AlertModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
