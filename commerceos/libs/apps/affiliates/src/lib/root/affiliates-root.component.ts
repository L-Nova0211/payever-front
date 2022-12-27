import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum, PeDestroyService } from '@pe/common';

import { PeAffiliatesHeaderService } from '../services';

@Component({
  selector: 'pe-affiliates-root',
  templateUrl: './affiliates-root.component.html',
  styleUrls: [
    './affiliates-root.component.scss',
    './datepicker.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class CosAffiliatesRootComponent implements OnInit, OnDestroy {
  public readonly theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private pebEnvService: PebEnvService,

    private peAffiliatesHeaderService: PeAffiliatesHeaderService,
  ) { }

  ngOnDestroy(): void {
    this.peAffiliatesHeaderService.destroy();
  }

  ngOnInit(): void {
    this.peAffiliatesHeaderService.initialize();
  }
}
