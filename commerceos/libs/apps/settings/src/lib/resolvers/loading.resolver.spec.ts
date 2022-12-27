import { TestBed } from '@angular/core/testing';

import { PlatformService } from '@pe/ng-kit/src/kit/common';

import { LoadingResolver } from './loading.resolver';

describe('LoadingResolver', () => {
  let resolver: LoadingResolver;
  let platformService: PlatformService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoadingResolver,
        {
          provide: PlatformService,
          useValue: {},
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    resolver = TestBed.get(LoadingResolver);
    platformService = TestBed.get(PlatformService);
  });

  it('Should create', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    resolver.resolve();

    expect(platformService.microLoaded).toBeTruthy();
    expect(platformService.microAppReady).toBe('settings');
  });
});
