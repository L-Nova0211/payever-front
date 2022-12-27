import { AbbreviationPipe } from './abbreviation.pipe';

describe('AbbreviationPipe', () => {
  it('should return proper value', () => {
    const pipe = new AbbreviationPipe();

    expect(pipe.transform('')).toBe('');
    expect(pipe.transform('Mistersandman')).toBe('Mn');
    expect(pipe.transform('Mister Sandman')).toBe('Ms');
    expect(pipe.transform('Mister Johnny Sandman')).toBe('Mj');
  });
});
