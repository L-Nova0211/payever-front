import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum, PeDestroyService, NavigationService } from '@pe/common';
import {
  PeListSectionButtonTypesEnum,
  PeListSectionIntegrationInterface,
} from '@pe/ui';

import { PeAffiliatesConnectionApiService } from '../../services';

@Component({
  selector: 'pe-affiliates-connect',
  templateUrl: './connect.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    NavigationService,
    PeDestroyService,
  ],
})
export class PeAffiliatesConnectComponent {

  public readonly actionButtonType = PeListSectionButtonTypesEnum.ToggleWithOpen;
  public readonly paymentsIntegrations$ = this.peAffiliatesConnectionApiService.getConnections();
  public readonly theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private router: Router,

    private navigationService: NavigationService,
    private pebEnvService: PebEnvService,
    private readonly destroy$: PeDestroyService,

    private peAffiliatesConnectionApiService: PeAffiliatesConnectionApiService,
  ) { }

  public navigateToConnect(integration?: PeListSectionIntegrationInterface): void {
    this.navigationService.saveReturn(this.router.url);
    const navigate = integration
      ? `integration=${integration.title}&integrationCategory=${integration.category}`
      : `integrationName=payments`;
    this.router.navigateByUrl(`/business/${this.pebEnvService.businessId}/connect?${navigate}`);
  }

  public switchIntegration(connection: PeListSectionIntegrationInterface): void {
    const { _id, enabled } = connection;
    const switchAction$ = enabled
      ? this.peAffiliatesConnectionApiService.uninstallConnection(_id)
      : this.peAffiliatesConnectionApiService.installConnection(_id);
    switchAction$.pipe(takeUntil(this.destroy$)).subscribe();
  }
}
