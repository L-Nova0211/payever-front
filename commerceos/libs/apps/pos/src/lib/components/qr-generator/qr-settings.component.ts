import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { takeUntil, tap, switchMap } from 'rxjs/operators';

import {
  AppThemeEnum,
  BusinessInterface,
  EnvironmentConfigInterface as EnvInterface,
  EnvService,
  PeDestroyService,
  PE_ENV,
} from '@pe/common';
import { ThirdPartyFormServiceInterface } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { CustomChannelTypeEnum, IntegrationCategory } from '../../services/pos.types';
import { PosApi } from '../../services/pos/abstract.pos.api';
import { PosConnectService } from '../../services/pos/pos-connect.service';
import { PosEnvService } from '../../services/pos/pos-env.service';

import { ThirdPartyInternalFormService } from './third-party-form.service';

@Component({
  selector: 'pos-qr-settings',
  templateUrl: './qr-settings.component.html',
  styleUrls: ['./qr-settings.component.scss', './modals.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class QRIntegrationComponent implements OnInit {
  business: BusinessInterface = null;
  thirdPartyService: ThirdPartyFormServiceInterface;
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] :
    AppThemeEnum.default;

  category: IntegrationCategory = IntegrationCategory.Communications;

  constructor(
    @Inject(EnvService) private envService: PosEnvService,
    private changeDetectorRef: ChangeDetectorRef,
    private apiService: PosApi,
    private httpClient: HttpClient,
    private translateService: TranslateService,
    public posConnectService: PosConnectService,
    private destroy$: PeDestroyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(PE_ENV) private env: EnvInterface,
  ) {
  }

  ngOnInit(): void {
    this.business = this.envService.businessData;
    combineLatest([
      this.apiService.getConnectIntegrationInfo(CustomChannelTypeEnum.QR),
      this.apiService.getSinglePos(this.envService.posId),
    ]).pipe(
      switchMap(([integration, terminal]) => {
        this.posConnectService.integration$.next(integration);
        this.posConnectService.terminal$.next(terminal);

        return this.posConnectService.checkoutWrapperCustomerViewLink$.pipe(
          tap((checkoutWrapperLink) => {
            this.thirdPartyService = new ThirdPartyInternalFormService(
              this.httpClient,
              this.translateService,
              this.envService.businessId,
              this.envService.businessName,
              integration,
              terminal,
              checkoutWrapperLink,
            );

            this.changeDetectorRef.markForCheck();
          })
        );
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  handleClose(): void {
    this.router.navigate([`../..`], { relativeTo: this.activatedRoute });
  }
}
