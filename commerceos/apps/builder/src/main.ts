import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { SandboxModule } from './app/sandbox.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

(window as any).PEB_CUSTOM_IDS = true;

(window as any).PEB_DISABLED_LOGS = localStorage.getItem('PEB_DISABLED_LOGS') || 'editor:store';

platformBrowserDynamic()
  .bootstrapModule(SandboxModule)
  .catch(err => console.error(err));
