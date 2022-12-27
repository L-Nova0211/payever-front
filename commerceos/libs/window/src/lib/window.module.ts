import { NgModule, PLATFORM_ID, Optional, Inject } from '@angular/core';

import { createWindowServiceFactory } from './create-window-service.factory';
import { DEVICE_TYPE } from './device-type-inject-token';
import { ElementScrollPercentage, WindowEventsService, WindowService } from './services';

@NgModule({
  providers: [
    ElementScrollPercentage,
    WindowEventsService,
    {
      provide: WindowService,
      useFactory: createWindowServiceFactory,
      deps: [PLATFORM_ID, WindowEventsService, [new Optional(), new Inject(DEVICE_TYPE)]],
    },
  ],
})
export class WindowModule {}
