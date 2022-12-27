import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EnvironmentConfigInterface as EnvInterface, PeDestroyService, PE_ENV } from '@pe/common';
import { ThirdPartyFormServiceInterface } from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { BusinessInterface, CheckoutInterface, IntegrationConnectInfoInterface } from '../../interfaces';
import { ApiService, StorageService } from '../../services';

import { ThirdPartyInternalFormService } from './third-party-form.service';

@Component({
  selector: 'qr-integration',
  templateUrl: './qr-integration.component.html',
  styleUrls: [
    './qr-integration.component.scss',
    '../channel-settings/qr-app/modals.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeDestroyService,
  ],
})
export class QRIntegrationComponent implements OnInit {
  integration: IntegrationConnectInfoInterface = null;
  business: BusinessInterface = null;
  checkout: CheckoutInterface = null;
  link: string = this.overlayData.link;
  businessId: string = this.overlayData.businessId;
  checkoutUuid: string = this.overlayData.checkoutUuid;

  thirdPartyService: ThirdPartyFormServiceInterface = null;

  constructor(
    @Inject(PE_ENV) private env: EnvInterface,
    private apiService: ApiService,
    private mediaService: MediaService,
    private httpClient: HttpClient,
    private changeDetectorRef: ChangeDetectorRef,
    private storageService: StorageService,
    private translateService: TranslateService,
    private destroyed$: PeDestroyService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any
  ) {
  }

  ngOnInit(): void {
    combineLatest([
      this.apiService.getConnectIntegrationInfo(this.businessId, 'qr'),
      this.apiService.getBusiness(this.businessId),
      this.storageService.getCheckoutByIdOnce(this.checkoutUuid),
    ]).pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      this.integration = data[0];
      this.business = data[1];
      this.checkout = data[2];
      this.thirdPartyService = new ThirdPartyInternalFormService(
        this.env, this.mediaService, this.httpClient, this.translateService,
        this.business._id, this.business.name, this.integration, this.checkout, this.link
      );
      this.changeDetectorRef.markForCheck();
    });
  }
}
