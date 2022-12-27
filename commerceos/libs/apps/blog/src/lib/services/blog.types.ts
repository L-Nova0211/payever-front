import { PebAction, PebLanguage, PebThemeDetailInterface } from '@pe/builder-core';

export type Blog = {
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

  accessConfig?: BlogAccessConfig,
}

export type BlogAccessConfig = {
  isLive: boolean,
  isLocked: boolean,
  ownDomain: string,
  internalDomain: string,
  internalDomainPattern: string,
}

export type BlogCreate = {
  name: string,
  logo: string,
}

export interface PebBlogAccessConfig {
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

export interface BlogPreviewDTO {
  current: PebThemeDetailInterface;
  published: null|Blog;
}

export interface PebBlogDataLanguage {
  language: PebLanguage;
  active: boolean;
}

export type PebBlogThemeVersionId = string;
export type PebBlogThemeSourceId = string;
export type PebBlogId = string;

export interface PebShopThemeSource {
  id: PebBlogThemeSourceId;
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

export interface PebBlogThemeVersion {
  id: PebBlogThemeVersionId;
  name: string;
  source: PebShopThemeSource;
  result: Blog;
  createdAt: Date;
}


export interface BlogPreviewDTO {
  current: PebThemeDetailInterface,
  published: null | Blog,
}


export interface PebBlogThemeVersionEntity {
  id: PebBlogThemeVersionId;
  name: string;
  sourceId: PebBlogThemeSourceId;
  result: Blog;
  createdAt: Date;
  isActive: boolean;
  published: boolean;
  description: string;
}

export type CreateBlogThemeDto = any;

export interface CreateBlogThemePayload {
  name?: string;
  namePrefix?: string;
  content: Blog;
}
