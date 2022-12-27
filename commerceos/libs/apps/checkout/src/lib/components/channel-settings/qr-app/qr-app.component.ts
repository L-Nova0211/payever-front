import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';

import { EnvironmentConfigInterface as EnvInterface, PE_ENV } from '@pe/common';
import { ThirdPartyFormServiceInterface } from '@pe/forms';
import { MediaService } from '@pe/media';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { BusinessInterface, IntegrationConnectInfoInterface } from '../../../interfaces';
import { ApiService, StorageService } from '../../../services';

import { ThirdPartyInternalFormService } from './third-party-form.service';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'qr-app',
  templateUrl: './qr-app.component.html',
  styleUrls: ['./qr-app.component.scss', './modals.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QRAppComponent implements OnInit, OnDestroy {

  integration: IntegrationConnectInfoInterface = null;
  business: BusinessInterface = null;
  thirdPartyService: ThirdPartyFormServiceInterface = null;
  checkoutUuid = this.overlayData.checkoutUuid;

  protected destroyed$: Subject<boolean> = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private mediaService: MediaService,
    private router: Router,
    private apiService: ApiService,
    private httpClient: HttpClient,
    private storageService: StorageService,
    @Inject(PE_ENV) private env: EnvInterface,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {}

  ngOnInit() {
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe((currentCheckout) => {
      this.storageService.getChannelSetsOnce().subscribe((channelSets) => {
        // this.terminalList = [];
        channelSets.map((channelSet) => {
          if (channelSet.type === 'link' && channelSet.checkout === this.checkoutUuid) {
            combineLatest([
              this.apiService.getConnectIntegrationInfo(this.storageService.businessUuid, 'qr'),
              this.apiService.getBusiness(this.storageService.businessUuid),
            ]).subscribe((data) => {
              this.integration = data[0];
              this.business = data[1];
              this.thirdPartyService = new ThirdPartyInternalFormService(
                this.env, this.httpClient,
                this.storageService.businessUuid, this.business.name,
                this.mediaService.getMediaUrl(currentCheckout.logo, 'images'), currentCheckout._id, this.integration,
                this.getCheckoutWrapperCustomerViewLink(channelSet.id)
              );
              this.changeDetectorRef.markForCheck();
            });
          }

          return channelSet;
        });
      });
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  getCheckoutWrapperCustomerViewLink(channelSet: string): string {
    return `${this.env.frontend.checkoutWrapper}/pay/create-flow-from-qr/channel-set-id/${channelSet}`;
  }

  goBack() {
    this.router.navigate([this.storageService.getHomeChannelsUrl(this.checkoutUuid)]);
  }
}
