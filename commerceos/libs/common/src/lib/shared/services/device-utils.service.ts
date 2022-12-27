import { Injectable } from '@angular/core';
import { DeviceDetectorService, DeviceInfo } from 'ngx-device-detector';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class PebDeviceService {

  readonly isDesktop = this.deviceService.isDesktop();
  readonly isTablet = this.deviceService.isTablet();
  readonly isMobile = this.deviceService.isMobile();

  readonly landscape$ = new BehaviorSubject<boolean>(false);

  set landscape(val: boolean) {
    this.landscape$.next(val);
  }

  get landscape(): boolean {
    return this.landscape$.value;
  }

  get browser(): string {
    return this.deviceService.browser;
  }

  get deviceInfo(): DeviceInfo {
    return this.deviceService.getDeviceInfo();
  }

  constructor(private deviceService: DeviceDetectorService) {}

}
