import { Component, Injector, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, first, switchMap, takeUntil, tap } from 'rxjs/operators';

import { CheckoutSharedService } from '@pe/common';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeSimpleStepperService } from '@pe/stepper';

import { CheckoutPanelModalType } from '../../../interfaces';
import { EnvService, RootCheckoutWrapperService } from '../../../services';
import { CheckoutClipboardCopyComponent } from '../../checkout-clipboard-copy/checkout-clipboard-copy.component';
import { QRIntegrationComponent } from '../../qr-integration/qr-integration.component';
import { AbstractPanelComponent } from '../abstract-panel.component';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'panel-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PanelCheckoutComponent extends AbstractPanelComponent implements OnDestroy, OnInit {

  theme = 'dark';
  link: string;
  dialogRef: PeOverlayRef;
  openedModalType: CheckoutPanelModalType;

  wrapperService: RootCheckoutWrapperService = this.injector.get(RootCheckoutWrapperService);
  isShowCheckout$: Observable<boolean> = this.wrapperService.checkoutVisible$;

  private peStepperService: PeSimpleStepperService = this.injector.get(PeSimpleStepperService);

  constructor(
    injector: Injector,
    private envService: EnvService,
    private overlayService: PeOverlayWidgetService,
    private checkoutSharedService: CheckoutSharedService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.peStepperService.hide();

    this.wrapperService.setParams(this.wrapperService.defaultParams);
    this.wrapperService.cancelEmitted$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.wrapperService.showCheckout(false);
    });
    this.wrapperService.showCheckout(true);

    /*try {
      this.appSetUpService.setStatus(this.storageService.businessUuid,
        'checkout', AppSetUpStatusEnum.Completed).subscribe();
    } catch (e) {
    }*/

    if (this.activatedRoute?.snapshot?.data.modal && this.activatedRoute?.snapshot?.queryParams.link) {
      this.link = this.activatedRoute?.snapshot?.queryParams.link;
      this.openedModalType = this.activatedRoute.snapshot.data.modal;
      this.initModal();
    }

    this.storageService.getBusiness()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((business) => {
        this.theme = business?.themeSettings?.theme && business?.themeSettings?.theme !== 'default'
        ? business.themeSettings.theme : 'dark';
      });
  }

  ngOnDestroy(): void {
    this.wrapperService.showCheckout(false);
    this.wrapperService.reCreateFlow(); // Just resetting inputted data
    this.peStepperService.hide();
  }

  onOpenDirectLink(): void {
    this.storageService.getChannelSetsForCheckoutByTypeOnce(this.checkoutUuid, 'link').pipe(
      filter(channelSetIds => channelSetIds && channelSetIds.length > 0),
      switchMap(channelSetIds => this.checkoutSharedService.locale$.pipe(
        tap(locale => window.open(
          this.storageService.makeCreateCheckoutLink(channelSetIds[0].id, locale),
          '_blank',
        ))
      )),
    ).subscribe();

  }

  copyLink() {
    this.wrapperService.getCopyLink().pipe(
      first(),
      tap((link) => {
        this.link = link;
        this.openedModalType = CheckoutPanelModalType.ClipboardCopy;
        this.initModal();
      }),
    ).subscribe();
  }

  copyLinkWithPrefilled() {
    this.wrapperService.preparePrefilled((link) => {
      console.log(link);
      this.link = link;
      this.openedModalType = CheckoutPanelModalType.ClipboardCopy;
      this.initModal();
    });
  }

  getQr() {
    this.wrapperService.preparePrefilled((link) => {
      this.link = link;
      this.openedModalType = CheckoutPanelModalType.QR;
      this.initModal();
    });
  }

  initModal() {
    const config: PeOverlayConfig = {
      data: {
        link: this.link,
        checkoutUuid: this.checkoutUuid,
        businessId: this.envService.businessId,
      },
      hasBackdrop: true,
      backdropClass: 'checkout-panel-modal',
      headerConfig: {
        title: '',
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate('create_checkout.done'),
        doneBtnCallback: () => {
          this.overlayService.close();
        },
        theme: this.theme,
      },
      component: null,
    };
    switch (this.openedModalType) {
      case CheckoutPanelModalType.ClipboardCopy:
        config.headerConfig.title = this.translateService.translate('actions.copy_to_clipboard');
        config.component = CheckoutClipboardCopyComponent;
        break;
      case CheckoutPanelModalType.QR:
        config.headerConfig.title = this.translateService.translate('directLinkEditing.actions.qr');
        config.component = QRIntegrationComponent;
        break;
    }
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed.subscribe(() => {
      this.link = null;
      this.openedModalType = null;
    });
  }
}
