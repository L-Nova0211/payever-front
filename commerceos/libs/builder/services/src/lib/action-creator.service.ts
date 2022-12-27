import {
  getPageUrlByName,
  HandlerStateEffect,
  PebAction,
  PebContextSchemaEffect,
  PebContextSchemaId,
  pebGenerateId,
  PebPageEffect,
  PebPageId,
  PebPageType,
  PebScreen,
  PebShopData,
  PebShopEffect,
  PebShopRoute,
  PebShopRouteId,
  PebStylesheetEffect,
  PebStylesheetId,
  PebTemplateEffect,
  PebTemplateId,
  PebThemePageInterface,
  PebThemeShortPageInterface,
} from '@pe/builder-core';

import { pebCreateEffect } from './effect-creator.service';

export interface PebInitPageIds {
  pageId: PebPageId;
  templateId: PebTemplateId;
  stylesheetIds: {
    [screen in PebScreen]: PebStylesheetId;
  };
  contextId: PebContextSchemaId;
  routeId: PebShopRouteId;
}

export interface PebPageWithIdsPayload {
  page: PebThemePageInterface;
  ids: PebInitPageIds;
}

export enum PebActionType {
  CreatePage = 'create-page',
  ReorderPages = 'reorder-pages',
  CreatePageWithIds = 'create-page-with-ids',
  DeletePage = 'delete-page',
  UpdatePageData = 'update-page-data',
  UpdateShopData = 'update-shop-data',
}

const pebCreateActionHandlers: {
  [actionType in PebActionType]: (payload: any) => PebAction
} = {
  [PebActionType.CreatePage]: pebCreatePageAction,
  [PebActionType.CreatePageWithIds]: pebCreatePageWithIdsAction,
  [PebActionType.DeletePage]: pebDeletePageAction,
  [PebActionType.UpdatePageData]: pebUpdatePageDataAction,
  [PebActionType.UpdateShopData]: pebUpdateShopDataAction,
  [PebActionType.ReorderPages]: pebReorderPagesAction,
};

export function pebCreateAction(type: PebActionType.CreatePage, payload: PebThemePageInterface): PebAction;
export function pebCreateAction(type: PebActionType.DeletePage, payload: PebThemeShortPageInterface): PebAction;
export function pebCreateAction(type: PebActionType.CreatePageWithIds, payload: PebPageWithIdsPayload): PebAction;
export function pebCreateAction(type: PebActionType.UpdatePageData, payload: Partial<PebThemePageInterface>): PebAction;
export function pebCreateAction(type: PebActionType.UpdateShopData, payload: Partial<PebShopData>): PebAction;
export function pebCreateAction(type: PebActionType.ReorderPages, payload: Partial<any>): PebAction;
export function pebCreateAction(type: PebActionType, payload: any): PebAction {
  return pebCreateActionHandlers[type](payload);
}

function pebCreatePageAction(page: PebThemePageInterface): PebAction {
  const templateId = pebGenerateId('template');
  const stylesIds = {
    [PebScreen.Desktop]: pebGenerateId('stylesheet'),
    [PebScreen.Tablet]: pebGenerateId('stylesheet'),
    [PebScreen.Mobile]: pebGenerateId('stylesheet'),
  };
  const contextId = pebGenerateId('context');
  const routeId = pebGenerateId('route');

  const routes: PebShopRoute[] = [{
    routeId,
    pageId: page.id,
    url: getPageUrlByName(page.name, page.variant),
  }];

  const nextPage: PebThemePageInterface = {
    templateId,
    contextId,
    id: page.id,
    duplicatedPageId: page.duplicatedPageId,
    variant: page.variant,
    skip: false,
    type: page.type,
    master: page.master,
    name: page.name,
    data: page.data,
    stylesheetIds: stylesIds,
  };

  return {
    id: pebGenerateId('action'),
    createdAt: new Date(),
    targetPageId: page.id,
    affectedPageIds: [page.id],
    effects: [
      pebCreateEffect(PebPageEffect.Create, page.id, nextPage),
      pebCreateEffect(PebTemplateEffect.Init, templateId, page.template),
      ...Object.values(PebScreen).map((screen: PebScreen) => (
        pebCreateEffect(PebStylesheetEffect.Init, stylesIds[screen], page.stylesheets[screen])
      )),
      pebCreateEffect(PebContextSchemaEffect.Init, contextId, page.context),
      pebCreateEffect(PebShopEffect.AppendPage, null, nextPage),
      ...(page.type === PebPageType.Master ? [] : [pebCreateEffect(PebShopEffect.PatchRouting, null, routes)]),
    ],
  };
}

function pebDeletePageAction(page: PebThemeShortPageInterface): PebAction {
  return {
    id: pebGenerateId('action'),
    createdAt: new Date(),
    targetPageId: page.id,
    affectedPageIds: [page.id],
    effects: [
      ...Object.values(PebScreen).map(screen => (
        pebCreateEffect(PebStylesheetEffect.Destroy, page.stylesheetIds[screen], null)
      )),
      pebCreateEffect(PebContextSchemaEffect.Destroy, page.contextId, null),
      pebCreateEffect(PebTemplateEffect.Destroy, page.templateId, page.templateId),
      pebCreateEffect(HandlerStateEffect.DeletePage, page.id, page.id),
    ],
  };
}

function pebCreatePageWithIdsAction({ page, ids }: PebPageWithIdsPayload): PebAction {
  const routes: PebShopRoute[] = [{
    routeId: ids.routeId,
    pageId: ids.pageId,
    url: getPageUrlByName(page.name, page.variant),
  }];

  const nextPage: PebThemePageInterface = {
    id: ids.pageId,
    variant: page.variant,
    type: page.type,
    name: page.name,
    data: page.data,
    skip: page.skip,
    templateId: ids.templateId,
    stylesheetIds: ids.stylesheetIds,
    contextId: ids.contextId,
    master: page.master,
  };

  return {
    id: pebGenerateId('action'),
    createdAt: new Date(),
    targetPageId: nextPage.id,
    affectedPageIds: [nextPage.id],
    effects: [
      pebCreateEffect(PebTemplateEffect.Init, nextPage.templateId, page.template),
      ...Object.values(PebScreen).map(screen => (
        pebCreateEffect(PebStylesheetEffect.Init, nextPage.stylesheetIds[screen], page.stylesheets[screen])
      )),
      pebCreateEffect(PebContextSchemaEffect.Init, nextPage.contextId, page.context),
      pebCreateEffect(PebPageEffect.Create, nextPage.id, nextPage),
      pebCreateEffect(PebShopEffect.AppendPage, null, nextPage),
      pebCreateEffect(PebShopEffect.PatchRouting, null, routes),
    ],
  };
}

function pebUpdatePageDataAction(payload: Partial<PebThemePageInterface>): PebAction {
  return {
    id: pebGenerateId('action'),
    createdAt: new Date(),
    targetPageId: payload.id,
    affectedPageIds: [payload.id],
    effects: [
      pebCreateEffect(PebPageEffect.Update, payload.id, payload),
    ],
  };
}

function pebUpdateShopDataAction(payload: Partial<PebShopData>): PebAction {
  return {
    id: pebGenerateId('action'),
    createdAt: new Date(),
    targetPageId: null,
    affectedPageIds: [],
    effects: [
      pebCreateEffect(PebShopEffect.UpdateData, null, payload),
    ],
  };
}

function pebReorderPagesAction(payload: Partial<any>): PebAction {
  return {
    id: pebGenerateId('action'),
    targetPageId: null,
    affectedPageIds: [],
    createdAt: new Date(),
    effects: [
      {
        payload,
        type: HandlerStateEffect.ReorderPages,
        target: '',
      },
    ],
  };
}
