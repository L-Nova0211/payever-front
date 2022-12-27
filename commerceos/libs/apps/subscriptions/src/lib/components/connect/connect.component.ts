import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum, PeDestroyService, NavigationService } from '@pe/common';
import {
  PeListSectionButtonTypesEnum,
  PeListSectionIntegrationInterface,
} from '@pe/ui';

import { PeSubscriptionsConnectionApiService } from '../../services';

@Component({
  selector: 'pe-subscriptions-connect',
  templateUrl: './connect.component.html',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      width: 100%;
      height: 100%;
    }

    pe-list-container {
      display: block;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    NavigationService,
    PeDestroyService,
  ],
})
export class PeSubscriptionsConnectComponent {

  public readonly actionButtonType = PeListSectionButtonTypesEnum.ToggleWithOpen;
  public readonly paymentsIntegrations$ = this.peSubscriptionsConnectionApiService.getConnections();
  public readonly theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private router: Router,

    private navigationService: NavigationService,
    private pebEnvService: PebEnvService,
    private readonly destroy$: PeDestroyService,

    private peSubscriptionsConnectionApiService: PeSubscriptionsConnectionApiService,
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
      ? this.peSubscriptionsConnectionApiService.uninstallConnection(_id)
      : this.peSubscriptionsConnectionApiService.installConnection(_id);
    switchAction$.pipe(takeUntil(this.destroy$)).subscribe();
  }
}
