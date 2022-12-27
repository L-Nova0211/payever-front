import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { takeUntil, tap } from 'rxjs/operators';

import { EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { AppThemeEnum } from '@pe/common';
import { DockerItemInterface, DockerState } from '@pe/docker';

import { PeShippingHeaderService } from '../services/shipping-header.service';

@Component({
  selector: 'cos-shipping-root',
  templateUrl: './shipping-root.component.html',
  styleUrls: ['./shipping-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosShippingRootComponent implements OnInit, OnDestroy {

  @SelectSnapshot(DockerState.dockerItems) dockerItems: DockerItemInterface[];

  isSidebarClosed = window.innerWidth <= 720;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  constructor(
    private shippingHeaderService: PeShippingHeaderService,
    public router: Router,
    private messageBus: MessageBus,
    private envService: EnvService,
    private destroyed$: PeDestroyService
  ) {
  }

  ngOnInit(): void {
    this.shippingHeaderService.init();
    this.messageBus.listen('setting.currency.open').pipe(
      tap(() => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/settings/details/currency`)
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('connect.app.open').pipe(
      tap(() => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/connect?integrationName=shippings`)
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('connect.app.integration.configure').pipe(
      tap((integrationName) => {
        this.router.navigateByUrl(
          `business/${this.envService.businessId}/connect/shippings/configure/${integrationName}`
        );
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('shipping.app.toggle.sidebar').pipe(
      tap( (res) => {
        if (!res) {
          this.messageBus.emit('shipping-app.close.packages.sidebar', true)
        }
        this.shippingHeaderService.onSidebarToggle(res);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

  }

  ngOnDestroy(): void {
    this.shippingHeaderService.destroy();
    localStorage.removeItem('shipping.profile.grid.layout');
    localStorage.removeItem('shipping.zones.grid.layout');
    localStorage.removeItem('shipping.package.grid.layout');
  }
}
