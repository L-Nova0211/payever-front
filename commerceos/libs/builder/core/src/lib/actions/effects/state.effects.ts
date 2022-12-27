import { mapValues, omit } from 'lodash';

import { HandlerStateEffect } from '../../models/action';
import { PebThemePageInterface } from '../../models/database';
import { Dictionary, HandlerState } from '../compiler.helpers';

export const handlerStateEffectHandlers: {
    [effectName in HandlerStateEffect]: (
      prevState: HandlerState,
      payload: any,
    ) => HandlerState
} = {
  [HandlerStateEffect.ReorderPages]: handlerStateEffectReorderPagesHandler,
  [HandlerStateEffect.DeletePage]: handlerStateEffectDeletePageHandler,
  [HandlerStateEffect.LanguageAdd]: handlerStateEffectAddLanguage,
  [HandlerStateEffect.LanguageRemove]: handlerStateEffectRemoveLanguage,
  [HandlerStateEffect.LanguageMerge]: handlerStateEffectMergeMap,
  [HandlerStateEffect.LanguageSetDefault]: handlerStateEffectSetDefaultLanguage,
};

function handlerStateEffectSetDefaultLanguage(
  state: HandlerState,
  payload: string,
): HandlerState {
  return {
    ...state,
    languageMaps: mapValues(state.languageMaps, languageMap => ({
      ...languageMap,
      isDefault: languageMap.locale === payload,
    })),
  };
}

function handlerStateEffectAddLanguage(
  state: HandlerState,
  payload: string,
): HandlerState {
  return {
    ...state,
    languageMaps: {
      ...state.languageMaps,
      [payload]: {
        locale: payload,
        isDefault: Object.keys(state.languageMaps).length === 0,
        data: {},
      },
    },
  };
}

function handlerStateEffectRemoveLanguage(
    state: HandlerState,
    payload: string,
): HandlerState {
  return {
    ...state,
    languageMaps: omit(state.languageMaps, payload),
  };
}

function handlerStateEffectMergeMap(
  state: HandlerState,
  payload: {
    locale: string,
    data: {
      [key: string]: string;
    },
  },
): HandlerState {
  const keysToDrop = Object.entries(payload.data)
    .map(([key, value]) => value === null ? key : null)
    .filter(key => key !== null);
  return {
    ...state,
    languageMaps: {
      ...state.languageMaps,
      [payload.locale]: {
        locale: payload.locale,
        isDefault: state.languageMaps[payload.locale]?.isDefault ?? false,
        data: omit({
          ...state.languageMaps[payload.locale]?.data,
          ...payload.data,
        }, ...keysToDrop),
      },
    },
  };
}

function handlerStateEffectReorderPagesHandler(
    state: HandlerState,
    payload: string[],
): HandlerState {
  const reorderedPagesArray = payload
        .map(pageId => state.snapshot.pages.find(page => page.id === pageId));
  const reorderedPagesDictionary: Dictionary<PebThemePageInterface> = {};
  for (const pageId of payload) {
    reorderedPagesDictionary[pageId] = state.pages[pageId];
  }
  return {
    ...state,
    pages: reorderedPagesDictionary,
    snapshot: {
      ...state.snapshot,
      pages: reorderedPagesArray,
    },
  };
}

const filterArray = <T>(array: T[], predicate: Parameters<T[]['filter']>[0]) => {
  return Array.isArray(array) ? array.filter(predicate) : [];
};

function handlerStateEffectDeletePageHandler(
    state: HandlerState,
    pageIdToDelete: string,
): HandlerState {
  return {
    ...state,
    pages: omit(state.pages, pageIdToDelete),
    snapshot: {
      ...state.snapshot,
      pages: filterArray(state.snapshot?.pages, page => page.id !== pageIdToDelete),
      application: {
        ...state.snapshot?.application,
        routing: filterArray(state.snapshot?.application?.routing, (route => route.pageId !== pageIdToDelete)),
      },
    },
  };
}
