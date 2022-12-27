import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';

import { PeSocialEnvService } from '../../services';

@Component({
  selector: 'pe-social-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSocialConnectComponent {

  public readonly theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private envService: EnvService,
    private peSocialEnvService: PeSocialEnvService,
  ) { }

  public openConnectApp(integrationName?: string): void {
    this.peSocialEnvService.openConnectApp(integrationName);
  }
}
