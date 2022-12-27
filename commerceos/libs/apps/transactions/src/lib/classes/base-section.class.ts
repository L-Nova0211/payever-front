import { ChangeDetectorRef, Directive, Injector } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';
import { AddressService } from '@pe/forms-core';
import { LocaleConstantsService } from '@pe/i18n';

import { DetailService } from '../details/services/detail.service';

@Directive()

// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class BaseSectionClass {

  protected detailService = this.injector.get(DetailService);
  protected addressService = this.injector.get(AddressService);
  protected localeConstantsService = this.injector.get(LocaleConstantsService);
  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected envService: EnvService = this.injector.get(EnvService);

  theme = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  get order() {
    return this.detailService.orderData;
  }

  get history() {
    return this.detailService.timelineItems;
  }

  get cart() {
    return this.detailService.orderData?.cart;
  }

  get transaction() {
    return this.detailService.orderData?.transaction;
  }

  get status() {
    return this.detailService.orderData?.status;
  }

  get billingAddressName(): string {
    return this.addressService.getNameString(this.order.billing_address);
  }

  get billingAddress(): string {
    return this.addressService.getAddressString(this.order.billing_address);
  }

  get shippingAddressName(): string {
    return this.addressService.getNameString(this.order.shipping.address);
  }

  get shippingAddress(): string {
    return this.addressService.getAddressString(this.order.shipping.address);
  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  constructor(
    protected injector: Injector
  ) { }
}
