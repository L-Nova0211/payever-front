import { PebScreen } from '../constants';

import { PebAction, PebActionId } from './action';
import {
  PebContextSchema,
  PebContextSchemaId,
  PebPageData,
  PebPageId,
  PebPageMasterData,
  PebPageType,
  PebPageVariant,
  PebShop,
  PebShopData,
  PebShopId,
  PebStylesheet,
  PebStylesheetId,
  PebTemplate,
  PebTemplateId,
} from './client';
import { PebPageShort, PebShopThemeId, PebShopThemeSourceId, PebShopThemeVersionId } from './editor';

//
// Data structures required by editor
//
export interface PebShopThemeEntity {
  id: PebShopThemeId;
  name: string;
  picture: string;
  sourceId: PebShopThemeSourceId;
  versionsIds: PebShopThemeVersionId[];
  publishedId: null | PebShopThemeVersionId;
}

export interface PebShopThemeVersionEntity {
  id: PebShopThemeVersionId;
  name: string;
  sourceId: PebShopThemeSourceId;
  result: PebShop;
  createdAt: Date;
  isActive: boolean;
  published: boolean;
  description: string;
}


export interface PebShopThemeSourceEntityOld {
  id: PebShopThemeSourceId;
  hash: string;
  actions: PebAction[];
  snapshotId: string;
  previews: PebShopThemeSourcePagePreviews;
}

//
// Data required by shop client to actually render shop
//

export type PebShopRouteId = string;

export interface PebShopRoute {
  routeId: PebShopRouteId;
  url: string;
  pageId?: PebPageId;
  applicationId?: string;
}

export interface PebShopEntity {
  id: PebShopId;
  frontPage: PebPageId;
  routing: PebShopRoute[];
  contextId: PebContextSchemaId;
  pages: PebPageId[];
  data: PebShopData;
}

export type PebPageEntity = PebThemePageInterface;

export interface PebShopImageResponse {
  blobName: string;
  brightnessGradation: string;
  preview: string;
}

export interface PebShopGeneratedThemeResponse {
  category: string;
  page: string;
  theme: string;
  themeId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** NEW INTERFACES */
/** @deprecated: Replaced by PebThemeSnapshotInterface */
export interface PebShopThemeSnapshot {
  id: string;
  hash: string;
  shop: PebShopEntity;
  pages: {
    [pageId: string]: PebPageShort,
  };
  templates: {
    [templateId: string]: PebTemplate,
  };
  stylesheets: {
    [stylesheetId: string]: PebStylesheet,
  };
  contextSchemas: {
    [contextSchemaId: string]: PebContextSchema,
  };
  updatedAt: string;
}

export interface PebShopThemeSourcePagePreviews {
  [pageId: string]: {
    actionId: string;
    previewUrl: string;
  };
}

export interface ThemeVersionInterface {
  description: string;
  published: boolean;
  source: string;
  theme: string;
  name: string;
  createdAt: Date;
}

export enum PebThemeType {
  Template = 'template',
  Application = 'application',
}

export interface PebTheme {
  id: string;
  type: PebThemeType;
  isDefault?: boolean;
  defaultScreen?: PebScreen;
  name: string;
  picture: string;
  source: ThemeSourceInterface;
  versions: ThemeVersionInterface[];
  publishedVersion?: ThemeVersionInterface;
}

export interface ThemeSourceInterface {
  id: string;
  hash: string;
  previews: PebShopThemeSourcePagePreviews;
  snapshot: string;
}

export interface PebThemeApplicationInterface {
  id: PebShopId;
  routing: PebShopRoute[];
  data: PebShopData;
  context: PebContextSchema;
  contextId: PebContextSchemaId;
}

export interface PebThemeShortPageInterface {
  id: PebPageId;
  parentId?: PebPageId; // parent Page Id for Expand/Collapse
  duplicatedPageId?: PebPageId; // parent Page Id incase duplicate
  hash?: string;
  name: string;
  skip?: boolean;
  expand?:boolean;
  type: PebPageType;
  variant: PebPageVariant;
  master: null | PebPageMasterData;
  lastActionId?: PebActionId;
  data: PebPageData;
  templateId: PebTemplateId;
  stylesheetIds: { [screen in PebScreen]: PebStylesheetId };
  contextId: PebContextSchemaId;
  createdAt?: string;
  updatedAt?: string;
  snapshot?: string;
}
export interface PebThemeLanguageMapInterface {
  isDefault: boolean;
  locale: string;
  data: {
    [code: string]: string;
  };
}

export interface PebThemeDetailInterface {
  id: string;
  pages: PebThemeShortPageInterface[];
  // actions?: PebAction[];
  application: PebThemeApplicationInterface;
  hash: string;
  updatedAt?: string;
  languageMaps: PebThemeLanguageMapInterface[];
  lastAction: string;
  lastPublishedActionId: string;
}

export interface PebThemePageInterface extends PebThemeShortPageInterface{
  template?: PebTemplate;
  stylesheets?: { [screen: string]: PebStylesheet };
  context?: PebContextSchema;
}

// export function convertPageToSnapshotPage(page: PebThemePageInterface): PebThemeShortPageInterface {
//   return {
//     id: page.id,
//     hash: page.hash,
//     name: page.name,
//     variant: page.variant,
//     type: page.type,
//     master: page.master,
//     data: page.data,
//     snapshot: page.snapshot,
//     templateId: page.template._id,
//     stylesheets: Object.entries(page.stylesheets).reduce(
//       (acc: any, [screen, stylesheet]) => {
//         acc[screen] = stylesheet._id;
//         return acc;
//       },
//       {},
//     ),
//     context: page.context._id,
//     createdAt: page.createdAt,
//     updatedAt: page.updatedAt,
//   };
// }

// export function excludePrivateId<T>(data: PebWithPrivateIdType<T>): T {
//   const result = { ...data };
//   delete result._id;
//   return result;
// }
