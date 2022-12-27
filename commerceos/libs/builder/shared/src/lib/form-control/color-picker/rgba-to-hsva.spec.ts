import { HSVA, RGBA } from './formats';
import { rgbaToHsva } from './rgba-to-hsva';

describe('ColorPicker:RGBA to HSVA', () => {

  it('should convert rgba to hsva', () => {

    expect(rgbaToHsva(new RGBA(0, 0, 0, 1))).toEqual(new HSVA(0, 0, 0, 100));
    expect(rgbaToHsva(new RGBA(102, 102, 102, 1))).toEqual(new HSVA(0, 0, 40, 100));
    expect(rgbaToHsva(new RGBA(204, 102, 102, 1))).toEqual(new HSVA(0, 50, 80, 100));
    expect(rgbaToHsva(new RGBA(255, 0, 255, 1))).toEqual(new HSVA(300, 100, 100, 100));
    expect(rgbaToHsva(new RGBA(0, 255, 0, 1))).toEqual(new HSVA(120, 100, 100, 100));
    expect(rgbaToHsva(new RGBA(0, 0, 255, 1))).toEqual(new HSVA(240, 100, 100, 100));

  });

});
