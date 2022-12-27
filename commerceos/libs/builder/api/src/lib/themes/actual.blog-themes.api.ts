import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { pebCreateEmptyShop, PebEnvService, PebPaginationParams } from '@pe/builder-core';
import { EnvService } from '@pe/common';

import { PEB_EDITOR_API_PATH } from '../editor/actual.editor.api';

import { PebThemesApi } from './abstract.themes.api';

@Injectable()
export class PebActualBlogThemesApi implements PebThemesApi {
  constructor(
    @Inject(PEB_EDITOR_API_PATH) private editorApiPath: string,
    @Inject(EnvService) private envService: PebEnvService,
    private http: HttpClient,
  ) { }

  getThemesList(): Observable<any> {
    const { businessId, applicationId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${applicationId}/themes`;

    return this.http.get(endpoint);
  }

  getThemeById(themeId: string): Observable<any> {

    return this.http.get(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getTemplateThemes({ offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {

    return this.http.get<any>(`${this.editorApiPath}/api/templates`, {
      params: { offset: offset.toString(), limit: limit.toString() },
    });
  }

  getTemplateItemThemes(ids: string[], { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {

    return this.http.post<any>(`${this.editorApiPath}/api/template/themes`, { ids }, {
      params: { offset: offset.toString(), limit: limit.toString() },
    });
  }

  getThemesByTemplateId(itemId: string[], { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {

    return this.http.post<any>(`${this.editorApiPath}/api/template/items`, { ids: itemId });
  }

  duplicateTemplateTheme(themeId: string): Observable<any> {

    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme/${themeId}/duplicate`,
      {},
    );
  }

  duplicateThemeAlbum(payload: any) {
    const result$: Observable<any> = of();

    return result$;
  }

  deleteTemplateTheme(themeId: string): Observable<void> {

    return this.http.delete<void>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(themeId: string): Observable<any> {

    return this.http.put<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/template/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(themeId: string): Observable<any> {

    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme/${themeId}/install`,
      {},
    );
  }

  switchTemplateTheme(themeId: string): Observable<any> {

    return this.http.put<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme/${themeId}/switch`,
      {},
    );
  }

  createThemeAlbum(album: any): Observable<any> {

    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme-album`,
      album,
    );
  }

  updateThemeAlbum(albumId: string, album: any): Observable<any> {

    return this.http.patch<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme-album/${albumId}`,
      album,
    );
  }

  getThemeBaseAlbum(): Observable<any> {

    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme-album`,
    );
  }

  getThemeAlbumById(albumId: string): Observable<any> {

    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme-album/${albumId}`,
    );
  }

  getThemeAlbumByParent(albumId: string): Observable<any> {

    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme-album/parent/${albumId}`,
    );
  }

  getThemeAlbumByAncestor(albumId: string): Observable<any> {

    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme-album/ancestor/${albumId}`,
    );
  }

  deleteThemeAlbum(albumId: string): Observable<any> {

    return this.http.delete<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme-album/${albumId}`,
    );
  }

  getThemeByAlbum(albumId?: string, pagination: PebPaginationParams = {}): Observable<any> {
    const { offset = 0, limit = 100 } = pagination;
    const params: { [key: string]: string } = { offset: offset.toString(), limit: limit.toString() };
    if (albumId) {
      params.albumId = albumId;
    }

    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme/album`,
      { params },
    );
  }

  linkThemeToAlbum(themeId: string, albumId?: string): Observable<any> {

    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme/${themeId}/album/${albumId}`,
      {},
    );
  }

  unlinkTheme(themeId: string): Observable<any> {

    return this.http.delete<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme/${themeId}/album`,
    );
  }

  createApplicationTheme(name: string): Observable<any> {
    const content = pebCreateEmptyShop();

    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId}/theme`,
      { name, content },
    );
  }
}
