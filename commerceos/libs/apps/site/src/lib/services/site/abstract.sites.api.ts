import { Observable } from 'rxjs';

import { SiteCreateDTO, SiteDTO } from '../../site.interface';

export abstract class PebSitesApi {

  abstract getSiteList(isDefault?: boolean): Observable<SiteDTO[]>;
  abstract getSingleSite(siteId: string): Observable<SiteDTO>;
  abstract createSite(payload: any): Observable<SiteDTO>;
  abstract deleteSite(siteId: string): Observable<null>;
  abstract validateSiteName(name: string): Observable<any>;
  abstract updateSite(siteId: string, payload: any): Observable<SiteCreateDTO>;
  abstract markSiteAsDefault(siteId: string): Observable<SiteDTO>;
  abstract addDomain(siteId: string, domain: string): Observable<any>;
  abstract checkDomain(siteId: string, domainId: string): Observable<any>;
  abstract patchDomain(siteId: string, domainId: string, domain: string): Observable<any>;
  abstract deleteDomain(SiteId: string, domainId: string): Observable<any>;

  abstract createSiteThemeVersion(themeId: string, name?: string): Observable<any>;
  abstract deleteSiteThemeVersion(themeId: string, versionId: string): Observable<any>;
  abstract activateSiteThemeVersion(siteId: any, versionId: string): Observable<any>;
  abstract publishSiteThemeVersion(themeId: string, versionId: string): Observable<any>;
  abstract getCurrentSitePreview(siteId: string, currentDetail?: boolean, diff?: boolean): Observable<any>;

  abstract updateSiteDeploy(siteId: string, payload: any): Observable<SiteDTO>;

  abstract getAllDomains(siteId: string): Observable<any>
  abstract createDomain(siteId: string, body: any): Observable<any>
  abstract updateDomain(siteId: string, domainId, body: any): Observable<any>
  abstract removeDomain(siteId: string, domainId): Observable<any>
  abstract patchIsLive(siteId: string, isLive: boolean): Observable<null>
  abstract addSocialImage(siteId: string, image: string): Observable<any>;
  abstract updateSiteAccessConfig(siteId: string, payload: Partial<any>): Observable<any>;



  // abstract getDefaultShop(): Observable<any>;
  // abstract getShopPreview(shopId: string, include?: string[]): Observable<ShopPreviewDTO>;
  // abstract checkIsLive(shopId: string): Observable<boolean>;
  // abstract patchIsLive(shopId: string, isLive: boolean): Observable<null>;
  // abstract getAllDomains(shopId: string): Observable<any>;



}
