import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';
import { ThemesApi } from '@pe/themes';

import { SiteEnvService } from '../../services/site-env.service';



@Component({
  selector: 'peb-theme-grid',
  templateUrl: './theme-grid.component.html',
  styleUrls: ['./theme-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebThemeGridComponent {

  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] : AppThemeEnum.default;

  constructor(
    private themesApi: ThemesApi,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    @Inject(EnvService) private envService: SiteEnvService,
  ) {
    this.themesApi.applicationId = this.envService.applicationId;
  }

  onThemeInstalled() {
    this.messageBus.emit('site.navigate.edit', this.route.snapshot.params.siteId);
  }
}
