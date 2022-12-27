import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySymbol',
})
export class CurrencySymbolPipe implements PipeTransform {

  transform(currency: string, onlySymbol: boolean) {
    let currencySymbol = '';
    switch (currency) {
      case 'EUR':
        currencySymbol = onlySymbol ? '€' : 'Euro (€)';
        break;
      case 'USD':
        currencySymbol = onlySymbol ? '$' : 'Dollar ($)';
        break;
      case 'NOK':
        currencySymbol = onlySymbol ? 'Kr' : 'Norwegian Krone (Kr)';
        break;
      case 'SEK':
        currencySymbol = onlySymbol ? 'Kr' : 'Swedish Krona (Kr)';
        break;
      case 'GBP':
        currencySymbol = onlySymbol ? '£' : 'Pound (£)';
        break;
      case 'DKK':
        currencySymbol = onlySymbol ? 'Kr' : 'Danish Krone (Kr)';
        break;
      case 'CHF':
        currencySymbol = onlySymbol ? 'Fr' : 'Swiss Franc (Fr)';
        break;
      default:
        break;
    }

    return currencySymbol;
  }
}
