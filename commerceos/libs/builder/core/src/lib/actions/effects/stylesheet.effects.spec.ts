import omit from 'lodash/omit';

import { PebStylesheetEffect } from '../../models/action';

import { pebStylesheetEffectHandlers } from './stylesheet.effects';

describe('Effects:Stylesheet', () => {

  let prevState: any;

  beforeEach(() => {

    prevState = {
      'elem-001': {
        color: '#333333',
        backgroundColor: '#cccccc',
      },
      'elem-002': {
        color: '#ffffff',
        backgroundColor: '#111111',
      },
    };

  });

  it('should handle stylesheet init', () => {

    const initHandler = pebStylesheetEffectHandlers[PebStylesheetEffect.Init];
    const payload = {
      'elem-001': prevState['elem-001'],
    };

    expect(initHandler(null, payload)).toEqual(payload);

  });

  it('should handle stylesheet update', () => {

    const updateHandler = pebStylesheetEffectHandlers[PebStylesheetEffect.Update];
    const payload = {
      'elem-002': { backgroundColor: '#ff0000' },
    };

    expect(updateHandler(prevState, payload)).toEqual({
      ...prevState,
      'elem-002': {
        ...prevState['elem-002'],
        ...payload['elem-002'],
      },
    });

  });

  it('should handle stylesheet replace', () => {

    const replaceHandler = pebStylesheetEffectHandlers[PebStylesheetEffect.Replace];
    const payload = {
      selector: 'elem-001',
      styles: { opacity: 0 },
    };

    expect(replaceHandler(prevState, payload)).toEqual({
      ...prevState,
      [payload.selector]: payload.styles,
    });

  });

  it('should handle stylesheet delete', () => {

    const deleteHandler = pebStylesheetEffectHandlers[PebStylesheetEffect.Delete];
    const payload = 'elem-001';

    expect(deleteHandler(prevState, payload)).toEqual(omit(prevState, payload));

  });

  it('should handle stylesheet destroy', () => {

    const destroyHandler = pebStylesheetEffectHandlers[PebStylesheetEffect.Destroy];

    expect(destroyHandler(null, null)).toBeNull();

  });

});
