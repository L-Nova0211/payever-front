import { Observable } from 'rxjs';

import { PebScreen, PebScriptTrigger, PebTextVerticalAlign } from '../constants';
import { PebFontFamily } from '../fonts';

import { PebActionId } from './action';
import { PebShopRoute, PebThemeDetailInterface, PebThemePageInterface } from './database';
import { PebElementDef, PebElementType, PebLanguageByScreen } from './element';

export type PebTemplateId = string;
export interface PebTemplate extends PebElementDef {
  type: PebElementType.Document;
}

export type PebStylesheetId = string;

export interface PebStylesheet {
  [selector: string]: PebElementStyles;
}

// TODO: correct styles interface, please don't add universal types here like [key: string]: string | number
export interface PebElementStyles {
  mediaType?: any;
  content?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  borderStyle?: string;
  borderColor?: string;
  opacity?: number;
  backgroundSize?: string | number;
  backgroundRepeat?: string;
  backgroundPosition?: string;
  transform?: string;

  backgroundImageMimeType?: string;
  backgroundImageWidth?: number;
  backgroundImageHeight?: number;

  imageBackgroundColor?: string;
  imageOpacity?: string;

  display?: string;
  width?: any;
  height?: any;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  margin?: string;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  padding?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  zIndex?: number;
  position?: string;
  overflow?: string;
  visibility?: string;

  scaleY?: number;
  scaleX?: number;

  iconColor?: string;

  background?: string;
  backgrounds?: string;
  objectFit?: string;

  /** @deprecated */
  fontSize?: string | number;
  /** @deprecated */
  fontWeight?: string | number;
  /** @deprecated */
  fontStyle?: string;
  /** @deprecated */
  fontFamily?: string;

  lineHeight?: number;
  whiteSpace?: string;
  textOverflow?: string;

  /** @deprecated */
  textAlign?: PebTextVerticalAlign | string;

  /** Text Vertical Alignment */
  verticalAlign?: PebTextVerticalAlign;

  /** @deprecated */
  textDecoration?: string;

  rotate?: any;

  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  alignSelf?: string;

  buttonTextDecoration?: string;
  buttonFontSize?: number;
  buttonFontStyle?: string;
  buttonFontWeight?: string;
  buttonColor?: string;
  buttonBackgroundColor?: string;
  buttonFontFamily?: string;

  mobileButtonHeight?: number;

  categoryTitleTextDecoration?: string;
  categoryTitleFontWeight?: string;
  categoryTitleColor?: string;
  categoryHeaderDisplay?: string;
  categoryTitleFontSize?: string;
  categoryTitleFontFamily?: string;
  categoryTitleFontStyle?: string;

  catalogTitleColor?: string;
  catalogTitleFontSize?: string;
  catalogTitleFontFamily?: string;
  catalogTitleFontStyle?: string;
  catalogTitleFontWeight?: string;
  catalogTitleTextDecoration?: string;

  badgeBorderWidth?: number;
  badgeBorderStyle?: string;
  badgeBackground?: string;
  badgeColor?: string;

  tonBackgroundColor?: string;

  filterFontFamily?: string;
  filterFontStyle?: string;
  filterFontSize?: string;
  filterColor?: string;
  filterFontWeight?: string;
  filterTextDecoration?: string;

  titleColor?: string;
  titleFontSize?: string;
  titleFontStyle?: string;
  titleFontWeight?: string;
  titleFontFamily?: string;
  titleTextDecoration?: string;

  priceFontSize?: string;
  priceFontFamily?: string;
  priceFontWeight?: string;
  priceTextDecoration?: string;
  priceColor?: string;
  priceFontStyle?: string;

  border?: string;

  borderTop?: string;
  borderTopColor?: string;
  borderTopStyle?: string;
  borderTopWidth?: number;

  borderBottom?: string;
  borderBottomColor?: string;
  borderBottomStyle?: string;
  borderBottomWidth?: number;

  borderLeft?: string;
  borderLeftColor?: string;
  borderLeftStyle?: string;
  borderLeftWidth?: number;

  borderRight?: string;
  borderRightColor?: string;
  borderRightStyle?: string;
  borderRightWidth?: number;

  borderWidth?: string | number;
  borderRadius?: string | number;
  borderSize?: string;
  borderType?: string;
  borderOffset?: string;
  stroke?: string;
  strokeWidth?: string | number;
  filter?: string;
  strokeDasharray?: string;
  stroking?: any;

  imageCorners?: string;
  imageExposure?: string;
  imageSaturation?: string;
  imageFilter?: string;

  mode?: string;
  slot?: string;
  some?: string;

  gridArea?: string;
  gridTemplateColumns?: number[];
  gridTemplateRows?: number[];
  gridGap?: string | number;
  gridColumn?: string;
  gridRow?: string;
  columns?: string;
  color?: string;

  flexDirection?: string;
  flexWrap?: string;

  productTemplateColumns?: number;
  productTemplateRows?: number;

  itemWidth?: number;
  itemHeight?: number;

  shadow?: string;
  shadowing?: any;
  boxShadow?: string;
  dropShadow?: string;
  shadowOffset?: any;
  shadowAngle?: any;
  shadowOpacity?: any;
  shadowColor?: string;
  shadowFormColor?: string;
  shadowBlur?: number;

  rowGap?: number;
  columnGap?: number;

  childrenStyles?: { [childId: string]: PebElementStyles };

  /** animation */
  animationName?: string;
  animationDuration?: number;
  animationDelay?: number;

  order?: number;
}

export type PebContextSchemaId = string;

export interface PebContextSchema {
  [key: string]: any;
}

export interface PebContext {
  [selector: string]: any;
}

export enum PebPageType {
  Master = 'master',
  Replica = 'replica',
}

export enum PebPageVariant {
  Front = 'front',
  Default = 'default',
  Category = 'category',
  Product = 'product',
  NotFound = '404',
  Login = 'login',
  Password = 'password',
}

export interface PebPageMasterData {
  id: PebPageId;
  lastActionId: PebActionId;
  idsMap: PebMasterElementIdMap;
}

/** We need it to know to which element we should apply master changes */
export type PebMasterElementIdMap = {
  [key: string /** PebPageType.Master id */]: string /** PebPageType.Replica id */;
};

export enum PebRestrictType {
  All = 'all',
  Groups = 'groups',
  Customers = 'customers',
  Password = 'password',
}

export interface PebRestrictAccess {
  type: PebRestrictType | string;
  customers?: string[];
  groups?: string[];
  password?: string;
}

export interface PebApplicationLink {
  application: string;
  url: string;
  type?: string;
}

export interface PebPageData {
  url?: string;
  mark?: string;
  preview?: { [screen in PebScreen]: string };
  seo?: PebPageSeo;
  scripts?: PebScript[];
  fonts?: PebLanguageByScreen<PebFontFamily[]>;
  links?: { [url: string]: PebApplicationLink };
  restrictAccess?: PebRestrictAccess;
}

export interface PebPageSeo {
  description: string;
  showInSearchResults: boolean;
  canonicalUrl: string;
  markupData: string;
  customMetaTags: string;
}

export type PebPageId = string;
/** @deprecated: Replaced by PebThemePageInterface */
export interface PebPage {
  id: PebPageId;
  name: string;
  variant: PebPageVariant;
  type: PebPageType;
  lastActionId: PebActionId;
  master: null | PebPageMasterData;
  data: PebPageData;
  template: PebTemplate;
  stylesheets: {
    [screen: string]: PebStylesheet;
  };
  context: PebContextSchema;
}

export interface PebShopDataLanguage {
  language: PebLanguage;
  active: boolean;
}

export interface PebScript {
  id: string;
  name: string;
  content: string;
  enabled: boolean;
  triggerPoint: PebScriptTrigger | string;
}

export type PebShopId = string;
export interface PebShopData {
  productPages: string; // pattern like "/products/:productId"
  categoryPages: string; // pattern like "/categories/:categoryId"
  languages: PebShopDataLanguage[];
  defaultLanguage: PebLanguage;
  scripts?: PebScript[];
  snackbars?: {
    [action: string]: {
      [id: string]: {
        element: PebElementDef,
        stylesheet: PebStylesheet,
        context?: PebContextSchema,
        screen: PebScreen,
      },
    },
  };
  [key: string]: any;
}
export interface PebShop {
  id: PebShopId;
  data: PebShopData;
  routing: PebShopRoute[];
  context: PebContextSchema;
  pages: PebThemePageInterface[];
}

// TODO: move to a more suitable location
export enum ContextService {
  Company = 'company',
  Products = 'products',
  Integrations = 'integrations',
}

// TODO: move to a more suitable location
export const CONTEXT_SERVICES = {
  [ContextService.Company]: 'ContextServices.Company',
  [ContextService.Products]: 'ContextServices.Products',
  [ContextService.Integrations]: 'ContextServices.Integrations',
};

export enum PebLanguage {
  Generic = 'generic',
  English = 'english',
  German = 'german',
  Italian = 'italian',
  Spanish = 'spanish',
  Chinese = 'chinese',
}

export interface PebLanguageData {
  locale: PebLanguage;
  name: string;
  shortName: string;
  roundIcon?: string;
  icon?: string;
}

export const PebLanguagesData: { [key: string]: PebLanguageData } = {
  [PebLanguage.English]: {
    locale: PebLanguage.English,
    name: 'english (United States)',
    shortName: 'en',
    roundIcon: 'round-language-english',
  },
  [PebLanguage.German]: {
    locale: PebLanguage.German,
    name: 'german',
    shortName: 'de',
    roundIcon: 'round-language-german',
  },
  [PebLanguage.Italian]: {
    locale: PebLanguage.Italian,
    name: 'italian',
    shortName: 'it',
    roundIcon: 'round-language-italian',
  },
  [PebLanguage.Spanish]: {
    locale: PebLanguage.Spanish,
    name: 'spanish',
    shortName: 'es',
    roundIcon: 'round-language-spanish',
  },
  [PebLanguage.Chinese]: {
    locale: PebLanguage.Chinese,
    name: 'chinese',
    shortName: 'ch',
    roundIcon: 'round-language-chinese',
  },
};

export interface PebThemeStateInterface {
  /**
   * @description Last actual state
   */
  snapshot: PebThemeDetailInterface;
  /**
   * @description New pages state
   */
  pages: { [id: string]: PebThemePageInterface };
}

export type PebContextFetcher<T = any> = (params?: { [argNum: number]: any }) => Observable<T>;
