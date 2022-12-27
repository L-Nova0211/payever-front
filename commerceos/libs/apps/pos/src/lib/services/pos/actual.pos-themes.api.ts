import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PebThemesApi, PEB_EDITOR_API_PATH } from '@pe/builder-api';
import { pebCreateEmptyShop, PebPaginationParams, PebShopThemeEntity, PebShopThemeId } from '@pe/builder-core';
import { EnvService } from '@pe/common';

import { PosEnvService } from './pos-env.service';


@Injectable()
export class PebActualPosThemesApi implements PebThemesApi {
  constructor(
    @Inject(PEB_EDITOR_API_PATH) private editorApiPath: string,
    @Inject(EnvService) private envService: PosEnvService,
    private http: HttpClient,
  ) { }

  getThemesList(): Observable<any> {
    const { businessId, posId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/terminal/${posId}/themes`;

    return this.http.get(endpoint);
  }

  getThemeById(themeId: PebShopThemeId): Observable<any> {
    return this.http.get(`${this.editorApiPath}/theme/${themeId}`);
  }

  getTemplateThemes({ offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<PebShopThemeEntity> {
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

  duplicateTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    const { businessId, posId } = this.envService;

    return this.http.post<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/duplicate`,
      {},
    );
  }

  duplicateThemeAlbum(payload: any) {
    const result$: Observable<any> = of();

    return result$;
  }

  deleteTemplateTheme(themeId: string): Observable<void> {
    const { businessId, posId } = this.envService;

    return this.http.delete<void>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    const { businessId, posId } = this.envService;

    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/template/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    const { businessId, posId } = this.envService;

    return this.http.post<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/install`,
      {},
    );
  }

  switchTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    const { businessId, posId } = this.envService;

    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/switch`,
      {},
    );
  }


  createThemeAlbum(album: any): Observable<any> {
    const { businessId, posId } = this.envService;

    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme-album`,
      album,
    );
  }

  updateThemeAlbum(albumId: string, album: any): Observable<any> {
    return this.http.patch<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}`
      + `/application/${this.envService.posId}/theme-album/${albumId}`,
      album,
    );
  }

  getThemeBaseAlbum(): Observable<any> {
    const { businessId, posId } = this.envService;

    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme-album`,
    );
  }

  getThemeAlbumById(albumId: string): Observable<any> {
    const { businessId, posId } = this.envService;

    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme-album/${albumId}`,
    );
  }

  getThemeAlbumByParent(albumId: string): Observable<any> {
    const { businessId, posId } = this.envService;

    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme-album/parent/${albumId}`,
    );
  }

  getThemeAlbumByAncestor(albumId: string): Observable<any> {
    const { businessId, posId } = this.envService;

    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme-album/ancestor/${albumId}`,
    );
  }

  deleteThemeAlbum(albumId: string): Observable<any> {
    const { businessId, posId } = this.envService;

    return this.http.delete<any>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme-album/${albumId}`,
    );
  }

  getThemeByAlbum(albumId?: string, pagination: PebPaginationParams = {}): Observable<any> {
    const { offset = 0, limit = 100 } = pagination;
    const params: { [key: string]: string } = { offset: offset.toString(), limit: limit.toString() };
    if (albumId) {
      params.albumId = albumId;
    }
    const { businessId, posId } = this.envService;

    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme/album`,
      { params },
    );
  }

  linkThemeToAlbum(themeId: string, albumId?: string): Observable<any> {
    const { businessId, posId } = this.envService;

    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/album/${albumId}`,
      {},
    );
  }

  unlinkTheme(themeId: string): Observable<any> {
    const { businessId, posId } = this.envService;

    return this.http.delete<any>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/album`,
    );
  }

  createApplicationTheme(name: string): Observable<any> {
    const { businessId, posId } = this.envService;
    const content = pebCreateEmptyShop();

    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${businessId}/application/${posId}/theme`,
      { name, content },
    );
  }
}
