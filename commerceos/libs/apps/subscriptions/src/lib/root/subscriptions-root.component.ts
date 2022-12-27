import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum, PeDestroyService } from '@pe/common';

import { PeSubscriptionsHeaderService } from '../services';

@Component({
  selector: 'pe-subscriptions-root',
  templateUrl: './subscriptions-root.component.html',
  styleUrls: ['./subscriptions-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class CosSubscriptionsRootComponent implements OnInit, OnDestroy {
  public readonly theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private pebEnvService: PebEnvService,

    private peSubscriptionsHeaderService: PeSubscriptionsHeaderService,
  ) { }

  ngOnDestroy(): void {
    this.peSubscriptionsHeaderService.destroy();
  }

  ngOnInit(): void {
    this.peSubscriptionsHeaderService.initialize();
  }
}
