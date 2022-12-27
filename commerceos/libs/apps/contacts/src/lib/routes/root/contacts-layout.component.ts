import { Component } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TranslationLoaderService } from '@pe/i18n-core';

@Component({
  selector: 'pe-contacts-layout',
  templateUrl: 'contacts-layout.component.html',
})
export class PeContactsLayoutComponent {

  public readonly translationsReady$ = this.translationLoaderService
    .loadTranslations(['commerceos-contacts-app', 'filters-app'])
    .pipe(
      catchError(() => {
        this.apmService.apm.captureError('Cant load translations for domains commerceos-contacts-app  filters-app');
        
        return of(true);
      }));

  constructor(
    private apmService: ApmService,
    private translationLoaderService: TranslationLoaderService,
  ) { }
}
