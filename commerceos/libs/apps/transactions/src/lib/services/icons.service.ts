import { Injectable } from '@angular/core';;

import { AppThemeEnum, EnvService } from '@pe/common';

import { PaymentType } from '../shared';

import { ValuesService } from './values.service';

enum IconThemeSuffixEnum {
  White = 'w',
  Black = 'b'
}

@Injectable()
export class IconsService {
  theme = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private valuesService: ValuesService,
    private envService: EnvService
  ) {
  }

  themeSuffix(theme: AppThemeEnum): IconThemeSuffixEnum {
    return [AppThemeEnum.dark, AppThemeEnum.transparent, AppThemeEnum.default].includes(theme)
      ? IconThemeSuffixEnum.White
      : IconThemeSuffixEnum.Black;
  }

  getChannelIconId(channelType: string, theme: AppThemeEnum): string {
    const channel = this.valuesService.channels[channelType];

    return (channel?.icon || '#channel-link') + `-${this.themeSuffix(theme)}`;
  }

  getThumbnailChannelIconId(channelType: string, theme: AppThemeEnum): string {
    return this.getChannelIconId(channelType, theme);
  }

  getPaymentMethodIconId(paymentType: PaymentType, theme: AppThemeEnum): string {
    const payment = this.valuesService.payments[paymentType];

    return (payment?.icon || '#payment-method-santander') + `-${this.themeSuffix(theme)}`;
  }
}
