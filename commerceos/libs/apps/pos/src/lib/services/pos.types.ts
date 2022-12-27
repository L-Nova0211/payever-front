import { PebAction, PebLanguage, PebThemeDetailInterface } from '@pe/builder-core';

export type Pos = {
  _id: string,
  logo: string,
  name: string,
  business: string,

  createdAt: string,
  updatedAt: string,
  channelSet: string,

  default: boolean,
  defaultLocale: string,
  __v: number,

  accessConfig?: PosAccessConfig,
};

export type PosAccessConfig = {
  isLive: boolean,
  isLocked: boolean,
  ownDomain: string,
  internalDomain: string,
  internalDomainPattern: string,
};

export type PosCreate = {
  name: string,
  logo: string,
};

export interface PebPosAccessConfig {
  isLive: boolean;
  isPrivate: boolean;
  isLocked: boolean;
  id: string;
  internalDomain: string;
  internalDomainPattern: string;
  ownDomain: string;
  createdAt: string;
  privateMessage: string;
}

export interface PosPreviewDTO {
  current: PebThemeDetailInterface;
  published: null | Pos;
  publishStatus: { applicationSynced: boolean, clientSynced: boolean };
}

export interface PebPosDataLanguage {
  language: PebLanguage;
  active: boolean;
}

export type PebPosThemeVersionId = string;
export type PebPosThemeSourceId = string;
export type PebPosId = string;

export interface PebPosThemeSource {
  id: PebPosThemeSourceId;
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

export interface PebPosThemeVersion {
  id: PebPosThemeVersionId;
  name: string;
  source: PebPosThemeSource;
  result: Pos;
  createdAt: Date;
}


export interface PosPreviewDTO {
  current: PebThemeDetailInterface;
  published: null | Pos;
}


export interface PebPosThemeVersionEntity {
  id: PebPosThemeVersionId;
  name: string;
  sourceId: PebPosThemeSourceId;
  result: Pos;
  createdAt: Date;
  isActive: boolean;
  published: boolean;
  description: string;
}

export type CreatePosThemeDto = any;

export interface CreatePosThemePayload {
  name?: string;
  namePrefix?: string;
  content: Pos;
}


export enum IntegrationCategory {
  Communications = 'communications',
}

export interface IntegrationInfoInterface {
  _id: string;
  installed: boolean;
  integration: {
    name: string;
    category: IntegrationCategory;
    displayOptions: {
      icon: string;
      title: string;
      order?: number;
    };
  };
}
export interface IntegrationConnectInfoInterface {
  _id: string;
  name: string;
  enabled: boolean;
  category: IntegrationCategory;
  timesInstalled: number;
  ratingsPerRate: [];
  ratingsCount: number;
  avgRating: number;
  extension?: {
    formAction: {
      endpoint: string;
      method: string;
    };
    url: string;
  };
}


export enum CustomChannelTypeEnum {
  DirectLink = 'direct_link',
  TextLink = 'textLink',
  Button = 'button',
  Calculator = 'calculator',
  Bubble = 'bubble',
  Shop = 'shop',
  Marketing = 'marketing',
  Pos = 'pos',
  QR = 'qr',
}

export interface IntegrationInfoInterface {
  _id: string;
  installed: boolean;
  enabled: boolean;
  integration: {
    name: string,
    category: IntegrationCategory,
    displayOptions: {
      icon: string,
      title: string,
      order?: number,
    },
  };
}


export interface TerminalInterface {
  _id?: string;
  channelSet?: string;
  business?: string;
  theme?: string;
  checkout?: string;
  name?: string;
  logo?: string;
  currency?: string;
  active?: boolean;
  phoneNumber?: string;
  message?: string;
  locales?: string[];
  defaultLocale?: string;
}
