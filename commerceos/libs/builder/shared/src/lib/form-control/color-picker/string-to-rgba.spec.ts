import { RGBA } from './formats';
import { stringToRgba } from './string-to-rgba';

describe('ColorPicker:String to RGBA', () => {

  it('should convert string to rgba', () => {

    const errorSpy = spyOn(console, 'error');

    /**
     * value is '#333'
     */
    expect(stringToRgba('#333')).toEqual(new RGBA(51, 51, 51, 1));
    expect(errorSpy).not.toHaveBeenCalled();

    /**
     * value is '#5142af'
     */
    expect(stringToRgba('#5142af')).toEqual(new RGBA(81, 66, 175, 1));
    expect(errorSpy).not.toHaveBeenCalled();

    /**
     * value is '#4d922133'
     */
    expect(stringToRgba('#4d922133')).toEqual(new RGBA(77, 146, 33, 0.2));
    expect(errorSpy).not.toHaveBeenCalled();

    /**
     * value is 'rgb(51, 51, 51)'
     */
    expect(stringToRgba('rgb(51, 51, 51)')).toEqual(new RGBA(51, 51, 51, 1));
    expect(errorSpy).not.toHaveBeenCalled();

    /**
     * value is 'rgba(51, 51, 51, 0.75)'
     */
    expect(stringToRgba('rgba(51, 51, 51, 0.75)')).toEqual(new RGBA(51, 51, 51, 0.75));
    expect(errorSpy).not.toHaveBeenCalled();

    /**
     * value is 'test'
     */
    expect(stringToRgba('test')).toEqual(new RGBA(255, 255, 255, 1));
    expect(errorSpy).toHaveBeenCalledWith('Invalid color: test. Supported formats are: hex, hex8, rgb, rgba');

  });

});
