import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notifStatus = new BehaviorSubject<boolean>(false);
  notif = this.notifStatus.asObservable();

  constructor(private authService: AuthService) { }

  changeNotifStatus(status: boolean) {
    this.notifStatus.next(status)
  }

}
