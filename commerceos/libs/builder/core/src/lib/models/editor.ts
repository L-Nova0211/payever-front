import { Observable } from 'rxjs';

import { PebScreen } from '../constants';

import { PebAction, PebActionId } from './action';
import {
  PebContext,
  PebContextSchema,
  PebContextSchemaId, PebElementStyles,
  PebPageData,
  PebPageId, PebPageMasterData, PebPageType, PebPageVariant,
  PebShop, PebShopData, PebShopId, PebStylesheet,
  PebStylesheetId,
  PebTemplateId,
} from './client';
import { PebShopRoute, PebThemeDetailInterface } from './database';
import { PebElementContext, PebElementDef, PebElementDefData, PebElementId } from './element';

export type PebShopThemeId = string;
export interface PebShopTheme {
  id: PebShopThemeId;
  name: string;
  description: string;
  picture: string;
  source: PebShopThemeSource;
  versions: PebShopThemeVersion[];
  published: null | PebShopThemeVersion;
  // other meta info like businessId, shopId, etc
}

export type PebShopThemeVersionId = string;
export interface PebShopThemeVersion {
  id: PebShopThemeVersionId;
  name: string;
  source: PebShopThemeSource;
  result: PebShop;
  createdAt: Date;
  published: boolean;
  tags: string[];
}

export type PebShopThemeSourceId = string;
export interface PebShopThemeSource {
  id: PebShopThemeSourceId;
  hash: string;
  actions: PebAction[];
  snapshot: PebThemeDetailInterface;
  previews: {
    [key: string/*PebPageId*/]: {
      actionId: string;
      previewUrl: string;
    };
  };
}

export interface PebShopShort {
  id: PebShopId; // shop theme id??
  data: PebShopData;
  routing: PebShopRoute[];
  contextId: PebContextSchemaId;
  pageIds: PebPageId[];
}

/** @deprecated: Replaced by PebThemeShortPageInterface */
export interface PebPageShort {
  id: PebPageId;
  name: string;
  variant: PebPageVariant;
  type: PebPageType;
  lastActionId: PebActionId;
  master: null | PebPageMasterData;
  data: PebPageData;
  templateId: PebTemplateId;
  stylesheetIds: {
    [screen in PebScreen]: PebStylesheetId;
  };
  contextId: PebContextSchemaId;
}

export enum PebShopContainer {
  Images = 'images',
  Products = 'products',
  Miscellaneous = 'miscellaneous',
  Wallpapers = 'wallpapers',
  Builder = 'builder',
  BuilderVideo = 'builder-video',
}

export interface PebElementKitDeep extends PebElementKit {
  children: PebElementKitDeep[];
  context?: PebElementContext<any>;
}

export interface PebElementKit {
  element: PebElementDef;
  styles: { [screen: string]: PebElementStyles };
  contextSchema: PebContextSchema;
  data?: { [id: string]: PebElementDefData };
  prevId?: PebElementId;
  rootContextKey?: string;
}

export interface PebElementTransformationDeep {
  definition?: PebElementDef;
  styles?: { [screen: string]: PebStylesheet };
  contextSchema?: PebContextSchema;
  context?: PebContext;
}

export interface PebAbstractTextEditorService {
  readonly canUndo$: Observable<boolean>;
  readonly canRedo$: Observable<boolean>;
}
