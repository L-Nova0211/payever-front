import { PebInteractionType, pebLinkDatasetLink } from '@pe/builder-core';
import Quill from '@pe/quill';
import Delta from 'quill-delta';
import {
  matcher,
  registerFontFamily,
  registerFontSize,
  registerFontWeight,
  registerPebLink,
} from './quill';

describe('Quill', () => {

  it('should match', () => {

    const node = {
      getAttribute: jasmine.createSpy('getAttribute').and.returnValue(null),
      style: {
        fontSize: null,
        fontFamily: null,
        fontWeight: null,
        fontStyle: null,
        color: null,
      },
    };
    const delta = new Delta([{ insert: 'test' }]);

    /**
     * node.style.fontSize, fontFamily, fontWeight, fontStyle & color are null
     * node.getAttribute returns null
     */
    expect(matcher(node, delta)).toEqual(delta);
    expect(node.getAttribute).toHaveBeenCalledWith('color');

    /**
     * node.getAttribute returns mocked color
     * node.style.fontSize, fontFamily, fontWeight & fontStyle are set
     */
    node.getAttribute.and.returnValue('#333333');
    node.style = {
      ...node.style,
      fontSize: '32px',
      fontFamily: 'Roboto',
      fontWeight: '700',
      fontStyle: 'normal',
    };

    expect(matcher(node, delta)).toEqual(new Delta([{
      insert: 'test',
      attributes: {
        color: '#333333',
        fontFamily: 'Roboto',
        fontSize: 32,
        fontWeight: 700,
        italic: false,
      },
    }]));

  });

  it('should register peb link', () => {

    let pebLink = null;
    const registerSpy = spyOn(Quill, 'register').and.callFake(link => pebLink = link);
    const value = {
      type: PebInteractionType.NavigateInternal,
      payload: null,
    };

    registerPebLink();

    expect(registerSpy).toHaveBeenCalled();
    expect(pebLink).toBeDefined();

    // create
    // payload is null
    let created: HTMLAnchorElement = pebLink.create(value);
    expect(created.getAttribute(pebLinkDatasetLink.type)).toEqual(value.type);
    expect(created.href).toEqual(`${location.origin}/#`);

    // payload is set
    value.payload = {
      url: 'url/internal',
      test: 'true',
      test2: null,
    };

    created = pebLink.create(value);
    expect(created.dataset['url']).toEqual(value.payload.url);
    expect(created.dataset['test']).toEqual(value.payload.test);
    expect(created.dataset['test2']).toEqual('');

    // formats
    expect(pebLink.formats(created)).toEqual({
      ...value,
      payload: {
        ...value.payload,
        test2: '',
      },
    });

  });

  it('should register font size', () => {

    let fontSizeAttributor = null;
    const registerSpy = spyOn(Quill, 'register').and.callFake(attributor => fontSizeAttributor = attributor);
    const node = document.createElement('p');

    registerFontSize();

    expect(registerSpy).toHaveBeenCalled();
    expect(fontSizeAttributor).toBeDefined();

    const { attrName, keyName, scope } = fontSizeAttributor;
    expect(attrName).toEqual('fontSize');
    expect(keyName).toEqual('font-size');
    expect(scope).toBe(5);

    // get value
    expect(fontSizeAttributor[`value`](node)).toBe(15);

    node.style.fontSize = '32px';
    expect(fontSizeAttributor[`value`](node)).toBe(32);

    // add
    fontSizeAttributor[`add`](node, '44.75');
    expect(node.style.fontSize).toEqual('44.75px');

  });

  it('should register font family', () => {

    let fontFamilyAttributor = null;
    const registerSpy = spyOn(Quill, 'register').and.callFake(attributor => fontFamilyAttributor = attributor);
    const node = document.createElement('p');

    registerFontFamily();

    expect(registerSpy).toHaveBeenCalled();
    expect(fontFamilyAttributor).toBeDefined();

    const { attrName, keyName, scope } = fontFamilyAttributor;
    expect(attrName).toEqual('fontFamily');
    expect(keyName).toEqual('font-family');
    expect(scope).toBe(5);

    // get value
    expect(fontFamilyAttributor[`value`](node)).toEqual('');

    node.style.fontFamily = 'Montserrat, Roboto';
    expect(fontFamilyAttributor[`value`](node)).toEqual('Montserrat, Roboto');

  });

  it('should register font weight', () => {

    let fontWeightAttributor = null;
    const registerSpy = spyOn(Quill, 'register').and.callFake(attributor => fontWeightAttributor = attributor);
    const node = document.createElement('p');

    registerFontWeight();

    expect(registerSpy).toHaveBeenCalled();
    expect(fontWeightAttributor).toBeDefined();

    const { attrName, keyName, scope } = fontWeightAttributor;
    expect(attrName).toEqual('fontWeight');
    expect(keyName).toEqual('font-weight');
    expect(scope).toBe(5);

    // get value
    expect(fontWeightAttributor[`value`](node)).toBeNaN();

    node.style.fontWeight = '700';
    expect(fontWeightAttributor[`value`](node)).toBe(700);

    // add
    fontWeightAttributor[`add`](node, '300');
    expect(node.style.fontWeight).toEqual('300');

  });

});
