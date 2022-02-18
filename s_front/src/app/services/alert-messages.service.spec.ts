import { TestBed } from '@angular/core/testing';

import { AlertMessagesService } from './alert-messages.service';

describe('AlertMessagesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AlertMessagesService = TestBed.get(AlertMessagesService);
    expect(service).toBeTruthy();
  });
});
