import { toJpeg, toPixelData, toPng, toSvg, toBlob } from './dom-to-image';

describe('dom-to-image', () => {

  let node: HTMLElement;

  beforeEach(() => {

    node = document.createElement('div');

  });

  it('should convert to svg', async () => {

    const options = {
      skipFonts: true,
      width: 1200,
      height: 500,
      bgcolor: '#333333',
      style: {
        color: '#ffffff',
      },
    };
    let result: string;

    document.body.appendChild(node);

    /**
     * argument options is null
     * node's widht & height are NOT set
     */
    result = await toSvg(node, null);

    expect(result.startsWith('data:image/svg+xml;charset=utf-8')).toBe(true);
    expect(result).toContain('svg');
    expect(result).toContain(`width="${parseInt(window.getComputedStyle(node).width, 10)}"`);
    expect(result).toContain('height="0"');

    /**
     * argument options is set
     */
    result = await toSvg(node, options);

    expect(result).toContain(`width="${options.width}"`);
    expect(result).toContain(`height="${options.height}"`);
    expect(result).toContain('rgb(51, 51, 51)');
    expect(result).toContain('color: rgb(255, 255, 255)');

    document.body.removeChild(node);

  });

  it('shoud convert to pixel data', async () => {

    let result: any;

    node.style.height = '350px';
    document.body.appendChild(node);

    result = await toPixelData(node, null);
    expect(result).toBeInstanceOf(Uint8ClampedArray);

    document.body.removeChild(node);

  });

  it('shoud convert to png', async () => {

    let result: any;

    node.style.height = '350px';
    document.body.appendChild(node);

    result = await toPng(node, null);
    expect(result.startsWith('data:image/png;base64')).toBe(true);

    document.body.removeChild(node);

  });

  it('should convert to jpeg', async () => {

    let result: any;

    node.style.height = '350px';
    document.body.appendChild(node);

    result = await toJpeg(node, null);
    expect(result.startsWith('data:image/jpeg;base64')).toBe(true);

    document.body.removeChild(node);

  });

  it('should convert to blob', async () => {

    let result: any;

    node.style.height = '350px';
    document.body.appendChild(node);

    result = await toBlob(node, null);
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toEqual('image/png');

    document.body.removeChild(node);

  });

});
