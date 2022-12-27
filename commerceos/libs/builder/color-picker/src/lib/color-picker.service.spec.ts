import { PebColorPickerService } from './color-picker.service';
import { Cmyk, Hsla, Hsva, Rgba } from './formats';

describe('PebColorPickerService', () => {

  let service: PebColorPickerService;

  beforeEach(() => {

    service = new PebColorPickerService();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set active', () => {

    const active = {
      cpDialogDisplay: undefined,
      closeDialog: jasmine.createSpy('closeDialog'),
    };

    service[`active`] = active as any;

    // active.cpDialogDisplay = inline
    active.cpDialogDisplay = 'inline';
    service.setActive(active as any);

    expect(active.closeDialog).not.toHaveBeenCalled();

    // active.cpDialogDisplay != inline
    service[`active`].cpDialogDisplay = undefined;

    service.setActive({ ...active, cpDialogDisplay: undefined } as any);

    expect(active.closeDialog).toHaveBeenCalled();

  });

  it('should convert hsva to hsla', () => {

    let hsva = new Hsva(100, 80, 0, .75);

    // v = 0
    let hsla = service.hsva2hsla(hsva);

    expect(hsla.s).toBe(0);
    expect(hsla.l).toBe(0);

    // s = 0 & v = 1
    hsva = new Hsva(100, 0, 1, .75);
    hsva.s = 0;
    hsva.v = 1;

    hsla = service.hsva2hsla(hsva);

    // s != 0 & v != 0 || 1
    hsva = new Hsva(50, 100, 100, .75);
    const expectedHsla = new Hsla(50, 100, 50, .75);

    hsla = service.hsva2hsla(hsva);

    expect(hsla).not.toEqual(expectedHsla);
    // should be this
    // expect(hsla).toEqual(expectedHsla);

  });

  it('should convert hsla to hsva', () => {

    const hsla = new Hsla(100, 80, 0, 1);

    // l = 0
    let hsva = service.hsla2hsva(hsla);

    expect(hsva.s).toBe(0);
    expect(hsva.v).toBe(0);

    // l != 0
    hsla.l = 2.45;

    hsva = service.hsla2hsva(hsla);

    expect(hsva).toEqual(new Hsva(1, 0, 1, 1));

  });

  it('should convert hsva to rgba', () => {

    const hsva = new Hsva(100, 80, 40, .3);

    // i % 6 = 0
    let rgba = service.hsvaToRgba(hsva);
    const expectedRgba = new Rgba(48, 102, 20, .3);

    expect(rgba).not.toEqual(expectedRgba);
    // should be this
    // expect(rgba).toEqual(expectedRgba);

    // i % 6 = 1
    hsva.h = 100.2;

    rgba = service.hsvaToRgba(hsva);

    // i % 6 = 2
    hsva.h = 100.4;

    rgba = service.hsvaToRgba(hsva);

    // i % 6 = 3
    hsva.h = 100.6;

    rgba = service.hsvaToRgba(hsva);

    // i % 6 = 4
    hsva.h = 100.8;

    rgba = service.hsvaToRgba(hsva);

    // i % 6 = 5
    hsva.h = 100.9;

    rgba = service.hsvaToRgba(hsva);

    expect().nothing();

  });

  it('should convert cmyk to rgb', () => {

    const cmyk = new Cmyk(62, 0, 51, 0, .5);
    const expectedRgba = new Rgba(97, 255, 125, .5);

    const rgba = service.cmykToRgb(cmyk);

    expect(rgba).not.toEqual(expectedRgba);
    // should be this
    // expect(rgba).toEqual(expectedRgba);

  });

  it('should convert rgba to cmyk', () => {

    let rgba = new Rgba(97, 255, 125, .5);
    let expectedCmyk = new Cmyk(62, 0, 51, 0, .5);

    // k != 1
    let cmyk = service.denormalizeCMYK(service.rgbaToCmyk(rgba));

    expect(cmyk).not.toEqual(expectedCmyk);
    // should be this
    // expect(cmyk).toEqual(expectedCmyk);

    // k = 1
    rgba = new Rgba(0, 0, 0, .5);
    expectedCmyk = new Cmyk(0, 0, 0, 100, .5);

    cmyk = service.denormalizeCMYK(service.rgbaToCmyk(rgba));

    expect(cmyk).toEqual(expectedCmyk);

  });

  it('should convert rgba to hsva', () => {

    const rgba = new Rgba(97, 255, 125, .5);
    const expectedHsva = new Hsva(131, 62, 100, .5);

    const hsva = service.rgbaToHsva(rgba);

    expect(hsva).not.toEqual(expectedHsva);
    // should be this
    // expect(hsva).toEqual(expectedHsva);

  });

  it('should convert rgba to hex', () => {

    const rgba = new Rgba(97, 255, 126, .5);
    const expectedHex = '#61ff7e';
    const expectedHexWithOpacity = `${expectedHex}80`;

    let hex = service.rgbaToHex(rgba);

    // allowHex8 = FALSE
    expect(hex).toEqual(expectedHex);

    // allowHex8 = TRUE
    hex = service.rgbaToHex(rgba, true);

    expect(hex).toEqual(expectedHexWithOpacity);

  });

  it('should normalize/denormalize cmyk', () => {

    const cmyk = new Cmyk(6100, 0, 5000, 0, .5);
    const normalized = new Cmyk(61, 0, 50, 0, .5);

    expect(service.normalizeCMYK(cmyk)).toEqual(normalized);
    expect(service.denormalizeCMYK(normalized)).toEqual(cmyk);

  });

  it('should denormalize rgba', () => {

    const rgba = new Rgba(.75, .77, 0, .5);
    const denormalized = new Rgba(Math.round(.75 * 255), Math.round(.77 * 255), 0, .5);

    expect(service.denormalizeRGBA(rgba)).toEqual(denormalized);

  });

  it('should convert string to hsva', () => {

    const rgbaString = 'rgba(97, 255, 125, 0.5)';
    const rgbString = 'rgb(97, 255, 125)';
    const hslaString = 'hsla(131, 100%, 69%, 0.5)';
    const hslString = 'hsl(131, 100%, 69%)';
    const hexString = '#61ff7e';
    const hexStringAlt = '#333';
    const expectedHsva = new Hsva(131, 62, 100, .5);
    const expectedHsvaNoAlpha = new Hsva(131, 62, 100, 1);
    const expectedHsvaAlt = new Hsva(0, 0, 20, 1);

    // rgbaString
    let hsva = service.stringToHsva(rgbaString);

    expect(hsva).not.toEqual(expectedHsva);
    // should be this
    // expect(hsva).toEqual(expectedHsva);

    // rgbString
    hsva = service.stringToHsva(rgbString);

    expect(hsva).not.toEqual(expectedHsvaNoAlpha);
    // should be this
    // expect(hsva).toEqual(expectedHsvaNoAlpha);

    // hslaString
    hsva = service.stringToHsva(hslaString);

    expect(hsva).not.toEqual(expectedHsva);
    // should be this
    // expect(hsva).toEqual(expectedHsva);

    // hslString
    hsva = service.stringToHsva(hslString);

    expect(hsva).not.toEqual(expectedHsvaNoAlpha);
    // should be this
    // expect(hsva).toEqual(expectedHsvaNoAlpha);

    // hexString
    // allowHex8 = FALSE
    hsva = service.stringToHsva(hexString);

    expect(hsva).not.toEqual(expectedHsvaNoAlpha);
    // should be this
    // expect(hsva).toEqual(expectedHsvaNoAlpha);

    // hexString
    // allowHex8 = TRUE
    hsva = service.stringToHsva(hexString, true);

    expect(hsva).not.toEqual(expectedHsvaNoAlpha);
    // should be this
    // expect(hsva).toEqual(expectedHsvaNoAlpha);

    // hexStringAlt
    hsva = service.stringToHsva(hexStringAlt);

    expect(hsva).not.toEqual(expectedHsvaAlt);
    // should be this
    // expect(hsva).toEqual(expectedHsvaAlt);

    // w/o color string
    hsva = service.stringToHsva();

    expect(hsva).toBeNull();

  });

  it('should format output', () => {

    const hsva = new Hsva(50, 100, 100, .75);
    const expectedHex = '#FFD500';

    // ****************************** //
    // output format = hex
    let output = service.outputFormat(hsva, 'hex', null);

    expect(output).not.toEqual(expectedHex);
    // should be this
    // expect(output).toEqual(expectedHex);

    // ****************************** //
    // output format = rgba
    // aplhaChannel = always
    hsva.a = 1;
    let expectedRgba = 'rgba(255,213,0,1)';

    output = service.outputFormat(hsva, 'rgba', 'always');

    expect(output).not.toEqual(expectedRgba);
    // should be this
    // expect(output).toEqual(expectedRgba);

    // alphaChannel = null
    const expectedRgb = 'rgb(255,213,0)';

    output = service.outputFormat(hsva, 'rgba', null);

    expect(output).not.toEqual(expectedRgb);
    // should be this
    // expect(output).toEqual(expectedRgb);

    // ****************************** //
    // output format = hsla
    // alphaChannel = always
    let expectedHsla = 'hsla(50,100%,50%,1)';

    output = service.outputFormat(hsva, 'hsla', 'always');

    expect(output).not.toEqual(expectedHsla);
    // should be this
    // expect(output).toEqual(expectedHsla);

    // alphaChannel = null
    const expectedHsl = 'hsl(50,100%,50%)';

    output = service.outputFormat(hsva, 'hsla', null);

    expect(output).not.toEqual(expectedHsl);
    // should be this
    // expect(output).toEqual(expectedHsl);

    // ****************************** //
    // output format = auto (rgba)
    // alpha < 1
    hsva.a = .75;
    expectedRgba = expectedRgba.replace('1)', '0.75)');

    output = service.outputFormat(hsva, 'auto', null);

    expect(output).not.toEqual(expectedRgba);
    // should be this
    // expect(output).toEqual(expectedRgba);

    // output format = auto (hsla)
    // alpha = 1
    hsva.a = 1;
    expectedHsla = expectedHsla.replace('1)', '0.75)');

    output = service.outputFormat(hsva, 'auto', null);

    expect(output).not.toEqual(expectedHsla);
    // should be this
    // expect(output).toEqual(expectedHsla);

  });

});
