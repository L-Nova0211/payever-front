import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ApmModule, ApmService } from '@elastic/apm-rum-angular';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { NgxsModule } from '@ngxs/store';

import { PebEnvService } from '@pe/builder-core';
import { EnvService, MessageBus, PE_ENV, PreloaderState } from '@pe/common';
import { PeGridState } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { MEDIA_ENV } from '@pe/media';
import {
  PE_MESSAGE_API_PATH,
  PE_PRODUCTS_API_PATH,
  PE_MEDIA_API_PATH,
  PeMessageEnvService,
  PeMessageModule,
} from '@pe/message';
import { SnackbarService } from '@pe/snackbar';

import { environment } from '../environments/environment';

import { AppStyleComponent } from './app-style.component';
import { AppComponent } from './app.component';
import { EmbedMessageBus } from './services/message-bus.service';


(window as any)?.PayeverStatic?.IconLoader?.loadIcons([
  'apps',
  'commerceos',
  'messaging',
  'set',
]);

@NgModule({
  declarations: [
    AppComponent,
    AppStyleComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot([{ path: '', component: AppComponent }]),

    NgxsSelectSnapshotModule.forRoot(),
    NgxsModule.forRoot([
      PreloaderState,
      PeGridState,
    ], { developmentMode: !environment.production }),
    ApmModule,
    PeMessageModule.forEmbed(),
  ],
  providers: [
    SnackbarService,
    TranslateService,
    ApmService,
    {
      provide: MessageBus,
      useClass: EmbedMessageBus,
    },
    {
      provide: PebEnvService,
      useClass: PeMessageEnvService,
    },
    {
      provide: EnvService,
      useClass: PeMessageEnvService,
    },
    {
      provide: PE_ENV,
      useFactory: () => {
        return environment.envUrls;
      },
    },
    {
      provide: PE_MEDIA_API_PATH,
      useValue: environment.envUrls.backend.media,
    },
    {
      provide: PE_MESSAGE_API_PATH,
      useValue: environment.envUrls.backend.message,
    },
    {
      provide: PE_PRODUCTS_API_PATH,
      useValue: environment.envUrls.backend.products,
    },
    {
      provide: MEDIA_ENV,
      useValue: environment.envUrls.backend.media,
    },
    {
      provide: APP_BASE_HREF,
      useValue : '/',
    },
  ],
})
export class AppModule implements DoBootstrap {

  constructor(
    private injector: Injector,
    private apmService: ApmService
  ) {
    apmService.init({
      logLevel: 'error',
      serviceName: 'commerceos-app',
      serverUrl: environment.envUrls.apis.custom?.elasticUrl,
    });
    apmService.observe();
  }

  ngDoBootstrap(): void {
    const embed = createCustomElement(AppComponent, { injector: this.injector });

    customElements.define('pe-message-webcomponent', embed);
  }

}
