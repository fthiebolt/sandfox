import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { AlertMessagesService } from 'src/app/services/alert-messages.service';
import { AlarmService, IAlarm } from 'src/app/services/alarm.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-alarmes',
  templateUrl: './alarmes.component.html',
  styleUrls: ['./alarmes.component.scss']
})
export class AlarmesComponent implements OnInit {
  constructor(private authService: AuthService, private alertMessagesService: AlertMessagesService, public alarmService: AlarmService) { }
  popupHidden: BehaviorSubject<boolean> = new BehaviorSubject(true);
  popupAlarm: BehaviorSubject<IAlarm> = new BehaviorSubject(this.alarmService.emptyAlarm);
  updateAlarmForm = new FormGroup({
    high_seuil_min: new FormControl(''),
    high_seuil_max: new FormControl(''),

    avg_seuil_min: new FormControl(''),
    avg_seuil_max: new FormControl(''),

    low_seuil_min: new FormControl(''),
    low_seuil_max: new FormControl(''),

    sms: new FormControl(false),
    email: new FormControl(false),
    notification: new FormControl(false),
  });
  ngOnInit() {
    this.alarmService.updateAlarms();
    // this.onClose = new Subject();

  }
  public togglePopup() {
    this.popupHidden.next(!this.popupHidden.value);
  }
  // on confirmation of popup
  public async onConfirm() {
    //TODO Verify  if success reset else show error message
    const newAlarm = {
      _id: "",
      buildings: [],
      email: false,
      sms: false,
      notification: false,
      type: "",
      user_id: ""
    }
    Object.assign(newAlarm, this.popupAlarm.value);
    Object.assign(newAlarm, this.formToAlarm());
    try {
      await this.alarmService.updateAlarm(newAlarm);
      this.updateAlarmForm.reset();
      this.togglePopup();
    } catch (err) {
      this.alertMessagesService.pushErrorMessage("Echec de mise à jour d'alarm")
    }
  }
  // cancel the popup
  public onCancel(): void {
    this.updateAlarmForm.reset();
    this.popupAlarm.next(this.alarmService.emptyAlarm);
    this.togglePopup();
  }
  // Click on an alarm from the list --> show the popup
  public onClick(alarm: IAlarm) {
    this.updateAlarmForm.reset();
    this.setForm(alarm);
    this.updateAlarmForm.get('sms').setValue(alarm.sms);

    this.popupAlarm.next(alarm);
    this.popupHidden.next(false);
  }
  onPopupBackClick(event) {
    if (event.target.id && event.target.id === "background") {
      this.togglePopup();
    }
  }
  onDelete(alarm: IAlarm) {
    this.alarmService.deleteAlarm(alarm._id);
    this.updateAlarmForm.reset();
    this.togglePopup();
  }
  setForm(alarm: IAlarm) {
    if (alarm.high_level) {
      if (alarm.high_level.seuil_max) {
        this.updateAlarmForm.get('high_seuil_max').setValue(alarm.high_level.seuil_max);
      } else {
        this.updateAlarmForm.get('high_seuil_max').setValue('');
      }
      if (alarm.high_level.seuil_min) {
        this.updateAlarmForm.get('high_seuil_min').setValue(alarm.high_level.seuil_min);
      } else {
        this.updateAlarmForm.get('high_seuil_min').setValue('');
      }
    }
    if (alarm.avg_level) {

      if (alarm.avg_level.seuil_max) {
        this.updateAlarmForm.get('avg_seuil_max').setValue(alarm.avg_level.seuil_max);
      } else {
        this.updateAlarmForm.get('avg_seuil_max').setValue('');
      }
      if (alarm.avg_level.seuil_min) {
        this.updateAlarmForm.get('avg_seuil_min').setValue(alarm.avg_level.seuil_min);
      } else {
        this.updateAlarmForm.get('avg_seuil_min').setValue('');
      }
    }
    if (alarm.low_level) {

      if (alarm.low_level.seuil_max) {
        this.updateAlarmForm.get('low_seuil_max').setValue(alarm.low_level.seuil_max);
      } else {
        this.updateAlarmForm.get('low_seuil_max').setValue('');
      }
      if (alarm.low_level.seuil_min) {
        this.updateAlarmForm.get('low_seuil_min').setValue(alarm.low_level.seuil_min);
      } else {
        this.updateAlarmForm.get('low_seuil_min').setValue('');
      }
    }
    this.updateAlarmForm.get('sms').setValue(alarm.sms ? true : false);
    this.updateAlarmForm.get('email').setValue(alarm.email ? true : false);
    this.updateAlarmForm.get('notification').setValue(alarm.notification ? true : false);
  }
  formToAlarm() {
    const alarm = {
      high_level: {
        seuil_max: this.updateAlarmForm.value.high_seuil_max,
        seuil_min: this.updateAlarmForm.value.high_seuil_min
      },
      avg_level: {
        seuil_max: this.updateAlarmForm.value.avg_seuil_max,
        seuil_min: this.updateAlarmForm.value.avg_seuil_min
      },
      low_level: {
        seuil_max: this.updateAlarmForm.value.low_seuil_max,
        seuil_min: this.updateAlarmForm.value.low_seuil_min
      },
      sms: this.updateAlarmForm.value.sms,
      email: this.updateAlarmForm.value.email,
      notification: this.updateAlarmForm.value.notification
    }
    return alarm;
  }
}
