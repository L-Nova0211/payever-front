import { TestBed } from '@angular/core/testing';

import { PebSeoFormService } from './seo-form.service';

describe('PebSeoFormService', () => {
  let service: PebSeoFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PebSeoFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
