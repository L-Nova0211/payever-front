import { TestBed } from '@angular/core/testing';

import { LazyAppsLoaderService } from '.';

describe('LazyAppsLoaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: LazyAppsLoaderService,
        useValue: {},
      },
    ],
  }));

  it('should be created', () => {
    const service: LazyAppsLoaderService = TestBed.get(LazyAppsLoaderService);
    expect(service).toBeTruthy();
  });
});
