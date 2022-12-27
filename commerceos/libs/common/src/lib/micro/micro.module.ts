import { CommonModule as AngularCommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { LoadMicroComponent } from './components/load-micro/load-micro.component';
import { AppSetUpService, MessageBusService, MicroLoaderService, MicroRegistryService, WindowEventsService } from './services';

export interface MicroModuleConfig {
  urlMap: {[key: string]: string};
}

@NgModule({
  imports: [
    AngularCommonModule,
    HttpClientModule,
  ],
  providers: [
    AppSetUpService,
    MessageBusService,
    MicroLoaderService,
    MicroRegistryService,
    WindowEventsService,
  ],
  exports: [
    LoadMicroComponent,
  ],
  declarations: [
    LoadMicroComponent,
  ],
})
export class MicroModule {
}
