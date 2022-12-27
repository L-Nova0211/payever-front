import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TranslateService } from '@pe/i18n-core';

@Component({
  selector: 'connect-close-popup-tpm',
  template: '',
})
export class ClosePopupTpmComponent {
  constructor(
    private route: ActivatedRoute,
    private translateService: TranslateService,
  ) {
    try {
      if (window && window.opener && window.opener.peClosePopUpOfTPMError && this.route.snapshot.queryParams.error) {
        window.opener.peClosePopUpOfTPMError(translateService.translate(this.route.snapshot.queryParams.error));
      }
      if (window && window.opener && window.opener.peClosePopUpOfTPM) {
        window.opener.peClosePopUpOfTPM();
      }
    } catch (e) {
      window.close();
    }
  }
}
