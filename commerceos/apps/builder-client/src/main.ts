import { APP_BASE_HREF } from '@angular/common';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { APP_TYPE } from '@pe/common';

import { AppClientModule } from './app/app.client.module';
import { DEFAULT_APP, detectScreen, getProviders } from './config';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

function addCheckoutStyles(host: string) {
  const link = document.createElement('link');

  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = `${host}/lazy-styles.css`;

  document.head.appendChild(link);
}

document.addEventListener('DOMContentLoaded', async () => {
  const env = environment.apis;

  addCheckoutStyles(env.frontend.commerceos);

  platformBrowserDynamic(
    [
      {
        provide: APP_BASE_HREF,
        useFactory: () => {
          return (window as any).env?.APP_BASE_HREF || '/';
        },
      },
      {
        provide: APP_TYPE,
        useFactory: () => {
          return environment.production ? (window as any).env?.APP_TYPE : environment.apis.config.appType;
        },
      },
      {
        provide: 'APP_NAME',
        useValue: (window as any).env?.APP_NAME || '',
      },
      {
        provide: 'APP',
        useValue: {},
      },
      {
        provide: 'THEME',
        useValue: {},
      },
      {
        provide: 'USER_AGENT_SCREEN',
        useValue: detectScreen(window?.navigator?.userAgent),
      },
      ...(!environment.production ?
        await getProviders(env, DEFAULT_APP, fetch, (window as any).env?.APP_TYPE || environment.apis.config.appType) :
        []
      ),
    ]
  )
    .bootstrapModule(AppClientModule)
    .catch(err => console.error(err));
});
