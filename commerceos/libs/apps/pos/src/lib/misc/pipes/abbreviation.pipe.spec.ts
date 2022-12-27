import { AbbreviationPipe } from './abbreviation.pipe';

describe('AbbreviationPipe', () => {

  const pipe = new AbbreviationPipe();

  it('should return proper value', () => {

    expect(pipe.transform('')).toBe('');
    expect(pipe.transform('Mistersandman')).toBe('Mn');
    expect(pipe.transform('Mister Sandman')).toBe('Ms');
    expect(pipe.transform('Mister Johnny Sandman')).toBe('Mj');

  });

});
