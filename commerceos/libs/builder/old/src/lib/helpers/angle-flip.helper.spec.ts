import { AngleFlipHelper } from './angle-flip.helper';

describe('AngleFlipHelper', () => {

  const helper = new AngleFlipHelper();

  it('should be defined', () => {

    expect(helper).toBeDefined();

  });

  it('should flip vertically', () => {

    // 360
    expect(helper.flipV(360)).toBe(360);

    // 270
    expect(helper.flipV(270)).toBe(90);

    // 90
    expect(helper.flipV(90)).toBe(270);

    // 300
    expect(helper.flipV(300)).toBe(30.000000000000014);

    // 200
    expect(helper.flipV(200)).toBe(110);

    // 460
    expect(helper.flipV(460)).toBe(190);

    // -420
    expect(helper.flipV(-420)).toBe(210);

  });

  it('should flip horizontally', () => {

    // 250
    expect(helper.flipH(250)).toBe(340);

    // 300
    expect(helper.flipH(300)).toBe(210);

    // 180
    expect(helper.flipH(180)).toBe(0);

    // 0
    expect(helper.flipH(0)).toBe(180);

    // 360
    expect(helper.flipH(360)).toBe(360);

  });

});
