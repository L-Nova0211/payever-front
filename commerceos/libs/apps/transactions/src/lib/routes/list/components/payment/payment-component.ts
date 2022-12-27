import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';
import { PeGridItem } from '@pe/grid';

import { IconsService } from '../../../../services/icons.service';
import { TransactionInterface } from '../../../../shared';

@Component({
  selector: 'pe-payment-icon',
  templateUrl: './payment-component.html',
  styleUrls: ['./payment-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PaymentComponent implements AfterViewInit {
  theme = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  item: PeGridItem<TransactionInterface>;

  get isDesktop(): boolean {
    return window.innerWidth > 720;
  }

  constructor(
    private iconService: IconsService,
    private cdr: ChangeDetectorRef,
    private envService: EnvService,
  ) {
  }

  ngAfterViewInit() {
    this.cdr.detach();
  }

  get getIcon(): string {
    return this.iconService.getPaymentMethodIconId(this.item.data.type, this.theme);
  }
}
