import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';

import { AppType, APP_TYPE } from '@pe/common';

export const PEB_ENV = makeStateKey<string>('PEB_ENV');
export const APP_STATE = makeStateKey<string>('APP');
export const THEME_STATE = makeStateKey<string>('THEME');
export const APP_TYPE_STATE = makeStateKey<string>('APP_TYPE');

@Injectable({ providedIn: 'root' })
export class RootTransferStateService {
  constructor(
    private transferState: TransferState,
    // @Optional() @Inject(PE_ENV) private pebEnv,
    @Optional() @Inject('APP') private app,
    @Optional() @Inject('THEME') private theme,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
    @Inject(PLATFORM_ID) private platformId: string,
  ) {}

  setTransferStateData() {
    if (isPlatformServer(this.platformId)) {
      // this.transferState.set(PEB_ENV, this.pebEnv);
      this.transferState.set(APP_STATE, this.app);
      this.transferState.set(THEME_STATE, this.theme);
      this.transferState.set(APP_TYPE_STATE, this.appType);
    }
  }
}
