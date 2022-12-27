import { isPlatformBrowser, ɵgetDOM } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, Inject, NgModule, Optional, PLATFORM_ID } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule, TransferState } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ApmErrorHandler, ApmModule, ApmService } from '@elastic/apm-rum-angular';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';

import { AppType, APP_TYPE, PE_ENV } from '@pe/common';
import {
  SimpleLocaleConstantsService,
  TranslateService,
  TranslationGuard,
  TranslationLoaderService,
} from '@pe/i18n-core';

import { environment } from '../environments/environment';

import { AppRootComponent } from './root/root.component';
import { APP_STATE, RootTransferStateService, THEME_STATE } from './services/root-transfer-state.service';


@NgModule({
  bootstrap: [AppRootComponent],
  declarations: [AppRootComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'builder-client' }),
    BrowserTransferStateModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          loadChildren: () => import('@pe/builder-client').then(m => m.PebClientModule).catch(() => {
            window.location.reload();
          }),
          canActivate: [TranslationGuard],
          data: {
            i18nDomains: ['builder-client'],
          },
        },
      ],
      { initialNavigation: 'enabled' },
    ),
    NgxsModule.forRoot(),
    NgxsStoragePluginModule.forRoot({
      key: 'editorState',
    }),
    BrowserAnimationsModule,
    ApmModule,
    HttpClientModule,
  ],
  providers: [
    ApmService,
    SimpleLocaleConstantsService,
    TranslateService,
    TranslationGuard,
    TranslationLoaderService,
    {
      provide: APP_INITIALIZER,

      // HACK to fix flickering https://github.com/angular/angular/issues/23427
      useFactory: (platformId: object, transferState: TransferState, app: any, theme: any) => {
        if (isPlatformBrowser(platformId)) {
          // isPlatformBrowser(platformId) needs to prevent updating tokens on server side.
          Object.assign(app, transferState.get(APP_STATE, null));
          Object.assign(theme, transferState.get(THEME_STATE, null));
        }

        return () => {
          if (isPlatformBrowser(platformId)) {
            const dom = ɵgetDOM();
            const styles = Array.prototype.slice.apply(
              dom.getDefaultDocument().querySelectorAll('style[ng-transition]')
            );
            styles.forEach(el => {
              // Remove ng-transition attribute to prevent Angular appInitializerFactory
              // to remove server styles before preboot complete
              el.removeAttribute('ng-transition');
            });
            dom.getDefaultDocument().addEventListener('PrebootComplete', () => {
              // After preboot complete, remove the server scripts
              styles.forEach(el => dom.remove(el));
            });
          }
        };
      },
      deps: [PLATFORM_ID, TransferState, 'APP', 'THEME'],
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: ApmErrorHandler,
    },
    {
      provide: PE_ENV,
      useFactory: () => environment.apis,
    },
  ],
})
export class AppClientModule {
  constructor(
    rootTransferStateService: RootTransferStateService,
    apmService: ApmService,
    @Optional() @Inject(APP_TYPE) appType: AppType,
    @Inject(PLATFORM_ID) platformId: string,
  ) {
    rootTransferStateService.setTransferStateData();
    if (isPlatformBrowser(platformId) && appType) {
      apmService.init({
        serviceName: ['builder-client', appType].join('-'),
        serverUrl: environment.apis.custom?.elasticUrl,
        logLevel: 'error',
      });
      apmService.observe();
    }
  }
}
