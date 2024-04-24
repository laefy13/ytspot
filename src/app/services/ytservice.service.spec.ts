import { TestBed } from '@angular/core/testing';

import { YtserviceService } from './ytservice.service';

describe('YtserviceService', () => {
  let service: YtserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YtserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
