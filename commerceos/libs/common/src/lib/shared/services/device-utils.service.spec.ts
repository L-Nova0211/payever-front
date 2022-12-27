import { TestBed } from '@angular/core/testing';
import { DeviceDetectorService } from 'ngx-device-detector';

import { PebDeviceService } from './device-utils.service';

describe('PebDeviceService', () => {

  let service: PebDeviceService;

  beforeEach(() => {

    const deviceServiceSpy = jasmine.createSpyObj<DeviceDetectorService>('DeviceDetectorService', {
      isDesktop: true,
      isTablet: false,
      isMobile: false,
    });

    TestBed.configureTestingModule({
      providers: [
        PebDeviceService,
        { provide: DeviceDetectorService, useValue: deviceServiceSpy },
      ],
    });

    service = TestBed.inject(PebDeviceService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();
    expect(service.isDesktop).toBe(true);
    expect(service.isTablet).toBe(false);
    expect(service.isMobile).toBe(false);

  });

  it('should set/get landscape', () => {

    const nextSpy = spyOn(service.landscape$, 'next').and.callThrough();
    const spies = {
      get: spyOnProperty(service, 'landscape').and.callThrough(),
      set: spyOnProperty(service, 'landscape', 'set').and.callThrough(),
    };

    service.landscape = true;

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(service.landscape).toBe(true);
    expect(spies.get).toHaveBeenCalled();
    expect(spies.set).toHaveBeenCalled();

  });

});
