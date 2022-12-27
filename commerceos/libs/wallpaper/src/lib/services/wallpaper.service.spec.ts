import { TestBed } from '@angular/core/testing';

import { WallpaperService } from '.';

describe('WallpaperService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: WallpaperService,
        useValue: {},
      },
    ],
  }));

  it('should be created', () => {
    const service: WallpaperService = TestBed.get(WallpaperService);
    expect(service).toBeTruthy();
  });
});
