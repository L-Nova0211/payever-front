import { Component, Injector } from '@angular/core';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';

import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { CustomChannelTypeEnum, IntegrationCategory, IntegrationInfoInterface } from '../../../interfaces';
import { QRAppComponent } from '../../channel-settings/qr-app/qr-app.component';
import { AbstractPanelComponent } from '../abstract-panel.component';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'panel-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class PanelConnectComponent extends AbstractPanelComponent {

  theme = 'dark';
  dialogRef: PeOverlayRef;

  connectsReady = false;
  connects$ = this.storageService.getCategoryInstalledIntegrationsInfo(
    [IntegrationCategory.Communications, IntegrationCategory.Accountings]
  ).pipe(
    filter(d => !!d),
    takeUntil(this.destroyed$),
    debounceTime(100),
    tap(() => this.connectsReady = true));

  constructor(
    injector: Injector,
    private overlayService: PeOverlayWidgetService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.apiService.getBusiness(this.storageService.businessUuid)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((business) => {
        this.theme = business?.themeSettings?.theme && business?.themeSettings?.theme !== 'default'
        ? business.themeSettings.theme : 'dark';
      });
  }

  openApp(integration: IntegrationInfoInterface) {
    if (integration?.integration?.name === CustomChannelTypeEnum.QR ) {
      this.initModal();
    } else {
      this.clickedIntegrationOpenButton(integration);
    }
  }

  private initModal() {
    const config: PeOverlayConfig = {
      data: {
        theme: this.theme,
        checkoutUuid: this.checkoutUuid,
      },
      hasBackdrop: true,
      backdropClass: 'channels-modal',
      headerConfig: {
        title: this.translateService.translate('connect.qr.title'),
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
      component: QRAppComponent,
    };
    this.dialogRef = this.overlayService.open(config);
  }
}
