import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormatter',
})
export class CurrencyFormatterPipe implements PipeTransform {
  transform(value: any, currencyCode: string, locale: string): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(parseInt(value, 10));
  }
}
