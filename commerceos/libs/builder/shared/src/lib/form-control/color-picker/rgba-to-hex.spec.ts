import { RGBA } from './formats';
import { rgbaToHex } from './rgba-to-hex';

describe('ColorPicker:RGBA to HEX', () => {

  it('should conver rgba to hex', () => {

    expect(rgbaToHex(new RGBA(51, 51, 51, 1))).toEqual('#333333');

  });

});
