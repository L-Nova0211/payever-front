import { Directive } from '@angular/core';

import { TranslateService } from '@pe/i18n-core';

@Directive()
export class BaseComponent {
  protected constructor(protected translateService: TranslateService) {}


  getConfirmationContent(dialog, action) {
    return {
      subject: this.translateService.translate(`shipping-app.dialog_leave.${dialog}`),
      title: this.translateService.translate(`shipping-app.dialog_leave.heading_${action}`),
      subtitle: this.translateService.translate(`shipping-app.dialog_leave.description_${action}`),
      subtitle1: this.translateService.translate('shipping-app.dialog_leave.description'),
    };
  }

  getDeleteConfirmationContent() {
    return {
      title: this.translateService.translate(`shipping-app.actions.delete.label`),
      subtitle: this.translateService.translate(`shipping-app.actions.delete.info`),
    };
  }
}
