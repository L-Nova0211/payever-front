import { omit } from 'lodash';

import { PebScreen } from '../constants';
import {
  PebContextSchemaEffect,
  PebEffectTarget,
  PebPageEffect,
  PebShopEffect,
  PebStylesheetEffect,
  PebTemplateEffect,
} from '../models/action';
import { PebLanguage, PebPageType, PebPageVariant } from '../models/client';
import * as utils from '../utils/generate-id';

import { pebCreatePageInitEffects, pebCreateShopInitAction } from './create-shop-init-action';

describe('Actions:Create Shop', () => {

  beforeAll(() => {

    Object.defineProperty(utils, 'pebGenerateId', {
      value: utils.pebGenerateId,
      writable: true,
    });

  });

  it('should create page init effects', () => {

    const page = {
      id: 'p-001',
      type: PebPageType.Master,
      variant: PebPageVariant.Default,
      master: {
        id: 'master-001',
        lastActionId: 'a-001',
        idsMap: {},
      },
      name: 'Page 1',
      data: {
        url: 'pages/p-001',
      },
      lastActionId: 'a-001',
      template: { id: 'tpl-001' },
      stylesheets: Object.values(PebScreen).reduce((acc, screen) => {
        acc[screen] = { color: '#333333' };

        return acc;
      }, {}),
      context: { test: 'context' },
    };
    const generateIdSpy = spyOn(utils, 'pebGenerateId').and.returnValues(
      'tpl-001',
      ...Object.values(PebScreen).map(screen => `${screen.charAt(0)}-001`),
      'ctx-001',
    );

    expect(pebCreatePageInitEffects(page as any)).toEqual([
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
          templateId: 'tpl-001',
          template: page.template,
          stylesheetIds: Object.values(PebScreen).reduce((acc, screen) => {
            acc[screen] = `${screen.charAt(0)}-001`;

            return acc;
          }, {}),
          stylesheets: {
            [PebScreen.Desktop]: page.stylesheets[PebScreen.Desktop],
            [PebScreen.Tablet]: page.stylesheets[PebScreen.Tablet],
            [PebScreen.Mobile]: page.stylesheets[PebScreen.Mobile],
          },
          contextId: 'ctx-001',
          context: page.context,
        },
      },
      {
        type: PebTemplateEffect.Init,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: page.template,
      },
      ...Object.values(PebScreen).map(screen => ({
        type: PebStylesheetEffect.Init,
        target: `${PebEffectTarget.Stylesheets}:${screen.charAt(0)}-001`,
        payload: page.stylesheets[screen],
      })),
      {
        type: PebContextSchemaEffect.Init,
        target: `${PebEffectTarget.ContextSchemas}:ctx-001`,
        payload: page.context,
      },
    ]);
    expect(generateIdSpy.calls.allArgs()).toEqual([
      ['template'],
      ...Array(3).fill(['stylesheet']),
      ['context'],
    ]);

  });

  it('should create shop init action', () => {

    const page = {
      id: 'p-001',
      type: PebPageType.Master,
      variant: PebPageVariant.Default,
      master: {
        id: 'master-001',
        lastActionId: 'a-001',
        idsMap: {},
      },
      name: 'Page 1',
      data: {
        url: 'pages/p-001',
      },
      lastActionId: 'a-001',
      template: { id: 'tpl-001' },
      stylesheets: Object.values(PebScreen).reduce((acc, screen) => {
        acc[screen] = { color: '#333333' };

        return acc;
      }, {}),
      context: { test: 'context' },
    };
    const shop = {
      id: 'shop-001',
      pages: [page],
      data: {
        defaultLanguage: PebLanguage.English,
      },
      routing: [{
        routeId: 'r-001',
        pageId: 'p-001',
        url: 'pages/p-001',
      }],
      context: {
        test: 'shop.context',
      },
    };
    const generateIdSpy = spyOn(utils, 'pebGenerateId').and.returnValues(
      'tpl-001',
      ...Object.values(PebScreen).map(screen => `${screen.charAt(0)}-001`),
      'ctx-001',
      'ctx-shop-001',
      'gid-a-001',
    );

    /**
     * page.variant is PebPageVariant.Default
     */
    let action = pebCreateShopInitAction(shop as any);
    expect(omit(action, 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: [
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
            templateId: 'tpl-001',
            template: page.template,
            stylesheetIds: Object.values(PebScreen).reduce((acc, screen) => {
              acc[screen] = `${screen.charAt(0)}-001`;

              return acc;
            }, {}),
            stylesheets: {
              [PebScreen.Desktop]: page.stylesheets[PebScreen.Desktop],
              [PebScreen.Tablet]: page.stylesheets[PebScreen.Tablet],
              [PebScreen.Mobile]: page.stylesheets[PebScreen.Mobile],
            },
            contextId: 'ctx-001',
            context: page.context,
          },
        },
        {
          type: PebTemplateEffect.Init,
          target: `${PebEffectTarget.Templates}:tpl-001`,
          payload: page.template,
        },
        ...Object.values(PebScreen).map(screen => ({
          type: PebStylesheetEffect.Init,
          target: `${PebEffectTarget.Stylesheets}:${screen.charAt(0)}-001`,
          payload: page.stylesheets[screen],
        })),
        {
          type: PebContextSchemaEffect.Init,
          target: `${PebEffectTarget.ContextSchemas}:ctx-001`,
          payload: page.context,
        },
        {
          type: PebContextSchemaEffect.Init,
          target: `${PebEffectTarget.ContextSchemas}:ctx-shop-001`,
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
              contextId: 'ctx-shop-001',
              context: shop.context,
            },
            pages: shop.pages,
          },
        },
      ],
    });
    expect(action.createdAt).toBeInstanceOf(Date);
    expect(generateIdSpy.calls.allArgs()).toEqual([
      ['template'],
      ...Array(3).fill(['stylesheet']),
      ...Array(2).fill(['context']),
      ['action'],
    ]);

    /**
     * page.variant is PebPageVariant.Front
     */
    page.id = 'p-002';
    page.variant = PebPageVariant.Front;
    generateIdSpy.and.returnValues(
      'tpl-001',
      ...Object.values(PebScreen).map(screen => `${screen.charAt(0)}-001`),
      'ctx-001',
      'ctx-shop-001',
      'gid-a-001',
    );

    action = pebCreateShopInitAction(shop as any);
    expect(omit(action, 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: [
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
            templateId: 'tpl-001',
            template: page.template,
            stylesheetIds: Object.values(PebScreen).reduce((acc, screen) => {
              acc[screen] = `${screen.charAt(0)}-001`;

              return acc;
            }, {}),
            stylesheets: {
              [PebScreen.Desktop]: page.stylesheets[PebScreen.Desktop],
              [PebScreen.Tablet]: page.stylesheets[PebScreen.Tablet],
              [PebScreen.Mobile]: page.stylesheets[PebScreen.Mobile],
            },
            contextId: 'ctx-001',
            context: page.context,
          },
        },
        {
          type: PebTemplateEffect.Init,
          target: `${PebEffectTarget.Templates}:tpl-001`,
          payload: page.template,
        },
        ...Object.values(PebScreen).map(screen => ({
          type: PebStylesheetEffect.Init,
          target: `${PebEffectTarget.Stylesheets}:${screen.charAt(0)}-001`,
          payload: page.stylesheets[screen],
        })),
        {
          type: PebContextSchemaEffect.Init,
          target: `${PebEffectTarget.ContextSchemas}:ctx-001`,
          payload: page.context,
        },
        {
          type: PebContextSchemaEffect.Init,
          target: `${PebEffectTarget.ContextSchemas}:ctx-shop-001`,
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
              contextId: 'ctx-shop-001',
              context: shop.context,
            },
            pages: shop.pages,
          },
        },
      ],
    });

  });

});
