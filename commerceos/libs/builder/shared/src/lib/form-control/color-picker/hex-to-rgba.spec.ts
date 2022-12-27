import { hexToRgba } from './hex-to-rgba';

describe('ColorPicker:HEX to RGBA', () => {

  it('should convert hex to rgba', () => {

    const hex = '#333333';
    const rgba = { r: 51, g: 51, b: 51, a: 1 };

    expect(hexToRgba('test')).toBeNull();
    expect(hexToRgba(hex)).toEqual(rgba);

  });

});
