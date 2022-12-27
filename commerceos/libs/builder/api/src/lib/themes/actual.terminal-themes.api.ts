import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { pebCreateEmptyShop, PebEnvService, PebPaginationParams } from '@pe/builder-core';

import { PEB_BUILDER_POS_API_PATH } from '../pos/actual.pos.api';

import { PebThemesApi } from './abstract.themes.api';

@Injectable()
export class PebActualTerminalThemesApi implements PebThemesApi {
  get terminalId(): string {
    return this.envService.terminalId;
  }

  get businessId(): string {
    return this.envService.businessId;
  }

  constructor(
    @Inject(PEB_BUILDER_POS_API_PATH) private editorApiPath: string,
    private envService: PebEnvService,
    private http: HttpClient,
  ) { }

  getThemesList(): Observable<any> {
    const endpoint = `${this.editorApiPath}/business/${this.businessId}/terminal/${this.terminalId}/themes`;

    return this.http.get(endpoint);
  }

  getThemeById(themeId: string): Observable<any> {
    return this.http.get(`${this.editorApiPath}/theme/${themeId}`);
  }

  getTemplateThemes(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`);
  }

  getThemesByTemplateId(itemId:string[]): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/template/items`, { ids:itemId });
  }

  getTemplateItemThemes(ids: string[], { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/template/themes`, { ids }, {
      params: { offset: offset.toString(), limit: limit.toString() },
    });
  }

  duplicateTemplateTheme(themeId: string): Observable<any> {
    return this.http.put<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/terminal/${this.terminalId}/theme/${themeId}/duplicate`,
      {},
    );
  }

  deleteTemplateTheme(themeId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.editorApiPath}/business/${this.businessId}/terminal/${this.terminalId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(themeId: string): Observable<any> {
    return this.http.put<any>(
      `${this.editorApiPath}/business/${this.businessId}/terminal/${this.terminalId}/theme/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(themeId: string): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/business/${this.businessId}/terminal/${this.terminalId}/theme/${themeId}/install`,
      {},
    );
  }

  switchTemplateTheme(themeId: string): Observable<any> {
    return this.http.put<any>(
      `${this.editorApiPath}/business/${this.businessId}/terminal/${this.terminalId}/theme/${themeId}/switch`,
      {},
    );
  }

  createThemeAlbum(album: any): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme-album`,
      album,
    );
  }

  updateThemeAlbum(albumId: string, album: any): Observable<any> {
    return this.http.patch<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme-album/${albumId}`,
      album,
    );
  }

  getThemeBaseAlbum(): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme-album`,
    );
  }

  getThemeAlbumById(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme-album/${albumId}`,
    );
  }

  getThemeAlbumByParent(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme-album/parent/${albumId}`,
    );
  }

  getThemeAlbumByAncestor(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme-album/ancestor/${albumId}`,
    );
  }

  deleteThemeAlbum(albumId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme-album/${albumId}`,
    );
  }

  getThemeByAlbum(albumId?: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/album`,
      { params: albumId ? { albumId } : null },
    );
  }

  linkThemeToAlbum(themeId: string, albumId?: string): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/${themeId}/album/${albumId}`,
      {},
    );
  }

  unlinkTheme(themeId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/${themeId}/album`,
    );
  }

  createApplicationTheme(name: string): Observable<any> {

    const content = pebCreateEmptyShop()

    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme`,
      { content, name },
    );
  }

  duplicateThemeAlbum(payload: { albumIds: string[], parent?: string, prefix?: string }): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme-album/duplicate`,
      payload,
    );
  };
}
