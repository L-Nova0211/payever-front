import { TestBed } from '@angular/core/testing';

import { BuilderShareService } from './builder-share.service';

describe('BuilderShareService', () => {
  let service: BuilderShareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuilderShareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
