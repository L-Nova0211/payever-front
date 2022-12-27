import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebShopThemeEntity } from '@pe/builder-core';

export interface SitePreviewDTO {
  current: any,
  published: null | any,
}

@Injectable()
export abstract class AbstractSiteBuilderApi {

  abstract getSitePreview(siteId: string, include?: string, page?: string): Observable<SitePreviewDTO>

  abstract getSiteActiveTheme(siteId: string): Observable<any>;

  abstract getThemesList(siteId: string): Observable<any>;

  abstract getThemeById(siteId: string, themeId: string): Observable<any>;

  abstract getTemplateThemes(): Observable<any>;

  abstract duplicateTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity>;

  abstract deleteTemplateTheme(siteId: string, themeId: string): Observable<void>;

  abstract instantInstallTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity>;

  abstract installTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity>;
  abstract createTemplateTheme(themeId:string, body:any): Observable<any>;
  abstract updateThemeVersion(themeId:string, versionId:string,body:any): Observable<any>;

}
