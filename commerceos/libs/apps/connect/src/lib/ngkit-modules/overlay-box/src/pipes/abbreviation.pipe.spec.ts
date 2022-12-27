import { AbbreviationPipe } from './abbreviation.pipe';

describe('AbbreviationPipe', () => {

  it('should return proper value', () => {
    const pipe = new AbbreviationPipe();

    expect(pipe.transform('Mistersandman')).toBe('MN');
    expect(pipe.transform('Mister Sandman')).toBe('MS');
    expect(pipe.transform('Mister Johnny Sandman')).toBe('MJ');
  });
});
