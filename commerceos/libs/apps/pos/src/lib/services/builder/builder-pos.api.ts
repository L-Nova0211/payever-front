import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebPageId, PebShopThemeEntity, PebThemeDetailInterface, PebThemePageInterface } from '@pe/builder-core';
import { EnvService } from '@pe/common';

import { PEB_POS_API_BUILDER_PATH } from '../../constants/constants';
import { PosEnvService } from '../pos/pos-env.service';

import { BuilderPosApi } from './abstract.builder-pos.api';

@Injectable()
export class ActualBuilderPosApi implements BuilderPosApi {

  constructor(
    private http: HttpClient,
    @Inject(EnvService) private envService: PosEnvService,
    @Inject(PEB_POS_API_BUILDER_PATH) private editorApiPath: string,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  getPosPreview(posId: string, include?: string[]): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.businessId}/application/${posId}/preview`;

    return this.http.get(endpoint, { params: { include: 'published', page: 'front' } });
  }

  getPosActiveTheme(posId: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.businessId}/application/${posId}/themes`;

    return this.http.get<any>(endpoint);
  }

  getThemesList(posId: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/${this.businessId}/terminal/${posId}/theme`;

    return this.http.get<any>(endpoint);
  }

  getThemeById(themeId: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/theme/${themeId}`;

    return this.http.get<any>(endpoint);
  }

  getTemplateThemes(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`);
  }

  getTemplateItemThemes(itemId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/template/item/${itemId}`);
  }

  duplicateTemplateTheme(posId: string, themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/business/${this.businessId}/application/${posId}/theme/${themeId}/duplicate`,
      {},
    );
  }

  deleteTemplateTheme(posId: string, themeId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.editorApiPath}/business/${this.businessId}/application/${posId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(posId: string, themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/business/${this.businessId}/application/${posId}/template/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(posId: string, templateID: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.businessId}`
    + `/application/${posId}/theme/${templateID}/install`;

    return this.http.post<any>(endpoint, {});
  }

  installDefaultTheme(posId: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/business/${this.businessId}/application/${posId}/install`;

    return this.http.put<any>(endpoint, {});
  }

  getPosThemeById(themeId: string): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getThemeDetail(themeId: string, page?: string): Observable<PebThemeDetailInterface> {
    return this.http.get<PebThemeDetailInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/detail`,
      { params: page ? { page } : null },
    );
  }

  getPage(themeId: string, pageId: PebPageId, screen?:string): Observable<PebThemePageInterface> {
    return this.http.get<PebThemePageInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/page/${pageId}`,
      { params: screen ? { screen } : null },
    );
  }
}
