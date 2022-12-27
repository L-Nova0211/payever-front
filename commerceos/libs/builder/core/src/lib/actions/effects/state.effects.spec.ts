import omit from 'lodash/omit';

import { HandlerStateEffect } from '../../models/action';
import { PebLanguage } from '../../models/client';

import { handlerStateEffectHandlers } from './state.effects';

describe('Effects:State', () => {

  let state: any;

  beforeEach(() => {

    const pagesMock = [
      { id: 'p-001' },
      { id: 'p-002' },
      { id: 'p-003' },
    ];

    state = {
      snapshot: {
        id: 'snap-001',
        pages: [...pagesMock],
        application: {
          routing: pagesMock.map(page => ({
            routeId: `r-${page.id.replace(/\D-/, '')}`,
            pageId: page.id,
            url: `pages/${page.id}`,
          })),
        },
      },
      pages: pagesMock.reduce((acc, page) => {
        acc[page.id] = page;

        return acc;
      }, {}),
      languageMaps: {
        [PebLanguage.English]: {
          isDefault: true,
          locale: PebLanguage.English,
          data: {},
        },
        [PebLanguage.German]: {
          isDefault: false,
          locale: PebLanguage.German,
          data: {},
        },
      },
    };

  });

  it('should handle set default language effect', () => {

    const setDefaultLanguageHandler = handlerStateEffectHandlers[HandlerStateEffect.LanguageSetDefault];
    const payload = PebLanguage.German;

    expect(setDefaultLanguageHandler(state, payload)).toEqual({
      ...state,
      languageMaps: {
        [PebLanguage.English]: {
          isDefault: false,
          locale: PebLanguage.English,
          data: {},
        },
        [PebLanguage.German]: {
          isDefault: true,
          locale: PebLanguage.German,
          data: {},
        },
      },
    });

  });

  it('should handle add language effect', () => {

    const addLanguageHandler = handlerStateEffectHandlers[HandlerStateEffect.LanguageAdd];
    const payload = PebLanguage.Chinese;

    expect(addLanguageHandler(state, payload)).toEqual({
      ...state,
      languageMaps: {
        ...state.languageMaps,
        [PebLanguage.Chinese]: {
          isDefault: false,
          locale: PebLanguage.Chinese,
          data: {},
        },
      },
    });

  });

  it('should handle remove language effect', () => {

    const removeLanguageHandler = handlerStateEffectHandlers[HandlerStateEffect.LanguageRemove];
    const payload = PebLanguage.English;

    expect(removeLanguageHandler(state, payload)).toEqual({
      ...state,
      languageMaps: {
        [PebLanguage.German]: {
          isDefault: false,
          locale: PebLanguage.German,
          data: {},
        },
      },
    });

  });

  it('should handle language merge effect', () => {

    const handleMergeMap = handlerStateEffectHandlers[HandlerStateEffect.LanguageMerge];
    const payload = {
      locale: PebLanguage.Chinese,
      data: {
        test2: 'two',
        test3: null,
      },
    };

    state.languageMaps[PebLanguage.English].data = {
      test: 'one',
      test3: 'three',
    };

    /**
     * language does NOT exist in state.languageMaps
     */
    expect(handleMergeMap(state, payload)).toEqual({
      ...state,
      languageMaps: {
        ...state.languageMaps,
        [payload.locale]: {
          locale: payload.locale,
          isDefault: false,
          data: { test2: 'two' },
        },
      },
    });

    /**
     * language exists in state.languageMaps
     */
    payload.locale = PebLanguage.English;
    expect(handleMergeMap(state, payload)).toEqual({
      ...state,
      languageMaps: {
        ...state.languageMaps,
        [payload.locale]: {
          locale: payload.locale,
          isDefault: true,
          data: {
            test: 'one',
            test2: 'two',
          },
        },
      },
    });

  });

  it('should handle reorder pages effect', () => {

    const reorderPagesHandler = handlerStateEffectHandlers[HandlerStateEffect.ReorderPages];
    const payload = Object.keys(state.pages).reverse();

    expect(reorderPagesHandler(state, payload)).toEqual({
      ...state,
      pages: payload.reduce((acc, id) => {
        acc[id] = { id };

        return acc;
      }, {}),
      snapshot: {
        ...state.snapshot,
        pages: payload.map(id => ({ id })),
      },
    });

  });

  it('should handle delete page effect', () => {

    const deletePageHandler = handlerStateEffectHandlers[HandlerStateEffect.DeletePage];
    const pageIdToDelete = 'p-002';

    /**
     * state.snapshot.application & pages are set
     */
    expect(deletePageHandler(state, pageIdToDelete)).toEqual({
      ...state,
      pages: omit(state.pages, pageIdToDelete),
      snapshot: {
        ...state.snapshot,
        pages: state.snapshot.pages.filter(p => p.id != pageIdToDelete),
        application: {
          ...state.snapshot.application,
          routing: state.snapshot.application.routing.filter(r => r.pageId !== pageIdToDelete),
        },
      },
    });

    /**
     * state.snapshot.application is null
     */
    state.snapshot.application = null;
    expect(deletePageHandler(state, pageIdToDelete)).toEqual({
      ...state,
      pages: omit(state.pages, pageIdToDelete),
      snapshot: {
        ...state.snapshot,
        pages: state.snapshot.pages.filter(p => p.id != pageIdToDelete),
        application: {
          routing: [],
        },
      },
    });

    /**
     * state.snapshot is null
     */
    state.snapshot = null;
    expect(deletePageHandler(state, pageIdToDelete)).toEqual({
      ...state,
      pages: omit(state.pages, pageIdToDelete),
      snapshot: {
        pages: [],
        application: {
          routing: [],
        },
      },
    });

  });

});
