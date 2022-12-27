import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';

import { SnackbarService } from '@pe/snackbar';
import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { BusinessInterface, CheckoutInterface, IntegrationConnectInfoInterface } from '../../interfaces';

@Component({
  selector: 'checkout-clipboard-copy',
  templateUrl: './checkout-clipboard-copy.component.html',
  styleUrls: ['./checkout-clipboard-copy.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CheckoutClipboardCopyComponent {
  integration: IntegrationConnectInfoInterface = null;
  business: BusinessInterface = null;
  checkout: CheckoutInterface = null;

  link: string = this.overlayData.link;
  checkoutUuid: string = this.overlayData.checkoutUuid;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private clipboardService: ClipboardService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any
  ) {
  }

  onCopyClick(): void {
    this.clipboardService.copyFromContent(this.link);
    this.snackBarService.toggle(true, { content: this.translateService.translate('rootCheckoutWrapper.copied') });
  }

  handleClose(): void {
    this.router.navigate([`..`], { relativeTo: this.activatedRoute });
  }
}
