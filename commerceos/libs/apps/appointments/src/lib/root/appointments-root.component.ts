import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum, PeDestroyService } from '@pe/common';

import { PeAppointmentsHeaderService } from '../services';

@Component({
  selector: 'cos-appointments-root',
  templateUrl: './appointments-root.component.html',
  styleUrls: ['./appointments-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class CosAppointmentsRootComponent implements OnInit, OnDestroy {
  public readonly theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private pebEnvService: PebEnvService,

    private peAppointmentsHeaderService: PeAppointmentsHeaderService,
  ) { }

  ngOnDestroy(): void {
    this.peAppointmentsHeaderService.destroy();
  }

  ngOnInit(): void {
    this.peAppointmentsHeaderService.initialize();
  }
}
