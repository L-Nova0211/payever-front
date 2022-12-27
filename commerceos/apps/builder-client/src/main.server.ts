import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

export { renderModule, renderModuleFactory } from '@angular/platform-server';

export { APP_TYPE } from '@pe/common';

export { AppServerModule } from './app/app.server.module';
export { DEFAULT_APP, fetchApp, fetchCategories } from './config';
export { environment } from './environments/environment';
