import { EditorSidebarTypes } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';

export interface SiteDTO {
  id: string;
  _id: string;
  picture: string;
  name: string;
  business: string;
  domain:SiteDomainDTO[]

  createdAt: string;
  updatedAt: string;
  channelSet: string;

  isDefault: boolean;
  __v: number;

  accessConfig?: SiteAccessConfigDTO;
}

export interface SiteAccessConfigDTO {
  isLive: boolean;
  isLocked: boolean;
  isPrivate: boolean;

  privateMessage: string;
  privatePassword: string;

  ownDomain: string;
  internalDomain: string;
  internalDomainPattern: string;
}

export interface SiteDomainDTO {
  name: string;
  _id: string;
  createdAt:string;
  isConnected: boolean;
  provider: string;
  site: string;
  updatedAt: string;
}

export interface SiteCreateDTO {
  name: string;
  picture: string;
}

export interface ViewItem {
  title: string;
  disabled: boolean;
  active: boolean;
  image?: string;
  option?: EditorSidebarTypes | ShopEditorSidebarTypes| 'preview' | string;
  options?: ViewItem[];
  payload?: any;
  lineAfter?: boolean;
}
