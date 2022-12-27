import { TestBed } from '@angular/core/testing';

import { AppLauncherService } from '.';

describe('AppLauncherService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: AppLauncherService,
        useValue: {},
      },
    ],
  }));

  it('should be created', () => {
    const service: AppLauncherService = TestBed.get(AppLauncherService);
    expect(service).toBeTruthy();
  });
});
