import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';

import { AppClientModule } from './app.client.module';
import { AppRootComponent } from './root/root.component';

@NgModule({
  bootstrap: [AppRootComponent],
  imports: [
    AppClientModule,
    ServerModule,
    ServerTransferStateModule,
  ],
})
export class AppServerModule {
}
