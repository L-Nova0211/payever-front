import { CurrencySignPipe } from './currency-sign.pipe';

describe('CurrencySignPipe', () => {

  const pipe = new CurrencySignPipe();

  it('should be defined', () => {

    expect(pipe).toBeDefined();

  });

  it('should transform', () => {

    const signsMap = new Map<string, string>([
      ['EUR', '€'],
      ['USD', '$'],
      ['GBP', '£'],
      ['SEK', 'kr'],
      ['DKK', 'Kr.'],
      ['NOK', 'kr'],
      ['test', 'test'],
    ]);

    expect(pipe.transform(null)).toBeUndefined();
    signsMap.forEach((value, key) => {
      expect(pipe.transform(key)).toEqual(value);
    });

  });

});
