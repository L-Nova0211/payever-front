import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  CreateShopThemeDto,
  CreateShopThemePayload,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH, PEB_STORAGE_PATH,
  ShopPreviewDTO,
} from '@pe/builder-api';
import {
  PebAction, PebEnvService,
  PebPageId,
  PebPaginationParams,
  PebScreen,
  PebShopGeneratedThemeResponse,
  PebShopImageResponse,
  PebShopTheme,
  PebShopThemeEntity,
  PebShopThemeId,
  PebShopThemeSourceId,
  PebShopThemeSourcePagePreviews,
  PebShopThemeVersion,
  PebShopThemeVersionEntity,
  PebShopThemeVersionId,
  PebTheme,
  PebThemeDetailInterface,
  PebThemePageInterface,
  PebThemeShortPageInterface,
  ThemeVersionInterface,
} from '@pe/builder-core';

import { PEB_SITE_API_BUILDER_PATH, PEB_SITE_API_PATH } from '../../constants';

@Injectable()
export class ActualPebSitesEditorApi {
  constructor(
    @Inject(PEB_SITE_API_BUILDER_PATH) private editorApiPath: string,
    @Inject(PEB_SITE_API_PATH) private siteApiPath: string,
    @Inject(PEB_MEDIA_API_PATH) private apiMediaPath: string,
    @Inject(PEB_STORAGE_PATH) private mediaStoragePath: string,
    @Inject(PEB_GENERATOR_API_PATH) private apiGeneratorPath: string,
    private http: HttpClient,
    private envService: PebEnvService,
  ) {
  }

  getBusinessApps(): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/business/${this.envService.businessId}/list`);
  }

  activateShopThemeVersion(themeId: string, versionId: PebShopThemeVersionId): Observable<ThemeVersionInterface> {
    return this.http.put<any>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/restore`, null);
  }

  addAction(siteId: any, action: PebAction): any {
    return this.http.post(`${this.editorApiPath}/api/theme/${siteId}/action`, action);
  }

  createApp(payload: any): Observable<any> {
    return undefined;
  }

  createShopTheme(input: CreateShopThemePayload): Observable<CreateShopThemeDto> {
    return this.http.post(`${this.editorApiPath}/api/theme`, input);
  }

  createShopThemeVersion(themeId: any, name: string): Observable<PebShopThemeVersionEntity> {
    return this.http.post<any>(`${this.editorApiPath}/api/theme/${themeId}/version`, { name });
  }

  deleteApp(siteId: string): Observable<null> {
    console.log('deleteShop is undefined');

    return undefined;
  }

  deleteShopThemeVersion(themeId: any, versionId: PebShopThemeVersionId): Observable<any> {
    return this.http.delete(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`);
  }

  deleteTemplateTheme(themeId: string): Observable<void> {
    return this.http.delete<void>(`${this.editorApiPath}/api/business/${this.envService.businessId}`
    + `/application/${this.envService.applicationId}/theme/${themeId}`, {});
  }

  duplicateTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}`
    + `/application/${this.envService.applicationId}/theme/${themeId}/duplicate`, {});
  }

  getApp(siteId = this.envService.applicationId): Observable<any> {
    return this.http.get<any[]>(`${this.siteApiPath}/api/business/${this.envService.businessId}/site/${siteId}`);
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

  getActions(themeId: PebShopThemeId, limit?: number, offset?: number): Observable<PebAction[]> {
    return this.http.get<PebAction[]>(
      `${this.editorApiPath}/api/theme/${themeId}/actions`,
      { params: limit ? { limit: `${limit}`, offset: `${offset}` } : {} },
    );
  }

  getAllAvailableThemes(): Observable<PebShopTheme[]> {
    const endpoint = `${this.editorApiPath}/api/themes`;

    return this.http.get<any[]>(endpoint);
  }

  getPageActions(themeId: PebShopThemeId, pageId: PebPageId): Observable<PebAction[]> {
    return this.http.get<PebAction[]>(`${this.editorApiPath}/api/theme/${themeId}/pages/${pageId}/actions`);
  }



  getPage(themeId: string, pageId: string, screen?: string): Observable<PebThemePageInterface> {
    return this.http.get<PebThemePageInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/page/${pageId}`,
      { params: screen ? { screen } : null },
    );
  }

  getPageStylesheet(
    themeId: PebShopThemeId, pageId: PebPageId, screen: string,
  ): Observable<any> {
    return this.http.get<PebThemePageInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/page/${pageId}/style/${screen}`,
    );
  }

  getPages(themeId: string): Observable<PebThemeShortPageInterface[]> {
    return this.http.get<PebThemeShortPageInterface[]>(`${this.editorApiPath}/api/theme/${themeId}/pages`);
  }

  getShopActiveTheme(): Observable<{
    id: string;
    theme: string;
    isActive: boolean;
    isDeployed: boolean;
  }> {
    const { businessId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${this.envService.applicationId}/themes/active`;

    return this.http.get<any>(endpoint);
  }

  getShopPreview(shopId: string, include: string): Observable<ShopPreviewDTO> {
    const endpoint = `${this.editorApiPath}/business/${this.envService.businessId}/application/${shopId}/preview`;

    return this.http.get<ShopPreviewDTO>(endpoint, { params: { include, page: 'front' } });
  }

  getShopThemeActiveVersion(themeId: string): Observable<PebShopThemeVersion> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/version/active`);
  }

  getShopThemeById(themeId: PebShopThemeId): Observable<PebTheme> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getShopThemeVersionById(themeId: string, versionId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`);
  }

  getShopThemeVersions(themeId: any): Observable<PebShopThemeVersionEntity[]> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/versions`);
  }

  getShopThemesList(): Observable<any> {
    const { businessId, applicationId: siteId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${siteId}/themes`;

    return this.http.get(endpoint);
  }

  getApps(isDefault?: boolean): Observable<any[]> {
    console.log('get shops is undefined');

    return throwError('method is not implemented');
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
    return this.http
      .get<PebThemeDetailInterface>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/snapshot`);
  }

  getTemplateThemes(): Observable<PebShopThemeEntity[]> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`);
  }

  installTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}`
    + `/application/${this.envService.applicationId}/theme/${themeId}/install`, {});
  }

  instantInstallTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}`
   + `/application/${this.envService.applicationId}/template/${themeId}/instant-setup`, {});
  }

  // @toDO change after in builder editor implemented method for new api to publish theme
  publishShopThemeVersion(themeId: any, versionId: PebShopThemeVersionId): Observable<any> {
    return this.http.post(`${this.editorApiPath}/api/theme/${themeId}/publish`, {});
  }

  setAsDefaultApp(siteId: string): Observable<any> {
    return throwError('method is not implemented');
  }

  undoAction(themeId: any, actionId: string): any {
    return this.http.delete(`${this.editorApiPath}/api/theme/${themeId}/action/${actionId}`);
  }

  updateShopThemeDefaultScreen(themeId: string, defaultScreen: PebScreen): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/screen`, { defaultScreen });
  }

  updateReplicas(themeId: string, actions: PebAction[]): Observable<PebThemeDetailInterface> {
    return this.http.put<PebThemeDetailInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/actions/apply`,
      actions,
    );
  }

  updateApp(payload: any): Observable<any> {
    return throwError('method is not implemented');
  }

  updateAppDeploy(siteId: string, payload: any): Observable<any> {
    return throwError('method is not implemented');
  }

  getCurrentShopPreview(siteId, currentDetail, diff) {
    const endpoint = `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${siteId}/preview`;
    const params = Object.assign(
      {},
      currentDetail ? { currentDetail: JSON.stringify(currentDetail) } : null,
      diff ? { diff: JSON.stringify(diff) } : null,
    );

    return this.http.get(endpoint, { params });
  }

  updateShopThemeName(themeId: any, name: string): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/name`, { name });
  }

  updateShopThemePreview(themeId: any, imagePreview: string): Observable<void> {
    return this.http.put<any>(`${this.editorApiPath}/api/theme/${themeId}/image-preview`, { imagePreview });
  }

  updateThemeSourcePagePreviews(
    themeId: PebShopThemeId,
    sourceId: PebShopThemeSourceId,
    previews: PebShopThemeSourcePagePreviews,
  ): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/source/${sourceId}/previews`, previews);
  }

  uploadImage(container: string, file: File, returnShortPath?: boolean): Observable<PebShopImageResponse> {
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
          // console.error('Behavior threw error: ', err);
          return of(null);
        }));
  }

  uploadImageWithProgress(container: string, file: File, returnShortPath?: boolean): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/image/business/${this.envService.businessId}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    ).pipe(
      map((event: HttpEvent<PebShopImageResponse>) => {
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
        // console.error('Behavior threw error: ', err);
        return of(null);
      }));
  }

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
          // console.error('Behavior threw error: ', err);
          return of(null);
        }));
  }

  uploadVideoWithProgress(container: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/video/business/${this.envService.businessId}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    ).pipe(
      map((event: HttpEvent<PebShopImageResponse>) => {
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
        // console.error('Behavior threw error: ', err);
        return of(null);
      }));
  }


  patchShape(id: string, shape): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId}/shape/${id}`, shape);
  }

  deleteShape(shapeId: string): Observable<any> {
    return this.http.delete(`${this.editorApiPath}/api/application/${this.envService.applicationId}/shape/${shapeId}`);
  }

  postShape(shape: any): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId}/shape`, shape);
  }

  getShapes(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId}/shape`);
  }

  getShapesByAlbum(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/application/${this.envService.applicationId}/shape/album${albumId ? `/${albumId}` : ''}`);
  }

  getShape(shapeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId}/shape/${shapeId}`);
  }

  patchShapeAlbum(albumId: string, album: any): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/application/${this.envService.applicationId}/shape-album/${albumId}`;

    return this.http.patch<any>(endpoint, album);
  }

  postShapeAlbum(album: any): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId}/shape-album`, album);
  }

  getShapeAlbums(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${this.envService.applicationId}/shape-album`);
  }

  deleteShapeAlbum(albumId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.editorApiPath}/api/application/${this.envService.applicationId}/shape-album/${albumId}`);
  }

  updateThemeVersion(themeId: string, versionId: string, body: any): Observable<any> {
    return this.http.patch(`${this.editorApiPath}/theme/${themeId}/version/${versionId}`, body)
  }

  getTemplateShapes(): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/application/${this.envService.applicationId}/shape/template`);
  }

  getTemplateShapeAlbums(): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/application/${this.envService.applicationId}/shape-album/template`);
  }

  getTemplateShapesByAlbum(albumId: string, { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/application/${this.envService.applicationId}`
      + `/shape/template/album${albumId ? `/${albumId}` : ''}`,
      { params: { offset: offset.toString(), limit: limit.toString() } },
    );
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
}
