import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import * as pebCore from '@pe/builder-core';
import { PebScreen } from '@pe/builder-core';

import {
  checkElements,
  excludeChildrenFromElement,
  hexToRgb,
  hexToRgba,
  isBackgroundGradient,
  rgbToHex,
  toBase64,
} from './utils';

describe('Utils', () => {

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

  });

  it('should check elements', () => {

    const apmServiceMock = {
      apm: {
        captureError: jasmine.createSpy('captureError'),
      },
    };

    /**
     * there is not falsy elements
     */
    checkElements(['elem'], apmServiceMock as any);

    expect(apmServiceMock.apm.captureError).not.toHaveBeenCalled();

    /**
     * argument elements is null
     */
    checkElements(null, apmServiceMock as any);

    expect(apmServiceMock.apm.captureError).toHaveBeenCalled();

  });

  it('should convert hex to rgba', () => {

    const hex = '#333333';
    const opacity = 50;
    const rgba = 'rgba(51, 51, 51, 0.5)';

    expect(hexToRgba(hex, opacity)).toEqual(rgba);

  });

  it('should convert rgb to hex', () => {

    const hex = '#330333';

    expect(rgbToHex(51, 3, 51)).toEqual(hex);

  });

  it('should convert hex to rgba', () => {

    const hex = '#333333';
    const rgb = { r: 51, g: 51, b: 51 };

    expect(hexToRgb(hex)).toEqual(rgb);
    expect(hexToRgb('test')).toBeNull();

  });

  it('should check is background gradient', () => {

    const bgImage = 'bg.jpg';
    const formMock = new FormGroup({
      bgImage: new FormControl('linear-gradient(to bottom, transparent, #333)'),
    });

    /**
     * arguments backgroundImage & form are both null
     */
    expect(isBackgroundGradient()).toBe(false);

    /**
     * argument form is set
     */
    expect(isBackgroundGradient(null, formMock)).toBe(true);

    /**
     * argument form.controls.bgImage.value is null
     */
    formMock.patchValue({
      bgImage: null,
    });

    expect(isBackgroundGradient(null, formMock)).toBe(false);

    /**
     * argument backgroundImage is set
     */
    expect(isBackgroundGradient(bgImage, formMock)).toBe(false);

  });

  it('should convert file to base64', fakeAsync(() => {

    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const fileBase64 = 'data:image/jpg;base64,dGVzdA==';
    const readerMock = {
      readAsDataURL: jasmine.createSpy('readAsDataUrl'),
      result: fileBase64,
      onload: null as Function,
      onerror: null as Function,
    };
    const fileReaderSpy = spyOn(window, 'FileReader').and.returnValue(readerMock as any);

    /**
     * promise resolved
     */
    toBase64(file).then(
      (value) => expect(value).toEqual(fileBase64),
    );
    readerMock.onload();

    expect(fileReaderSpy).toHaveBeenCalled();
    expect(readerMock.readAsDataURL).toHaveBeenCalledWith(file);
    expect(readerMock.onload).toBeDefined();
    expect(readerMock.onerror).toBeDefined();

    /**
     * promise rejected
     */
    toBase64(file).then(
      () => { },
      (err) => expect(err).toEqual('test error'),
    );
    readerMock.onerror('test error');

    flushMicrotasks();

  }));

  it('should exclude children from element', () => {

    const parentMock = {
      definition: {
        id: 'parent-001',
        children: [{
          id: 'ch-001',
          children: [
            { id: 'ch-002', children: [] },
            { id: 'ch-003', children: [] },
          ],
        }],
      },
    };
    const exclude = ['ch-002'];
    const screen = PebScreen.Desktop;

    const result = excludeChildrenFromElement(parentMock as any, exclude, null, screen);

    expect(result).toEqual({
      styles: {
        [screen]: {},
      },
      definition: {
        id: 'parent-001',
        children: [{
          id: 'ch-001',
          children: [{ id: 'ch-003', children: [] }],
        }],
      },
    } as any);

  });
});
