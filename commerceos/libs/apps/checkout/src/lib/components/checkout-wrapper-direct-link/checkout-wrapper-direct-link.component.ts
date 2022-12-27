import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateService } from '@pe/i18n';

import { StorageService, HeaderService, RootCheckoutWrapperService } from '../../services';

@Component({
  selector: 'checkout-wrapper-direct-link',
  templateUrl: './checkout-wrapper-direct-link.component.html',
  styleUrls: ['./checkout-wrapper-direct-link.component.scss'],
})
export class CheckoutWrapperDirectLinkComponent implements OnInit, OnDestroy {

  loading$ = this.wrapperService.checkoutLoading$;

  constructor(
    private activatedRoute: ActivatedRoute,
    private headerService: HeaderService,
    private router: Router,
    private wrapperService: RootCheckoutWrapperService,
    private storageService: StorageService,
    private translateService: TranslateService,
  ) {
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit(): void {
    this.wrapperService.setParams({
      forceNoPaddings: false,
      forceFullScreen: true,
      embeddedMode: true,
      showOtherPayment: true,
      layoutWithPaddings: false,
    });
    this.wrapperService.showCheckout(true);

    this.headerService.setShortHeaderWithDropdownMenu(this.translateService.translate('directLinkEditing.title'), [
      {
        title: this.translateService.translate('directLinkEditing.actions.copyLink'),
        icon: '#icon-link3-16',
        iconSize: '16px',
        iconType: 'vector',
        onClick: () => this.wrapperService.doCopyLink(),
      }, {
        title: this.translateService.translate('directLinkEditing.actions.copyWithPrefilled'),
        icon: '#icon-link-prefilled-16',
        iconSize: '16px',
        iconType: 'vector',
        onClick: () => {
          this.wrapperService.preparePrefilled((link) => {
            this.wrapperService.tryClipboardCopy(link).subscribe((copied) => {
              if ( !copied ) {
                const route: string[] = [
                  `business/${this.storageService.businessUuid}/checkout/${this.checkoutUuid}/wrapper-direct-link/clipboard-copy`,
                ];
                this.router.navigate(route, { queryParams: { link } });
              }
            });
          });
        },
      }, {
        title: this.translateService.translate('directLinkEditing.actions.emailLink'),
        icon: '#icon-contact',
        iconSize: '16px',
        iconType: 'vector',
        onClick: () => {
          this.wrapperService.doEmailPrefilled();
        },
      }, {
        title: this.translateService.translate('directLinkEditing.actions.qr'),
        icon: '#icon-communications-qr-white',
        iconSize: '16px',
        iconType: 'vector',
        onClick: () => {
          this.wrapperService.preparePrefilled((link) => {
            const route: string[] = [
              `business/${this.storageService.businessUuid}/checkout/${this.checkoutUuid}/wrapper-direct-link/qr`,
            ];
            this.router.navigate(route, { queryParams: { link } });
          });
        },
      },
    ], () => {
      this.onCancel();
    }, this.loading$);
  }

  ngOnDestroy(): void {
    this.wrapperService.showCheckout(false);
    this.wrapperService.reCreateFlow(); // Just resetting inputted data
  }

  onCancel(): void {
    const channelRoute: string[] = [
      `business/${this.storageService.businessUuid}/checkout/${this.checkoutUuid}/panel-channels`,
    ];
    this.router.navigate(channelRoute);
  }
}
