import { TestBed } from '@angular/core/testing';

import { AlarmService} from './alarm.service';

describe('alarmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AlarmService = TestBed.get(AlarmService);
    expect(service).toBeTruthy();
  });
});
