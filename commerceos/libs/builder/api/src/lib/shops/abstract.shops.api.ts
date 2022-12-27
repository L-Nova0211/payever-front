import { Observable } from 'rxjs';

import { PebShop, PebThemeDetailInterface } from '@pe/builder-core';

export interface ShopPreviewDTO {
  current: PebThemeDetailInterface;
  published: null|PebShop;
}

export interface PebSingleShop {
  isDefault: boolean;
  id: string;
  name: string;
  picture: string;
  channelSet: {
    id: string;
  };
  business: {
    id: string;
    name: string;
    defaultLanguage: string;
  };
  accessConfig: PebShopAccessConfig;
  businessId: string;
}

export interface PebShopAccessConfig {
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

export abstract class PebShopsApi {
  abstract getShopsList(isDefault?: boolean): Observable<any[]>;

  abstract getSingleShop(shopId: string): Observable<PebSingleShop>;

  abstract createShop(payload: any): Observable<any>;

  abstract validateShopName(name: string): Observable<any>;

  abstract deleteShop(shopId: string): Observable<null>;

  abstract updateShop(payload: any): Observable<any>;

  abstract getDefaultShop(): Observable<any>;

  abstract markShopAsDefault(shopId: string): Observable<any>;

  abstract updateShopAccessConfig(
    shopId: string,
    payload: Partial<PebShopAccessConfig>,
  ): Observable<PebShopAccessConfig>;

  abstract getShopPreview(shopId: string, include?: string[]): Observable<ShopPreviewDTO>;

  abstract checkIsLive(shopId: string): Observable<boolean>;

  abstract patchIsLive(shopId: string, isLive: boolean): Observable<null>;

  abstract addSocialImage(accessId: string, image: string): Observable<any>;



  /* DOMAINS */

  abstract getAllDomains(shopId: string): Observable<any>;

  abstract addDomain(shopId: string, domain: string): Observable<any>;

  abstract checkDomain(shopId: string, domainId: string): Observable<any>;
  
  abstract patchDomain(shopId: string, domainId: string, domain: string): Observable<any>;

  abstract deleteDomain(shopId: string, domainId: string): Observable<any>;

  /* ------- */
}
