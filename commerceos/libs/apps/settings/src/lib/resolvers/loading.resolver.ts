import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { PlatformService } from '../services/platform.service';

@Injectable()
export class LoadingResolver implements Resolve<void> {

  constructor(private platformService: PlatformService) {
  }

  resolve(): void {
    this.platformService.microLoaded = true;
    this.platformService.microAppReady = 'settings';
  }

}
