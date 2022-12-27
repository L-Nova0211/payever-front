import { PebScreen } from '../constants';
import {
  PebAction,
  PebContextSchemaEffect,
  PebEffect,
  PebEffectTarget,
  PebPageEffect,
  PebShopEffect,
  PebStylesheetEffect,
  PebTemplateEffect,
} from '../models/action';
import { PebPageVariant, PebShop } from '../models/client';
import { PebThemePageInterface } from '../models/database';
import { pebGenerateId } from '../utils/generate-id';


export const pebCreatePageInitEffects = (page: PebThemePageInterface): PebEffect[] => {
  const pageTemplateId = pebGenerateId('template');
  const stylesIds = {
    [PebScreen.Desktop]: pebGenerateId('stylesheet'),
    [PebScreen.Tablet]: pebGenerateId('stylesheet'),
    [PebScreen.Mobile]: pebGenerateId('stylesheet'),
  };
  const pageContextId = pebGenerateId('context');

  return [
    {
      type: PebPageEffect.Create,
      target: `${PebEffectTarget.Pages}:${page.id}`,
      payload: {
        id: page.id,
        type: page.type,
        variant: page.variant,
        master: page.master,
        name: page.name,
        data: page.data,
        lastActionId: page.lastActionId,
        templateId: pageTemplateId,
        template: page.template,
        stylesheetIds: stylesIds,
        stylesheets: {
          [PebScreen.Desktop]: page.stylesheets[PebScreen.Desktop],
          [PebScreen.Tablet]: page.stylesheets[PebScreen.Tablet],
          [PebScreen.Mobile]: page.stylesheets[PebScreen.Mobile],
        },
        contextId: pageContextId,
        context: page.context,
      },
    },
    {
      type: PebTemplateEffect.Init,
      target: `${PebEffectTarget.Templates}:${pageTemplateId}`,
      payload: {
        ...page.template,
      },
    },
    ...Object.values(PebScreen).map(screen => ({
      type: PebStylesheetEffect.Init,
      target: `${PebEffectTarget.Stylesheets}:${stylesIds[screen]}`,
      payload: {
        ...page.stylesheets[screen],
      },
    })),
    {
      type: PebContextSchemaEffect.Init,
      target: `${PebEffectTarget.ContextSchemas}:${pageContextId}`,
      payload: {
        ...page.context,
      },
    },
  ];
};

export const pebCreateShopInitAction = (shop: PebShop): PebAction => {
  const pageEffects = shop.pages.reduce(
    (acc: PebEffect[], page) => [...acc, ...pebCreatePageInitEffects(page)],
    [],
  );

  const shopContextId = pebGenerateId('context');

  return {
    id: pebGenerateId('action'),
    createdAt: new Date(),
    targetPageId: shop.pages.find(page => page.variant === PebPageVariant.Front)?.id ?? shop.pages[0].id,
    affectedPageIds: shop.pages.map(page => page.id),
    effects: [
      ...pageEffects,
      {
        type: PebContextSchemaEffect.Init,
        target: `${PebEffectTarget.ContextSchemas}:${shopContextId}`,
        payload: shop.context,
      },
      {
        type: PebShopEffect.Init,
        target: PebEffectTarget.Shop,
        payload: {
          application: {
            id: shop.id,
            data: shop.data,
            routing: shop.routing,
            contextId: shopContextId,
            context: shop.context,
          },
          pages: shop.pages,
        },
      },
    ],
  };
};
