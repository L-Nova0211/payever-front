import cloneDeep from 'lodash/cloneDeep';
import { v4 as uuid } from 'uuid';

import { PebAction, PebEffectTarget } from '../models/action';
import { PebMasterElementIdMap, PebPageId, PebShop, PebStylesheet, PebTemplate } from '../models/client';
import { PebShopRoute, PebThemeDetailInterface, PebThemePageInterface } from '../models/database';
import { PebElementId } from '../models/element';
import { pebGenerateId, pebMapElementDeep } from '../utils';


export function pebCloneShopTheme(proto: PebShop): PebShop {
  const result = cloneDeep(proto);

  const pageMappings = proto.pages.reduce(
    (acc, page) => {
      acc.set(page.id, pebGenerateId());

      return acc;
    },
    new Map<PebElementId, PebElementId>(),
  );

  const pages = result.pages.map(page => ({
    ...page,
    id: pageMappings.get(page.id),
  }));

  const routing = result.routing.map((route: PebShopRoute) => {
    const pageId = pageMappings.get(route.pageId);

    return {
      pageId,
      routeId: route.routeId,
      url: route.url,
    };
  });

  return { ...result, routing, pages };
}

export function generateUniqueIdsForPage(page: PebThemePageInterface): PebMasterElementIdMap {
  const idsMap: PebMasterElementIdMap = {};
  pebMapElementDeep(page.template, (el) => {
    idsMap[el.id] = uuid();

    return el;
  });

  return idsMap;
}

export function applyIdsMapForPage(page: PebThemePageInterface, idsMap: PebMasterElementIdMap): PebThemePageInterface {

  const template = pebMapElementDeep<PebTemplate>(
    page.template,
    el => ({ ...el, id: idsMap[el.id] ? idsMap[el.id] : el.id }),
  );

  const stylesheets = Object.entries(page.stylesheets).reduce(
    (acc: { [screen: string]: PebStylesheet }, [screen, stylesheet]) => {
      const s = Object.entries(stylesheet).reduce(
        (a, [elId, styles]) => {
          a[idsMap[elId] ?? elId] = styles;

          return a;
        },
        {},
      );
      acc[screen] = s;

      return acc;
    },
    {},
  );

  return {
    ...page,
    stylesheets,
    template,
    master: {
      ...page.master,
      idsMap,
    },
  };
}

export function extractPageActionsFromSnapshot(
  actions: PebAction[],
  snapshot: PebThemeDetailInterface,
  pageId: PebPageId,
): PebAction[] {
  const page = snapshot.pages.find(p => p.id === pageId);

  const effectTargets = [
    `${PebEffectTarget.Pages}:${page.id}`,
    `${PebEffectTarget.Templates}:${page.templateId}`,
    ...Object.values(page.stylesheetIds).map(sid =>
      `${PebEffectTarget.Stylesheets}:${sid}`,
    ),
    `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
  ];

  return actions.filter(a =>
    a.effects.find(e => effectTargets.includes(e.target)),
  );
}

