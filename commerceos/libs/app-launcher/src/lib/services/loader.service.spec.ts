import { TestBed, async } from '@angular/core/testing';
import { FakeMicroRegistryService } from 'test.helpers';

import { MicroRegistryService } from '@pe/ng-kit/modules/micro';

import { LoaderService } from '.';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        LoaderService,
        {
          provide: MicroRegistryService,
          useValue: new FakeMicroRegistryService(),
        },
      ],
    });
    service = TestBed.get(LoaderService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
