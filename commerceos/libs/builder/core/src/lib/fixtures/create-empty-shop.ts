import { merge } from 'lodash';

import { PebScreen } from '../constants';
import { migrations } from '../migrations/migrations';
import { PebElementStyles, PebLanguage, PebPageType, PebPageVariant, PebShop, PebTemplate } from '../models/client';
import { PebThemePageInterface } from '../models/database';
import { PebElementDef, PebElementType, PebSectionType } from '../models/element';
import { pebGenerateId } from '../utils/generate-id';

export const pebCreateEmptySections = (): { styles: PebElementStyles, elements: PebElementDef[] } => {
  const lastMigrationVersion = Number(Object.keys(migrations).slice(-1));
  const elements = Object.values(PebSectionType).map(sectionName => ({
    id: pebGenerateId('element'),
    type: PebElementType.Section,
    data: { name: sectionName, version: lastMigrationVersion },
    meta: { deletable: false },
    children: [],
  }));
  const [headerId, bodyId, footerId] = elements.map(el => el.id);
  const styles = Object.values(PebScreen).reduce(
    (acc, s) => {
      acc[s] = {
        [headerId]: { height: 200 },
        [bodyId]: { height: 600 },
        [footerId]: { height: 200 },
      };

      return acc;
    },
    {},
  );

  return { elements, styles };
};

export const pebCreateEmptyPage = (
  name,
  variant: PebPageVariant = PebPageVariant.Default,
  type: PebPageType = PebPageType.Replica,
): PebThemePageInterface => {
  const templateId = pebGenerateId('template');
  const { elements, styles } = pebCreateEmptySections();

  const template: PebTemplate = {
    children: elements,
    id: pebGenerateId('element'),
    type: PebElementType.Document,
  };

  return  {
    name,
    type,
    variant,
    templateId,
    template,
    skip: false,
    id: pebGenerateId('page'),
    master: null,
    data: {},
    stylesheetIds: {
      [PebScreen.Desktop]: pebGenerateId('stylesheet'),
      [PebScreen.Tablet]: pebGenerateId('stylesheet'),
      [PebScreen.Mobile]: pebGenerateId('stylesheet'),
    },
    stylesheets: merge({
      [PebScreen.Desktop]: {
        [template.id]: { backgroundColor: '#ffffff' },
      },
      [PebScreen.Tablet]: {
        [template.id]: { backgroundColor: '#ffffff' },
      },
      [PebScreen.Mobile]: {
        [template.id]: { backgroundColor: '#ffffff' },
      },
    }, styles as any),
    contextId: pebGenerateId('context'),
    context: {},
  };
};

export const getPageUrlByName = (pageName: string, pageVariant?: PebPageVariant): string => {
  if (pageVariant === PebPageVariant.Front) {
    return '/';
  }

  return `/${pageName.toLowerCase().replace(/\s/g, '-').replace(/[()]/g, '')}-${Math.random().toString(36).substring(7)}`;
};

export function pebCreateEmptyShop(): PebShop {
  const frontPage = pebCreateEmptyPage('Front', PebPageVariant.Front);
  // const productsPage = pebCreateEmptyPage('Product', PebPageVariant.Product);
  // const categoriesPage = pebCreateEmptyPage('Category', PebPageVariant.Category);

  return {
    id: pebGenerateId(),
    data: {
      productPages: '/products/:productId',
      categoryPages: '/categories/:categoryId',
      languages: [
        { language: PebLanguage.English, active: true },
      ],
      defaultLanguage: PebLanguage.English,
    },
    routing: [
      {
        routeId: pebGenerateId(),
        pageId: frontPage.id,
        url: '/',
      },
    ],
    context: {},
    pages: [frontPage/*, productsPage, categoriesPage*/],
  };
}
