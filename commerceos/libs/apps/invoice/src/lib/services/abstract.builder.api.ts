import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebShopThemeEntity } from '@pe/builder-core';

@Injectable()
export abstract class AbstractInvoiceBuilderApi {

  abstract getInvoicePreview(siteId: string, include?: string): Observable<any>;

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
