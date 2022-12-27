import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebShopThemeEntity } from '@pe/builder-core';
import { EnvService } from '@pe/common';

import { PEB_INVOICE_BUILDER_API_PATH } from '../constants';

import { AbstractInvoiceBuilderApi } from './abstract.builder.api';
import { InvoiceEnvService } from './invoice-env.service';

@Injectable()
export class PebActualInvoiceBuilderApi implements AbstractInvoiceBuilderApi {
  basePath: string;
  constructor(
    @Inject(PEB_INVOICE_BUILDER_API_PATH) private editorApiPath: string,
    @Inject(EnvService) private envService: InvoiceEnvService,
    private http: HttpClient,
  ) {
    this.basePath = `${this.editorApiPath}/api/business/`;
  }

  private get applicationId() {

    return this.envService.businessId;
  }

  private get businessId() {

    return this.envService.businessId;
  }

  private get invoiceId() {

    return this.envService.invoiceId;
  }

  getInvoicePreview(siteId: string, include?: string): Observable<any> {
    const endpoint = `${this.basePath}${this.businessId}/application/${this.applicationId}/preview`;

    return this.http.get<any>(endpoint, { params: { include: 'published', page: 'front' } });
  }

  getSiteActiveTheme(siteId: string): Observable<any> {
    const endpoint = `${this.basePath}${this.businessId}/application/${this.applicationId}/themes/active`;

    return this.http.get<any>(endpoint);
  }

  getThemesList(siteId: string): Observable<any> {
    const endpoint = `${this.basePath}${this.businessId}/application/${this.applicationId}/themes`;

    return this.http.get<any>(endpoint);
  }

  getTemplateList(): Observable<any> {

    return this.http.
      get(`${this.basePath}${this.envService.businessId}/application/${this.envService.businessId}/theme/template`);
  }

  getThemeById(themeId: string): Observable<any> {

    return this.http.get<any>(`${this.editorApiPath}/theme/${themeId}`);
  }

  getTemplateThemes(): Observable<any> {

    return this.http.get<any>(`${this.editorApiPath}/templates`);
  }

  duplicateTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity> {

    return this.http.put<PebShopThemeEntity>(
      `${this.basePath}${this.businessId}/invoice/${this.invoiceId}/theme/${themeId}/duplicate`,
      {},
    );
  }

  deleteTemplateTheme(siteId: string, themeId: string): Observable<void> {

    return this.http.delete<void>(
      `${this.basePath}${this.businessId}/invoice/${this.invoiceId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity> {

    return this.http.put<PebShopThemeEntity>(
      `${this.basePath}${this.businessId}/invoice/${this.invoiceId}/template/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity> {

    return this.http.put<PebShopThemeEntity>(
      `${this.basePath}${this.businessId}/application/${this.applicationId}/theme/${themeId}/install`,
      {},
    );
  }

  createTemplateTheme(themeId: string, body: any): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/${themeId}/template`,
      body,
    );
  }

  updateThemeVersion(themeId:string, versionId:string,body:any): Observable<any>{
    return this.http.patch(`${this.editorApiPath}/theme/${themeId}/version/${versionId}`, body)
  }

}
