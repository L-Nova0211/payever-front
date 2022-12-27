import { CurrencyFormatterPipe } from './currency-formatter.pipe';

describe('CurrencyFormatterPipe', () => {

  const pipe = new CurrencyFormatterPipe();

  it('should be defined', () => {

    expect(pipe).toBeDefined();

  });

  it('should transform', () => {

    expect(pipe.transform(13, 'eur', 'en-US')).toEqual('€13.00');

  });

});
