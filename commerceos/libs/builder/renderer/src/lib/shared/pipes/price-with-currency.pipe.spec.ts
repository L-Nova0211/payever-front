import { CurrencySignPipe } from './currency-sign.pipe';
import { PriceWithCurrencyPipe } from './price-with-currency.pipe';

describe('PriceWithCurrencyPipe', () => {

  const currencySignPipe = jasmine.createSpyObj<CurrencySignPipe>('CurrencySignPipe', {
    transform: 'sign.transformed',
  });
  const pipe = new PriceWithCurrencyPipe(currencySignPipe);

  it('should be defined', () => {

    expect(pipe).toBeDefined();

  });

  it('should transform', () => {

    /**
     * argument currencyCode is 'EUR'
     * argument showCurrencySign is FALSE
     */
    expect(pipe.transform(13.99, 'EUR', false)).toEqual('13,99');
    expect(currencySignPipe.transform).not.toHaveBeenCalled();

    /**
     * argument currencyCode is 'USD'
     * argument showCurrencySign is TRUE as default
     */
    expect(pipe.transform(13.99, 'USD')).toEqual('13.99 sign.transformed');
    expect(currencySignPipe.transform).toHaveBeenCalledWith('USD');

    /**
     * argument currencyCode is 'GBP'
     */
    expect(pipe.transform(13.99, 'GBP')).toEqual('13.99 sign.transformed');
    expect(currencySignPipe.transform).toHaveBeenCalledWith('GBP');

  });

});
