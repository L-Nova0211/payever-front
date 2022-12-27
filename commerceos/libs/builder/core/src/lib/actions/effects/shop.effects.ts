import { PebShopEffect } from '../../models/action';
import { PebShopData } from '../../models/client';
import {
  PebShopRoute,
  PebThemeDetailInterface,
  PebThemeShortPageInterface,
} from '../../models/database';

export const pebShopEffectHandlers: {
  [effectName in PebShopEffect]: (
    prevState: PebThemeDetailInterface,
    payload: any,
  ) => PebThemeDetailInterface
} = {
  [PebShopEffect.Init]: pebShopEffectCreateHandler,
  [PebShopEffect.UpdateData]: pebShopEffectUpdateDataHandler,
  [PebShopEffect.UpdateRouting]: pebShopEffectUpdateRoutingHandler,
  [PebShopEffect.PatchRouting]: pebShopEffectPatchRoutingHandler,
  [PebShopEffect.DeleteRoutes]: pebShopEffectDeleteRoutesHandler,
  [PebShopEffect.UpdatePages]: pebShopEffectUpdatePagesHandler,
  [PebShopEffect.AppendPage]: pebShopEffectAppendPageHandler,
};

function pebShopEffectCreateHandler(prevState, payload: PebThemeDetailInterface): PebThemeDetailInterface {
  return payload;
}

function pebShopEffectUpdateDataHandler(
  prevState: PebThemeDetailInterface,
  payload: Partial<PebShopData>,
): PebThemeDetailInterface {
  return {
    ...prevState,
    application: {
      ...prevState.application,
      data: {
        ...prevState.application.data,
        ...payload,
      },
    },
  };
}

function pebShopEffectUpdateRoutingHandler(
  prevState: PebThemeDetailInterface,
  payload: PebShopRoute[],
): PebThemeDetailInterface {
  return {
    ...prevState,
    application: {
      ...prevState?.application,
      routing: payload,
    },
  };
}

function pebShopEffectPatchRoutingHandler(
  prevState: PebThemeDetailInterface,
  payload: PebShopRoute[],
): PebThemeDetailInterface {
  const updatedRoutes =
    payload.filter(route => prevState?.application?.routing?.find(r => r.routeId === route.routeId));
  const newRoutes = payload.filter(route => !updatedRoutes.find(r => r.routeId === route.routeId));
  const oldRoutes = prevState?.application?.routing?.filter(route =>
    !updatedRoutes.find(r => r.routeId === route.routeId) && !newRoutes.find(r => r.routeId === route.routeId),
  ) ?? [];

  return {
    ...prevState,
    application: {
      ...prevState?.application,
      routing: [
        ...updatedRoutes,
        ...newRoutes,
        ...oldRoutes,
      ],
    },
  };
}

function pebShopEffectDeleteRoutesHandler(
  prevState: PebThemeDetailInterface,
  payload: PebShopRoute[],
): PebThemeDetailInterface {
  const routing =
    prevState?.application?.routing.filter(route => !payload.find(r => r.routeId === route.routeId)) ?? [];

  return {
    ...prevState,
    application: {
      ...prevState?.application,
      routing,
    },
  };
}

function pebShopEffectUpdatePagesHandler(
  prevShop: PebThemeDetailInterface,
  payload: PebThemeShortPageInterface[],
): PebThemeDetailInterface {
  return {
    ...prevShop,
    pages: payload,
  };
}

function pebShopEffectAppendPageHandler(
  prevShop: PebThemeDetailInterface,
  payload: PebThemeShortPageInterface,
): PebThemeDetailInterface {
  if (payload.duplicatedPageId == null) {
    return {
      ...prevShop,
      pages: [...prevShop?.pages ?? [], payload],
    };
  }
  const index = prevShop?.pages.indexOf(prevShop?.pages.find(page => page.id === payload.duplicatedPageId));
  if (index != null && index >= 0) {
    prevShop.pages.splice(index + 1, 0, payload);
  } else {
    prevShop.pages.push(payload);
  }

  return {
    ...prevShop,
  };
}
