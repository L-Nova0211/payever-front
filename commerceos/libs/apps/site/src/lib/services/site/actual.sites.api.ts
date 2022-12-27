import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PEB_EDITOR_API_PATH } from '@pe/builder-api';
import { EnvService } from '@pe/common';

import { PEB_SITE_API_PATH } from '../../constants';
import { SiteCreateDTO, SiteDTO } from '../../site.interface';
import { SiteEnvService } from '../site-env.service';

import { PebSitesApi } from './abstract.sites.api';


@Injectable()
export class PebActualSitesApi extends PebSitesApi {
  constructor(
    @Inject(EnvService) private envService: SiteEnvService,
    private http: HttpClient,
    @Inject(PEB_SITE_API_PATH) private siteApiPath: string,
    @Inject(PEB_EDITOR_API_PATH) private editorApiPath: string,
  ) {
    super();
  }

  private get businessId() {
    return this.envService.businessId;
  }

  getSiteList(): Observable<SiteDTO[]> {
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site`;

    return this.http.get<SiteDTO[]>(endpoint);
  }

  getSingleSite(siteId: string): Observable<SiteDTO> {
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site/${siteId}`;

    return this.http.get<SiteDTO>(endpoint);
  }

  createSite(payload: any): Observable<SiteDTO> {
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site`;

    return this.http.post<SiteDTO>(endpoint, payload);
  }

  deleteSite(siteId: string): Observable<null> {
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site/${siteId}`;

    return this.http.delete<null>(endpoint);
  }

  updateSite(siteId: string, payload: any): Observable<SiteCreateDTO> {
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site/${siteId}`;

    return this.http.patch<SiteDTO>(endpoint, payload);
  }

  markSiteAsDefault(siteId: string): Observable<SiteDTO> {
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site/${siteId}/default`;

    return this.http.put<SiteDTO>(endpoint, {});
  }

  updateSiteDeploy(accessId: string, payload: any): Observable<SiteDTO> {
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site/access/${accessId}`;

    return this.http.patch<SiteDTO>(endpoint, payload);
  }

  validateSiteName(domain: string): Observable<{ result: boolean }> {
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site/isValidName`;

    return this.http.get<{ result: boolean }>(endpoint, { params: { name: domain } });
  }

  getAllDomains(siteId:string): Observable<any> {
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site/${siteId}/domain`;

    return this.http.get<any>(endpoint);
  }

  createDomain(siteId:string, body:any): Observable<any>{
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site/${siteId}/domain`;

    return this.http.post<any>(endpoint, body);
  }

  updateDomain(siteId:string, domainId:string, body:any): Observable<any>{
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site/${siteId}/domain/${domainId}`;

    return this.http.put<any>(endpoint, body);
  }

  removeDomain(siteId: string, domainId): Observable<any>{
    const endpoint = `${this.siteApiPath}/api/business/${this.businessId}/site/${siteId}/domain/${domainId}`;

    return this.http.delete<any>(endpoint);
  }

  createSiteThemeVersion(themeId: string, name?: string): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/theme/${themeId}/version`, { name });
  }

  deleteSiteThemeVersion(themeId: string, versionId: string): Observable<any> {
    return this.http.delete(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`);
  }

  activateSiteThemeVersion(siteId: any, versionId: string): Observable<any> {
    return this.http.put<any>(`${this.editorApiPath}/api/theme/${siteId}/version/${versionId}/restore`, null);
  }

  publishSiteThemeVersion(themeId: string, versionId: string): Observable<any> {
    return this.http.put(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/publish`, {});
  }

  getCurrentSitePreview(siteId: string, currentDetail: boolean, diff: boolean): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${siteId}/preview`;

    const params = Object.assign(
      {},
      currentDetail ? { currentDetail: JSON.stringify(currentDetail) } : null,
      diff ? { diff: JSON.stringify(diff) } : null,
    );

    return this.http.get<any>(endpoint, { params });
  }

  patchIsLive(siteId: string, isLive: boolean): Observable<null> {
    return this.http.patch<null>(
      `${this.siteApiPath}/api/business/${this.businessId}/site/access/${siteId}`,
      { isLive },
    );
  }

  addSocialImage(siteId: string, image: string) {
    return this.http.patch(
      `${this.siteApiPath}/api/business/${this.businessId}/site/access/${siteId}`,
      { socialImage: image },
    );
  }

  updateSiteAccessConfig(siteId: string, payload: Partial<any>): Observable<any> {
    return this.http.patch<any>(
      `${this.siteApiPath}/api/business/${this.envService.businessId}/site/access/${siteId}`,
      payload,
    );
  }

  addDomain(siteId: string, domain: string): Observable<any> {
    return this.http.post(
      `${this.siteApiPath}/api/business/${this.envService.businessId}/site/${siteId}/domain`,
      { name: domain },
    );
  }

  checkDomain(siteId: string, domainId: string): Observable<any> {
    return this.http.post(
      `${this.siteApiPath}/api/business/${this.envService.businessId}/site/${siteId}/domain/${domainId}/check`,
      {},
    );
  }

  patchDomain(siteId: string, domainId: string, domain: string): Observable<any> {
    return this.http.patch(
      `${this.siteApiPath}/api/business/${this.envService.businessId}/site/${siteId}/domain/${domainId}`,
      { name: domain },
    );
  }

  deleteDomain(siteId: string, domainId: string): Observable<any> {
    return this.http.delete(
      `${this.siteApiPath}/api/business/${this.envService.businessId}/site/${siteId}/domain/${domainId}`,
    );
  }


}
