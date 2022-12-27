import { ModuleWithProviders, NgModule } from '@angular/core';

import { PebInsertActionHandler } from './insert.handler';


@NgModule()
export class PebInsertActionModule {

  static forChild(): ModuleWithProviders<PebInsertActionModule> {
    return {
      ngModule: PebInsertActionModule,
      providers: [
        PebInsertActionHandler,
      ],
    };
  }

  constructor(handler: PebInsertActionHandler) {
  }
}
