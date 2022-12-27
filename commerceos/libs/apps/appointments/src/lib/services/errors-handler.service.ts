import { Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';

import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

@Injectable()
export class PeErrorsHandlerService {

  constructor(
    private apmService: ApmService,

    private snackbarService: SnackbarService,
    private translateService: TranslateService,
  ) { }

  public errorHandler(description: string, error: any, showWarning?: boolean): void {
    const errorDescription = this.translateService.translate(description);

    if (showWarning) {
      this.snackbarService.toggle(true, {
        content: errorDescription,
        duration: 15000,
        iconColor: '#E2BB0B',
        iconId: 'icon-alert-24',
        iconSize: 24,
      });
    }
    this.apmService.apm.captureError(`${errorDescription} ms:\n${JSON.stringify(error)}`);
  }
}
