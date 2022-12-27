import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebEnvService, PebShopThemeEntity } from '@pe/builder-core';

import { PEB_SITE_API_BUILDER_PATH } from '../../constants';

import { AbstractSiteBuilderApi, SitePreviewDTO } from './abstract.builder.api';


@Injectable()
export class PebActualSiteBuilderApi implements AbstractSiteBuilderApi {
  constructor(
    private envService: PebEnvService,
    @Inject(PEB_SITE_API_BUILDER_PATH) private editorApiPath: string,
    private http: HttpClient,
  ) {
  }


  private get businessId() {
    return this.envService.businessId;
  }

  getSitePreview(siteId: string, include?: string, page: string = null): Observable<SitePreviewDTO> {
    const endpoint = `${this.editorApiPath}/api/business/${this.businessId}/application/${siteId}/preview`;

    return this.http.get<SitePreviewDTO>(endpoint, { params: { currentDetail: 'true', ...page ? { page } : null } });
  }

  getSiteActiveTheme(siteId: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.businessId}/application/${siteId}/themes/active`;

    return this.http.get<any>(endpoint);
  }

  getThemesList(siteId: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.businessId}/application/${siteId}/themes`;

    return this.http.get<any>(endpoint);
  }

  getThemeById(themeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getTemplateThemes(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`);
  }

  duplicateTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.businessId}/site/${siteId}/theme/${themeId}/duplicate`,
      {},
    );
  }

  deleteTemplateTheme(siteId: string, themeId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.editorApiPath}/api/business/${this.businessId}/site/${siteId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.businessId}/site/${siteId}/template/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.businessId}/application/${siteId}/theme/${themeId}/install`,
      {},
    );
  }

  createTemplateTheme(themeId: string, body: any): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/api/${themeId}/template`,
      body,
    );
  }

  updateThemeVersion(themeId:string, versionId:string,body:any): Observable<any>{
    return this.http.patch(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`, body)
  }


}
