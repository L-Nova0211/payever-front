import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebPageId, PebShopThemeEntity, PebThemeDetailInterface, PebThemePageInterface } from '@pe/builder-core';

import { PosPreviewDTO } from '../pos.types';

@Injectable()
export abstract class BuilderPosApi {

  abstract getPosPreview(posId: string, include?: string[]): Observable<PosPreviewDTO>;

  abstract getPosActiveTheme(posId: string, include?: string[]): Observable<any>;

  abstract getThemesList(posId: string): Observable<any>;

  abstract getThemeById(posId: string, themeId: string): Observable<any>;

  abstract getTemplateThemes(): Observable<any>;

  abstract getTemplateItemThemes(itemId: string): Observable<any>;

  abstract duplicateTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity>;

  abstract deleteTemplateTheme(siteId: string, themeId: string): Observable<void>;

  abstract installTemplateTheme(posId: string, templateID: string): Observable<any>;

  abstract instantInstallTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity>;

  abstract installDefaultTheme(posId: string): Observable<any>;

  abstract getPosThemeById(themeId: string): Observable<any>;

  abstract getThemeDetail(themeId: string, page?:string): Observable<PebThemeDetailInterface>;

  abstract getPage(
    themeId: string, pageId: PebPageId, screen?:string,
  ): Observable<PebThemePageInterface>;

  protected constructor() {}
}
