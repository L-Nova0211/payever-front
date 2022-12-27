import { HSVA, RGBA } from './formats';
import { hsvaToRgba } from './hsva-to-rgb';

describe('ColorPicker:HSVA to RGBA', () => {

  it('should convert hsva to rgba', () => {

    expect(hsvaToRgba(new HSVA(undefined, 0, 20, 100))).toEqual(new RGBA(0, 0, 0, 1));
    expect(hsvaToRgba(new HSVA(0, 0, 20, 100))).toEqual(new RGBA(51, 51, 51, 1));
    expect(hsvaToRgba(new HSVA(70, 45, 90, 50))).toEqual(new RGBA(212, 230, 126, 0.5));
    expect(hsvaToRgba(new HSVA(140, 90, 90, 75))).toEqual(new RGBA(23, 230, 92, 0.75));
    expect(hsvaToRgba(new HSVA(185, 50, 70, 100))).toEqual(new RGBA(89, 171, 179, 1));
    expect(hsvaToRgba(new HSVA(255, 100, 10, 100))).toEqual(new RGBA(6, 0, 26, 1));
    expect(hsvaToRgba(new HSVA(310, 95, 35, 100))).toEqual(new RGBA(89, 4, 75, 1));

  });

});
