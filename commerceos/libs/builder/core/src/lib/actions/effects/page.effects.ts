import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

import { PebPageEffect } from '../../models/action';
import { PebThemePageInterface } from '../../models/database';

export type PebPageEffectHandler = (
  page: null | PebThemePageInterface,
  payload: PebThemePageInterface
) => PebThemePageInterface | null;

export const pebPageEffectHandler: { [effectName in PebPageEffect]: PebPageEffectHandler } = {
  [PebPageEffect.Create]: pebPageEffectCreateHandler,
  [PebPageEffect.Patch]: pebPageEffectPatchHandler,
  [PebPageEffect.Update]: pebPageEffectUpdateHandler,
};

function pebPageEffectCreateHandler(page, payload: PebThemePageInterface): PebThemePageInterface {
  return payload;
}

function pebPageEffectUpdateHandler(
  prevPage: PebThemePageInterface,
  payload: Partial<PebThemePageInterface>,
): PebThemePageInterface {
  return {
    ...prevPage,
    name: payload?.name ? payload.name : prevPage?.name,
    variant: payload?.variant ? payload.variant : prevPage?.variant,
    master: {
      ...(prevPage?.master ? prevPage.master : {}),
      ...payload?.master,
    },
    data: {
      ...prevPage?.data,
      ...payload?.data,
    },
    skip: payload && 'skip' in payload ? payload.skip : prevPage?.skip,
    parentId: payload && 'parentId' in payload ? payload.parentId : prevPage?.parentId,
  };
}

function pebPageEffectPatchHandler(
  prevPage: PebThemePageInterface,
  payload: Partial<PebThemePageInterface>,
): PebThemePageInterface {
  return merge(cloneDeep(prevPage ?? { }), payload ?? { });
}
