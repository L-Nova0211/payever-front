import { ModuleWithProviders, NgModule } from '@angular/core';

import { PebClipboardActionHandler } from './clipboard.handler';


@NgModule()
export class PebClipboardActionModule {

  static forChild(): ModuleWithProviders<PebClipboardActionModule> {
    return {
      ngModule: PebClipboardActionModule,
      providers: [
        PebClipboardActionHandler,
      ],
    };
  }

  constructor(handler: PebClipboardActionHandler) {
  }
}
