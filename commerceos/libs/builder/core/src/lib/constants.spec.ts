import { PebTextAlignType, PebTextVerticalAlign, textAlignToJustifyContent } from './constants';

describe('Constants', () => {

  it('should convert text align to justify content', () => {

    const alignJustifyMap = new Map<PebTextVerticalAlign, PebTextAlignType>([
      [PebTextVerticalAlign.Top, PebTextAlignType.FlexStart],
      [PebTextVerticalAlign.Center, PebTextAlignType.Center],
      [PebTextVerticalAlign.Bottom, PebTextAlignType.FlexEnd],
    ]);

    alignJustifyMap.forEach((justify, align) => {
      expect(textAlignToJustifyContent(align)).toEqual(justify);
    });

  });

});
