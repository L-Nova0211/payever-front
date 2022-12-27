import { getContentDimensions, implementsContentOverflow } from './content-dimensions';

describe('Utils:Content Dimensions', () => {

  it('should check if element implements content overflow', () => {

    const element = {
      getContentDimensions() { },
    };

    expect(implementsContentOverflow(element)).toBe(true);

  });

  it('should get content dimensions', () => {

    let elm: HTMLElement;
    let child: HTMLElement | Text | Comment;
    const dimensions = {
      width: 1000,
      height: 100,
    };

    // div > p
    elm = document.createElement('div');
    child = document.createElement('p');
    elm.style.width = `${dimensions.width}px`;
    elm.style.height = `${dimensions.height}px`;

    elm.appendChild(child);
    document.body.appendChild(elm);

    expect(getContentDimensions(elm)).toEqual({
      width: -Infinity,
      height: -Infinity,
    });

    document.body.removeChild(elm);

    // div > textNode
    elm = document.createElement('div');
    child = document.createTextNode('James Bond');

    elm.appendChild(child);
    document.body.appendChild(elm);

    const range = document.createRange();
    range.selectNodeContents(child);
    let rect = range.getBoundingClientRect();
    expect(getContentDimensions(elm)).toEqual({
      width: rect.width,
      height: rect.height,
    });

    document.body.removeChild(elm);

    // div > conmmentNode
    elm = document.createElement('div');
    child = document.createComment('James Bond');

    elm.appendChild(child);
    document.body.appendChild(elm);

    expect(getContentDimensions(elm)).toEqual({
      width: -Infinity,
      height: -Infinity,
    });

    document.body.removeChild(elm);

    // div > div
    elm = document.createElement('div');
    child = document.createElement('span');

    child.style.display = 'block';
    child.style.width = '1000px';
    child.style.height = '100px';

    elm.appendChild(child);
    document.body.appendChild(elm);

    expect(getContentDimensions(elm)).toEqual({
      width: 1000,
      height: 100,
    });

  });

});
