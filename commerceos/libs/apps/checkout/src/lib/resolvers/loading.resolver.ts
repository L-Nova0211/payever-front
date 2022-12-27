import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

// import { PlatformService } from '@pe/ng-kit/modules/common';

@Injectable()
export class LoadingResolver implements Resolve<void> { // TODO REmove

  constructor(
    // private platformService: PlatformService
  ) {
    console.log('CHECKOUTAPP!: LoadingResolver.constructor');
  }

  resolve(): void {
    // this.platformService.microLoaded = true; // TODO Check
    console.log('CHECKOUTAPP!: LoadingResolver.resolve');
  }

}
