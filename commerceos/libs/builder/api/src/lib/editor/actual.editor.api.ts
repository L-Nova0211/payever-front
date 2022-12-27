import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  PebAction,
  PebEnvService,
  PebPageId,
  PebPaginationParams,
  PebScreen,
  PebShopGeneratedThemeResponse,
  PebShopId,
  PebShopImageResponse,
  PebShopTheme,
  PebShopThemeEntity,
  PebShopThemeId,
  PebShopThemeSourceId,
  PebShopThemeSourcePagePreviews,
  PebShopThemeVersion,
  PebShopThemeVersionEntity,
  PebShopThemeVersionId,
  PebStylesheet,
  PebStylesheetId,
  PebThemeDetailInterface,
  PebThemePageInterface,
  PebThemeShortPageInterface,
  ThemeVersionInterface,
} from '@pe/builder-core';


import { PEB_GENERATOR_API_PATH, PEB_MEDIA_API_PATH, PEB_STORAGE_PATH } from '../constants';
import { ShopPreviewDTO } from '../shops/abstract.shops.api';
import { PEB_SHOPS_API_PATH } from '../shops/actual.shops.api';

import { CreateShopThemeDto, CreateShopThemePayload, PebEditorApi } from './abstract.editor.api';

export const PEB_EDITOR_API_PATH = new InjectionToken<string>('PEB_EDITOR_API_PATH');

@Injectable()
export class PebActualEditorApi implements PebEditorApi {

  constructor(
    @Inject(PEB_EDITOR_API_PATH) private editorApiPath: string,
    @Inject(PEB_SHOPS_API_PATH) private shopApiPath: string,
    @Inject(PEB_GENERATOR_API_PATH) private apiGeneratorPath: string,
    @Inject(PEB_MEDIA_API_PATH) private apiMediaPath: string,
    @Inject(PEB_STORAGE_PATH) private mediaStoragePath: string,
    @Optional() @Inject('PEB_ENTITY_NAME') private entityName: string,
    private envService: PebEnvService,
    private http: HttpClient,
  ) { }

  getBusinessApps(): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/business/${this.envService.businessId}/list`);
  }

  getThemeDetail(themeId: PebShopThemeId, page?: string): Observable<PebThemeDetailInterface> {
    return this.http.get<PebThemeDetailInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/detail`,
      { params: page ? { page } : null },
    );
  }

  getSnapshotByVersionId(
    themeId: PebShopThemeId,
    versionId: PebShopThemeVersionId,
  ): Observable<PebThemeDetailInterface> {
    return this.http.get<PebThemeDetailInterface>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/snapshot`);
  }

  getPages(themeId: PebShopThemeId): Observable<PebThemeShortPageInterface[]> {
    return this.http.get<PebThemeShortPageInterface[]>(`${this.editorApiPath}/api/theme/${themeId}/pages`);
  }

  getPage(themeId: PebShopThemeId, pageId: PebPageId, screen?:string): Observable<PebThemePageInterface> {
    return this.http.get<PebThemePageInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/page/${pageId}`,
      { params: screen ? { screen } : null },
    );
  }

  getPageStylesheet(
    themeId: PebShopThemeId,
    pageId: PebPageId,
    screen: string,
  ): Observable<{ id: PebStylesheetId, stylesheet: { [s: string]: PebStylesheet } }> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/theme/${themeId}/page/${pageId}/style/${screen}`,
    );
  }

  getPageActions(
    themeId: PebShopThemeId,
    pageId: PebPageId,
    limit = 20,
    offset = 0,
  ): Observable<PebAction[]> {
    return this.http.get<PebAction[]>(
      `${this.editorApiPath}/api/theme/${themeId}/page/${pageId}/actions`,
      { params: limit ? { limit: `${limit}`, offset: `${offset}` } : {} },
    );
  }

  getActions(themeId: PebShopThemeId, limit = 20, offset = 0): Observable<PebAction[]> {
    return this.http.get<PebAction[]>(
      `${this.editorApiPath}/api/theme/${themeId}/actions`,
      { params: limit ? { limit: `${limit}`, offset: `${offset}` } : {} },
    );
  }

  getAllAvailableThemes(): Observable<PebShopTheme[]> {
    const endpoint = `${this.editorApiPath}/api/themes`;

    return this.http.get<any[]>(endpoint);
  }

  getShopThemesList(): Observable<any> {
    const { businessId, shopId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${shopId}/themes`;

    return this.http.get(endpoint);
  }

  getShopThemeById(themeId: PebShopThemeId): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getShopActiveTheme(): Observable<any> {
    const { businessId, shopId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${shopId}/themes/active`;

    return this.http.get(endpoint);
  }

  createTheme(input: CreateShopThemePayload): Observable<any> {
    return this.http.post(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId ?? this.envService.shopId}/theme`, input);
  }

  createShopTheme(input: CreateShopThemePayload): Observable<CreateShopThemeDto> {
    return this.http.post(`${this.editorApiPath}/api/theme`, input);
  }

  addAction(shopId: PebShopId, action: PebAction): Observable<any> {
    return this.http.post(`${this.editorApiPath}/api/theme/${shopId}/action`, action);
  }

  undoAction(themeId: PebShopId, actionId: PebPageId): Observable<null> {
    return this.http.delete<null>(`${this.editorApiPath}/api/theme/${themeId}/action/${actionId}`);
  }

  updateReplicas(themeId: string, actions: PebAction[]): Observable<PebThemeDetailInterface> {
    return this.http.put<PebThemeDetailInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/actions/apply`,
      actions,
    );
  }

  getShopThemeVersions(themeId: string): Observable<PebShopThemeVersionEntity[]> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/versions`);
  }

  getShopThemeVersionById(themeId: string, versionId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`);
  }

  getShopThemeActiveVersion(themeId: string): Observable<PebShopThemeVersion> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/version/active`);
  }

  createShopThemeVersion(themeId: PebShopId, name?: string): Observable<PebShopThemeVersionEntity> {
    return this.http.post<any>(`${this.editorApiPath}/api/theme/${themeId}/version`, { name });
  }

  updateShopThemePreview(themeId: PebShopId, imagePreview: string): Observable<any> {
    return this.http.put<any>(`${this.editorApiPath}/api/theme/${themeId}/image-preview`, { imagePreview });
  }

  updateShopThemeName(themeId: string, name: string): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/name`, { name });
  }

  updateShopThemeDefaultScreen(themeId: string, defaultScreen: PebScreen): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/screen`, { defaultScreen });
  }

  deleteShopThemeVersion(themeId: PebShopId, versionId: PebShopThemeVersionId): Observable<any> {
    return this.http.delete(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`);
  }

  activateShopThemeVersion(
    themeId: PebShopId,
    versionId: PebShopThemeVersionId,
  ): Observable<ThemeVersionInterface> {
    return this.http.put<any>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/restore`, null);
  }

  publishShopThemeVersion(themeId: PebShopId, versionId: PebShopThemeVersionId): Observable<any> {
    return this.http.put(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/publish`, {}).pipe(
    );
  }

  updateThemeVersion(themeId: string, versionId: string, body: any): Observable<any> {
    return this.http.patch(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`, body);
  }

  getTemplateThemes(): Observable<PebShopThemeEntity[]> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`);
  }

  generateTemplateTheme(
    category: string,
    page: string,
    theme: string,
    logo?: string,
  ): Observable<PebShopGeneratedThemeResponse> {
    const payload = {
      category,
      page,
      theme,
      logo,
    };

    return this.http.post<PebShopGeneratedThemeResponse>(
      `${this.apiGeneratorPath}/api/builder-generator/business/${this.envService.businessId}/generate`,
      payload,
    );
  }

  updateThemeSourcePagePreviews(
    themeId: PebShopThemeId,
    sourceId: PebShopThemeSourceId,
    previews: PebShopThemeSourcePagePreviews,
  ): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/source/${sourceId}/previews`, previews);
  }

  installTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId ?? this.envService.shopId}/theme/${themeId}/install`, {});
  }

  instantInstallTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId ?? this.envService.shopId}/template/${themeId}/instant-setup`, {});
  }

  deleteTemplateTheme(themeId: string): Observable<void> {
    return this.http.delete<void>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId ?? this.envService.shopId}/theme/${themeId}`, {});
  }

  duplicateTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.applicationId ?? this.envService.shopId}/theme/${themeId}/duplicate`, {});
  }

  getApps(isDefault?: boolean): Observable<any[]> {
    return this.http.get<any[]>(`${this.shopApiPath}/business/${this.envService.businessId}/${this.entityName}`, {
      params: isDefault ? { isDefault: JSON.stringify(isDefault) } : null,
    });
  }

  getApp(appId: string): Observable<any> {
    return this.http.get<any[]>(
      `${this.shopApiPath}/business/${this.envService.businessId}/${this.entityName}/${appId}`,
    );
  }

  updateAppDeploy(accessId: string, payload: any): Observable<any> {
    return this.http.patch<any[]>(
      `${this.shopApiPath}/business/${this.envService.businessId}/${this.entityName}/access/${accessId}`,
      payload,
    );
  }

  createApp(payload: any): Observable<any> {
    return this.http.post<any[]>(
      `${this.shopApiPath}/business/${this.envService.businessId}/${this.entityName}`,
      payload,
    );
  }

  deleteApp(appId: string): Observable<null> {
    return this.http.delete<null>(
      `${this.shopApiPath}/business/${this.envService.businessId}/${this.entityName}/${appId}`,
    );
  }

  setAsDefaultApp(appId: string): Observable<any> {
    return this.http.put<any>(`${this.shopApiPath}/business/${this.envService.businessId}/${this.entityName}/${appId}/default`, {});
  }

  updateApp(payload: any): Observable<any> {
    return this.http.patch<any[]>(
      `${this.shopApiPath}/business/${this.envService.businessId}/${this.entityName}/${this.envService.applicationId ?? this.envService.shopId}`,
      payload,
    );
  }

  // TODO(@mivnv): Move it to the media service
  uploadImage(container: string, file: File, returnShortPath: boolean): Observable<PebShopImageResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/image/business/${this.envService.businessId}/${container}`,
      formData,
    )
      .pipe(
        map((response: PebShopImageResponse) => {
          return {
            ...response,
            blobName: `${returnShortPath ? '' : this.mediaStoragePath}/${container}/${response.blobName}`,
          };
        }),
        catchError((_) => {
          return of(null);
        }));
  }

  // TODO(@mivnv): Move it to the media service
  uploadImageWithProgress(
    container: string,
    file: File,
    returnShortPath: boolean,
  ): Observable<HttpEvent<PebShopImageResponse>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/image/business/${this.envService.businessId}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    ).pipe(
      map<any, any>((event: HttpEvent<PebShopImageResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            return {
              ...event,
              loaded: Number(((event.loaded / event.total) * 100).toFixed(0)),
            };
          }
          case HttpEventType.Response: {
            return {
              ...event,
              body: {
                ...event.body,
                blobName: `${returnShortPath ? '' : this.mediaStoragePath}/${container}/${event.body.blobName}`,
              },
            };
          }
          default:
            return event;
        }
      }),
      catchError((_) => {
        return of(null);
      }));
  }

  // TODO(@mivnv): Move it to the media service
  uploadVideo(container: string, file: File): Observable<PebShopImageResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/video/business/${this.envService.businessId}/${container}`,
      formData,
    )
      .pipe(
        map((response: PebShopImageResponse) => {
          return {
            ...response,
            blobName: `${this.mediaStoragePath}/${container}/${response.blobName}`,
            preview: `${this.mediaStoragePath}/${container}/${response.preview}`,
          };
        }),
        catchError((_) => {
          return of(null);
        }));
  }

  // TODO(@mivnv): Move it to the media service
  uploadVideoWithProgress(container: string, file: File): Observable<HttpEvent<PebShopImageResponse>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/video/business/${this.envService.businessId}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    ).pipe(
      map<any, any>((event: HttpEvent<PebShopImageResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            return {
              ...event,
              loaded: Number(((event.loaded / event.total) * 100).toFixed(0)),
            };
          }
          case HttpEventType.Response: {
            return {
              ...event,
              body: {
                ...event.body,
                blobName: `${this.mediaStoragePath}/${container}/${event.body.blobName}`,
                preview: `${this.mediaStoragePath}/${container}/${event.body.preview}`,
              },
            };
          }
          default:
            return event;
        }
      }),
      catchError((_) => {
        return of(null);
      }));
  }

  /** @deprecated use shops getShopPreview instead */
  getShopPreview(shopId: string, include?: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${shopId}/preview`;

    return this.http.get(endpoint, { params: { include: 'published', page: 'front' } });
  }

  getCurrentShopPreview(shopId: string, currentDetail: boolean, diff: boolean, page: string = null): Observable<ShopPreviewDTO> {
    const endpoint = `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${shopId}/preview`;

    const params = Object.assign(
      {},
      currentDetail ? { currentDetail: JSON.stringify(currentDetail) } : null,
      diff ? { diff: JSON.stringify(diff) } : null,
      page ? { page } : null,
    );

    return this.http.get<ShopPreviewDTO>(endpoint, { params });
  }

  getShopPreviewPages(shopId: string, pageId?: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${shopId}/source/pages/${pageId ? pageId : ''}`);
  }

  getThemePreviewPages(shopId: string, pageId?: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${shopId}/source/pages/${pageId ? pageId : ''}`);
  }

  // PAGES

  getPageAlbumsFlatTree(shopId: string, themeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/flattree`);
  }

  getPageAlbumsTree(shopId: string, themeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/tree`);
  }

  getPageAlbums(shopId: string, themeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album`);
  }

  createPageAlbum(shopId: string, themeId: string, album: any): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album`, album);
  }

  deletePageAlbum(shopId: string, themeId: string, albumId: string, album: any): Observable<any> {
    return this.http.delete<any>(`${this.editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/${albumId}`);
  }

  updatePageAlbum(
    shopId: string,
    themeId: string,
    albumId: string,
    album: { name: string, description: string, icon: string, parent: string }):
    Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/${albumId}`, album);
  }

  getPageAlbumById(shopId: string, themeId: string, albumId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/${albumId}`);
  }

  getPageAlbumByParent(shopId: string, themeId: string, parentId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/parent/${parentId}`);
  }

  getPageByAlbum(
    shopId: string,
    themeId: string,
    albumId: string,
    { offset = 1, limit = 10 }: PebPaginationParams = {}
  ): Observable<any> {
    const params = {
      page: offset.toString(),
      limit: limit.toString(),
    };

    return this.http.get<any>(`${this.editorApiPath}/api/application/${shopId}/page/album/${albumId}`, { params });
  }

  linkPageToAlbum(shopId: string, themeId: string, pageId: string, albumId: string): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/application/${shopId}/page/${pageId}/album/${albumId}`, {});
  }

  unlinkPageFromAlbum(shopId: string, themeId: string, pageId: string): Observable<any> {
    return this.http.delete<any>(`${this.editorApiPath}/api/application/${shopId}/page/${pageId}/album`);
  }

  // SHAPES
  postShape(shape: any): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape`, shape);
  }

  getShapes(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape`);
  }

  getShapesByAlbum(albumId: string, { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape/album${albumId ? `/${albumId}` : ''}`,
      { params: { offset: offset.toString(), limit: limit.toString() } },
    );
  }

  getShape(shapeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape/${shapeId}`);
  }

  patchShape(id: string, shape): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape/${id}`, shape);
  }

  deleteShape(shapeId: string): Observable<any> {
    return this.http.delete(`${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape/${shapeId}`);
  }

  patchShapeAlbum(albumId: string, album: any): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape-album/${albumId}`;

    return this.http.patch<any>(endpoint, album);
  }

  postShapeAlbum(album: any): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape-album`, album);
  }

  getShapeAlbums(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape-album`);
  }

  deleteShapeAlbum(albumId: string): Observable<any> {
    return this.http.delete<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape-album/${albumId}`);
  }

  getTemplateShapes(): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape/template`);
  }

  getTemplateShapeAlbums(): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape-album/template`);
  }

  getTemplateShapesByAlbum(albumId: string, { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/application/${this.envService.applicationId ?? this.envService.shopId}/shape/template/album${albumId ? `/${albumId}` : ''}`,
      { params: { offset: offset.toString(), limit: limit.toString() } },
    );
  }

}
