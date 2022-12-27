import { NgModuleRef, NgZone } from '@angular/core';

export class PeZoneUtils {

  static getBootstrapModuleOptions(): any {
    let options: any = {};

    if (window['pe_zone']) {
      options.ngZone = window['pe_zone'];
    }

    return options;
  }

  static registerBootstrapModule(module: NgModuleRef<any>): void {
    const zone = module.injector.get(NgZone);
    if (!window['pe_zone']) {
      window['pe_zone'] = zone;
    }
  }

}

