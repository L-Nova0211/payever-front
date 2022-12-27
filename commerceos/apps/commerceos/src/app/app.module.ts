import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { ApmModule, ApmService } from '@elastic/apm-rum-angular';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { PeAlertDialogModule } from '@pe/alert-dialog';
import { AuthModule } from '@pe/auth';
import { BusinessState } from '@pe/business';
import { EnvService, PE_ENV, MicroModule } from '@pe/common';
import { I18nModule } from '@pe/i18n';
import { MEDIA_ENV, MediaModule, MediaUrlPipe } from '@pe/media';
import { OverlayWidgetModule } from '@pe/overlay-widget';
import { PebEnvironmentService } from '@pe/shared/env-service';
import { TrafficSourceService } from '@pe/shared/traffic-service';
import { SnackbarModule } from '@pe/snackbar';
import { UserState } from '@pe/user';

import { environment } from '../environments/environment';

import { AppErrorhandler } from './app-error-handler';
import { AppComponent } from './app.component';
import { CosEnvInitializer, CosEnvProvider } from './env.provider';
import { TokenInterceptor } from './token.interceptor';

(window as any)?.PayeverStatic.IconLoader.loadIcons(['commerceos', 'industries']);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/app-lazy/app-lazy.module').then(m => m.AppLazyModule),
  },
]


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, {
      enableTracing: false,
      relativeLinkResolution: 'legacy',
    }),
    BrowserAnimationsModule,
    HttpClientModule,
    OverlayWidgetModule,
    MediaModule.forRoot(),
    NgxWebstorageModule.forRoot({
      prefix: 'pe.common',
      separator: '.',
      caseSensitive: true,
    }),
    NgxsLoggerPluginModule.forRoot({ disabled: true }),
    NgxsSelectSnapshotModule.forRoot(),
    NgxsModule.forRoot([BusinessState, UserState], { developmentMode: !environment.production }),
    NgxsStoragePluginModule.forRoot({
      key: 'editorState',
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
    AuthModule.forRoot(),
    MicroModule,
    MatMomentDateModule,
    SnackbarModule,
    ApmModule,
    I18nModule,
    PeAlertDialogModule,
  ],
  providers: [
    CosEnvProvider,
    CosEnvInitializer,
    MediaUrlPipe,
    {
      provide: 'FINEXP_ENV',
      deps: [PE_ENV],
      useFactory: env => env,
    },
    {
      provide: 'CAF_ENV',
      deps: [PE_ENV],
      useFactory: config => config,
    },
    {
      provide: MEDIA_ENV,
      deps: [PE_ENV],
      useFactory: env => env,
    },
    {
      provide: 'PE_USERS_API_URL',
      deps: [PE_ENV],
      useFactory: env => env.backend.users,
    },
    {
      provide: 'PEB_ENV',
      deps: [PE_ENV],
      useFactory: env => env,
    },
    TrafficSourceService,
    ApmService,
    {
      provide: EnvService,
      useClass: PebEnvironmentService,
    },
    // TODO: this interceptor is to remove tokens when requesting an asset
    // need remove the matIconSvg in filters (pe-data-grid)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: AppErrorhandler,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    apmService: ApmService,
  ) {
    apmService.init({
      logLevel: 'error',
      serviceName: 'commerceos-app',
      serverUrl: environment.apis.custom?.elasticUrl,
    });
    apmService.observe();
  }
}
