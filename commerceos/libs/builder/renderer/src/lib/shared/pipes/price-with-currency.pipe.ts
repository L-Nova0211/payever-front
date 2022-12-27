import { Pipe, PipeTransform } from '@angular/core';

import { CurrencySignPipe } from './currency-sign.pipe';

@Pipe({
  name: 'priceWithCurrency',
})
export class PriceWithCurrencyPipe implements PipeTransform {

  constructor(private currencySignPipe: CurrencySignPipe) {
  }

  transform(value: number, currencyCode: string, showCurrencySign = true): string {
    return `${new Intl.NumberFormat(this.getLocaleByCurrency(currencyCode), {
      style: 'decimal',
      minimumIntegerDigits: 1,
      minimumFractionDigits: this.getMinimumFractionDigitsByCurrency(currencyCode),
      maximumFractionDigits: 2,
    }).format(value)}${showCurrencySign ? ` ${this.currencySignPipe.transform(currencyCode)}` : ''}`;
  }

  private getLocaleByCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case 'EUR':
        return 'de';
      default:
        return 'en';
    }
  }

  private getMinimumFractionDigitsByCurrency(currencyCode: string): number {
    switch (currencyCode) {
      case 'EUR':
        return 2;
      case 'USD':
        return 2;
      default:
        return 0;
    }
  }
}
