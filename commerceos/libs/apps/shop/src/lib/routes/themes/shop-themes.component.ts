import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';
import { ThemesApi } from '@pe/themes';

import { ShopEnvService } from '../../services/shop-env.service';

@Component({
  selector: 'peb-shop-themes',
  templateUrl: './shop-themes.component.html',
  styleUrls: ['./shop-themes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopThemesComponent {
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default

  constructor(
    private themesApi: ThemesApi,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    @Inject(EnvService) private envService: ShopEnvService,
  ) {
    this.themesApi.applicationId = this.envService.shopId;
  }

  onThemeInstalled() {
    this.messageBus.emit('shop.navigate.edit', this.route.snapshot.params.shopId);
  }

}
