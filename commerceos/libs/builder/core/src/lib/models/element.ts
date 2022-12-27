import Delta from 'quill-delta';

import { PebScreen } from '../constants';
import { PebInteractionType, PebInteractionWithPayload } from '../utils';

import {
  PebIntegration,
  PebIntegrationAction,
  PebIntegrationData,
  PebIntegrationInteraction,
  PebIntegrationSelectLink,
} from './api';
import { PebElementStyles, PebLanguage, PebPageVariant } from './client';
import { PebMotion } from './motion';

export type PebElementId = string;

export enum PebElementType {
  Document = 'document',
  Section = 'section',
  Text = 'text',
  Shape = 'shape',
  Grid = 'grid',
}

export interface PebElementDef {
  id: PebElementId;
  type: PebElementType;
  children?: PebElementDef[] | null;
  data?: PebElementDefData;
  meta?: PebElementDefMeta;
  motion?: PebMotion;
  parent?: {
    id: PebElementId,
    type: PebElementType,
  };
  index?: number;
}

/** @description use PebInteraction instead */
export interface PebLink {
  type: PebInteractionType;
  value: string;
  variant?: PebPageVariant;
  title?: string | { [key: string]: string };
  newTab?: boolean;
}

export type PebLanguageByScreen<T> = {
  [screen in PebScreen]?: { [language in PebLanguage]?: T }
};

export type PebTextContent = PebLanguageByScreen<Delta>;

export interface PebElementDefData {
  textAutosize?: { height: boolean, width: boolean };
  text?: PebTextContent;
  routes?: PebLink[];
  functionLink?: PebFunctionLink;
  childrenStyles?: PebElementStyles;
  linkInteraction?: PebInteractionWithPayload;
  groupId?: string[];
  version?: number;
  colCount?: number;
  rowCount?: number;
  name?: string;
  [others: string]: any;
}

export interface PebIntegrationCommon {
  id: string;
  title: string;
  integration: PebIntegration;
  functionType: PebFunctionType;
  linkAttributes?: any;
}

export interface PebIntegrationForm {
  integration: PebIntegration;
  action: PebIntegrationAction;
  data: PebIntegrationData;
  interaction: PebIntegrationInteraction;
}

export enum PebFunctionType {
  Action = 'action',
  ActionData = 'action-data',
  Data = 'data',
  Interaction = 'interaction',
  SelectLink = 'select-link',
}

export function isIntegrationAction(fn: PebFunctionLink): fn is PebIntegrationAction {
  return fn?.functionType === PebFunctionType.Action;
}
export function isIntegrationData(fn: PebFunctionLink): fn is PebIntegrationData {
  return fn?.functionType === PebFunctionType.Data;
}
export function isIntegrationInteraction(fn: PebFunctionLink): fn is PebIntegrationInteraction {
  return fn?.functionType === PebFunctionType.Interaction;
}
export function isIntegrationSelectLink(fn: PebFunctionLink): fn is PebIntegrationSelectLink {
  return fn?.functionType === PebFunctionType.SelectLink;
}

export function isImageContext(fn: PebIntegrationData): boolean {
  return fn?.property === 'imagesUrl.0';
}

export type PebFunctionLink =
  PebIntegrationAction |
  PebIntegrationData |
  PebIntegrationInteraction |
  PebIntegrationSelectLink;

export interface PebElementDefMeta {
  deletable: boolean;
  still?: boolean;
  scalable?: boolean;
  borderRadiusDisabled?: boolean;
}

export interface PebElementWithParent extends PebElementDef {
  priority: number;
  parentId: string | null;
}

export enum PebSectionType {
  Header = 'header',
  Body = 'body',
  Footer = 'footer',
}

export enum PebElementContextState {
  Loading = 'loading',
  Error = 'error',
  Ready = 'ready',
  Empty = 'empty',
}

export interface PebElementContext<T> {
  state: PebElementContextState;
  data?: T;
}

export enum PebElementSocialIconType {
  Instagram = 'instagram',
  Facebook = 'facebook',
  Youtube = 'youtube',
  LinkedIn = 'linkedin',
  Google = 'google',
  Twitter = 'twitter',
  Telegram = 'telegram',
  Messenger = 'messenger',
  Pinterest = 'pinterest',
  Dribble = 'dribble',
  TikTok = 'tiktok',
  WhatsApp = 'whatsapp',
  Mail = 'mail',
}

