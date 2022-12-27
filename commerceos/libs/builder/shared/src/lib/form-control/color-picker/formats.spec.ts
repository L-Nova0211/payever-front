import { HSVA, isHSVA, isRGBA, RGBA } from './formats';

describe('ColorPicker:Formats', () => {

  it('should test rgba', () => {

    expect(isRGBA(new RGBA(51, 51, 51, 1))).toBe(true);
    expect(isRGBA(new RGBA(51, 51, 51, undefined))).toBe(false);

  });

  it('should test hsva', () => {

    expect(isHSVA(new HSVA(0, 0, 20, 1))).toBe(true);
    expect(isHSVA(new HSVA(0, 0, 20, undefined))).toBe(false);

  });

});
