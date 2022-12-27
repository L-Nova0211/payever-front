import { PebElementStyles, PebPageId } from './client';
import { PebElementId } from './element';

export type PebActionId = string;

export interface PebAction {
  id: PebActionId;
  name?: string;
  effects: PebEffect[];
  targetPageId: PebPageId|null;
  affectedPageIds: PebPageId[];
  createdAt: Date;
  background?: boolean;
}

export type PebEffectType = PebShopEffect
  | PebPageEffect
  | PebTemplateEffect
  | HandlerStateEffect
  | PebStylesheetEffect
  | PebContextSchemaEffect;

export interface PebEffect<T = PebEffectType> {
  type: T;
  target: string; // format: entityType:entityId
  payload: any;
}

export enum PebEffectTarget {
  Shop = 'shop',
  Pages = 'pages',
  Templates = 'templates',
  Stylesheets = 'stylesheets',
  ContextSchemas = 'contextSchemas',
}

export enum PebShopEffect {
  Init = 'shop:init',
  UpdateData = 'shop:update-data',
  /** @deprecated use PatchRouting instead */
  UpdateRouting = 'shop:update-routing',
  PatchRouting = 'shop:patch-routing',
  DeleteRoutes = 'shop:delete-routes',
  UpdatePages = 'shop:update-pages',
  AppendPage = 'shop:append-page',
}

export enum PebPageEffect {
  Create = 'page:init',
  Patch = 'page:patch',
  Update = 'page:update',
}

export enum PebTemplateEffect {
  Init              = 'template:init',
  Destroy           = 'template:destroy',
  AppendElement     = 'template:append-element',
  UpdateElement     = 'template:update-element',
  PatchElement      = 'template:patch-element',
  RelocateElement   = 'template:relocate-element',
  DeleteElement     = 'template:delete-element',
}

export enum HandlerStateEffect {
  ReorderPages      = 'state:reorder-pages',
  DeletePage        = 'state:delete-page',

  LanguageAdd       = 'state:language:add',
  LanguageRemove    = 'state:language:remove',
  LanguageMerge     = 'state:language:merge',
  LanguageSetDefault = 'state:language:set-default',
}

export enum PebStylesheetEffect {
  Init = 'stylesheet:init',
  Update = 'stylesheet:update',
  Replace = 'stylesheet:replace',
  Delete = 'stylesheet:delete',
  Destroy = 'stylesheet:destroy',
}

export enum PebContextSchemaEffect {
  Init = 'context-schema:init',
  Update = 'context-schema:update',
  Delete = 'context-schema:delete',
  Destroy = 'context-schema:destroy',
}

export interface PebStylesReplacePayload {
  selector: PebElementId;
  styles: PebElementStyles;
}
