import { TestBed } from '@angular/core/testing';

import { DashboardDataService } from '.';

describe('DashboardDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: DashboardDataService,
        useValue: {},
      },
    ],
  }));

  it('should be created', () => {
    const service: DashboardDataService = TestBed.get(DashboardDataService);
    expect(service).toBeTruthy();
  });
});
