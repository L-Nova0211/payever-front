import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  PebEditorApi,
  PEB_EDITOR_API_PATH,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_STORAGE_PATH, CreateShopThemePayload,
} from '@pe/builder-api';
import {
  PebAction,
  PebPageId,
  PebPaginationParams,
  PebScreen,
  PebThemeDetailInterface,
  PebThemePageInterface,
  PebThemeShortPageInterface,
  ThemeVersionInterface,
} from '@pe/builder-core';
import { EnvService } from '@pe/common';

import { PEB_POS_API_PATH } from '../../constants/constants';

import { PosEnvService } from './pos-env.service';


@Injectable()
export class PebActualEditorApi implements PebEditorApi {

  constructor(
    @Inject(PEB_EDITOR_API_PATH) private editorApiPath: string,
    @Inject(PEB_POS_API_PATH) private posApiPath: string,
    @Inject(PEB_GENERATOR_API_PATH) private apiGeneratorPath: string,
    @Inject(PEB_MEDIA_API_PATH) private apiMediaPath: string,
    @Inject(PEB_STORAGE_PATH) private mediaStoragePath: string,
    @Inject(EnvService) private envService: PosEnvService,
    private http: HttpClient,
  ) {
  }

  getBusinessApps(): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/business/${this.envService.businessId}/list`);
  }

  getCurrentShopPreview(applicationId: string, currentDetail: boolean, diff: boolean): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.envService.businessId}`
    + `/application/${applicationId}/preview`;

    const params = Object.assign(
      {},
      currentDetail ? { currentDetail: JSON.stringify(currentDetail) } : null,
      diff ? { diff: JSON.stringify(diff) } : null,
    );

    return this.http.get(endpoint, { params });
  }

  getThemeDetail(themeId: string, page?: string): Observable<PebThemeDetailInterface> {
    return this.http.get<PebThemeDetailInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/detail`,
      { params: page ? { page } : null },
    );
  }

  getSnapshotByVersionId(
    themeId: string,
    versionId: string,
  ): Observable<PebThemeDetailInterface> {
    return this.http.get<PebThemeDetailInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/snapshot`);
  }

  getPages(themeId: string): Observable<PebThemeShortPageInterface[]> {
    return this.http.get<PebThemeShortPageInterface[]>(`${this.editorApiPath}/api/theme/${themeId}/pages`);
  }

  getPage(themeId: string, pageId: PebPageId, screen?: string): Observable<PebThemePageInterface> {
    return this.http.get<PebThemePageInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/page/${pageId}`,
      { params: screen ? { screen } : null },
    );
  }

  getPageStylesheet(
    themeId: string, pageId: PebPageId, screen: string,
  ): Observable<any> {
    return this.http.get<PebThemePageInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/page/${pageId}/style/${screen}`,
    );
  }

  getPageActions(themeId: string, pageId: PebPageId, limit = 20, offset = 0): Observable<PebAction[]> {
    return this.http.get<PebAction[]>(
      `${this.editorApiPath}/api/theme/${themeId}/page/${pageId}/actions`,
      { params: limit ? { limit: `${limit}`, offset: `${offset}` } : {} },
    );
  }

  getActions(themeId: string, limit = 20, offset = 0): Observable<PebAction[]> {
    return this.http.get<PebAction[]>(
      `${this.editorApiPath}/api/theme/${themeId}/actions`,
      { params: limit ? { limit: `${limit}`, offset: `${offset}` } : {} },
    );
  }

  getAllAvailableThemes(): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/themes`;

    return this.http.get<any[]>(endpoint);
  }

  getShopThemesList(): Observable<any> {
    const { businessId, posId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${posId}/themes`;

    return this.http.get(endpoint);
  }

  getShopThemeById(themeId: string): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getShopActiveTheme(): Observable<any> {
    const { businessId, posId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${posId}/themes/active`;

    return this.http.get(endpoint);
  }

  createShopTheme(input): Observable<any> {
    return this.http.post(`${this.editorApiPath}/api/theme`, input);
  }

  addAction(applicationId: string, action: PebAction): Observable<any> {
    return this.http.post(`${this.editorApiPath}/api/theme/${applicationId}/action`, action);
  }

  undoAction(themeId: string, actionId: PebPageId): Observable<null> {
    return this.http.delete<null>(`${this.editorApiPath}/api/theme/${themeId}/action/${actionId}`);
  }

  updateReplicas(themeId: string, actions: PebAction[]): Observable<PebThemeDetailInterface> {
    return this.http.put<PebThemeDetailInterface>(
      `${this.editorApiPath}/api/theme/${themeId}/actions/apply`,
      actions,
    );
  }

  getShopThemeVersions(themeId: string): Observable<any[]> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/versions`);
  }

  getShopThemeVersionById(themeId: string, versionId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`);
  }

  getShopThemeActiveVersion(themeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/version/active`);
  }

  createShopThemeVersion(themeId: string, name?: string): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/theme/${themeId}/version`, { name });
  }

  updateShopThemeDefaultScreen(themeId: string, defaultScreen: PebScreen): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/screen`, { defaultScreen });
  }

  updateShopThemePreview(themeId: string, imagePreview: string): Observable<any> {
    return this.http.put<any>(`${this.editorApiPath}/api/theme/${themeId}/image-preview`, { imagePreview });
  }

  updateShopThemeName(themeId: string, name: string): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/name`, { name });
  }

  deleteShopThemeVersion(themeId: string, versionId: string): Observable<any> {
    return this.http.delete(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`);
  }

  activateShopThemeVersion(themeId: string, versionId: string): Observable<ThemeVersionInterface> {
    return this.http.put<any>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/restore`, null);
  }

  publishShopThemeVersion(themeId: string, versionId: string): Observable<any> {
    return this.http.put(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/publish`, {});
  }

  updateThemeVersion(themeId: string, versionId: string, body: any): Observable<any> {
    return this.http.patch(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`, body);
  }

  getTemplateThemes(): Observable<any[]> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`);
  }

  generateTemplateTheme(
    category: string,
    page: string,
    theme: string,
    logo?: string,
  ): Observable<any> {
    const payload = {
      category,
      page,
      theme,
      logo,
    };

    return this.http.post(
      `${this.apiGeneratorPath}/api/builder-generator/business/${this.envService.businessId}/generate`,
      payload,
    );
  }

  updateThemeSourcePagePreviews(
    themeId: string,
    sourceId: string,
    previews,
  ): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/source/${sourceId}/previews`, previews);
  }

  installTemplateTheme(themeId: string): Observable<any> {
    return this.http.post(`${this.editorApiPath}/api/business/${this.envService.businessId}`
    +`/application/${this.envService.posId}/theme/${themeId}/install`, {});
  }

  instantInstallTemplateTheme(themeId: string): Observable<any> {
    return this.http.put(`${this.editorApiPath}/api/business/${this.envService.businessId}`
    + `/application/${this.envService.posId}/template/${themeId}/instant-setup`, {});
  }

  deleteTemplateTheme(themeId: string): Observable<void> {
    return this.http.delete<void>(`${this.editorApiPath}/api/business/${this.envService.businessId}`
    + `/application/${this.envService.posId}/theme/${themeId}`, {});
  }

  duplicateTemplateTheme(themeId: string): Observable<any> {
    return this.http.post(`${this.editorApiPath}/api/business/${this.envService.businessId}`
    + `/application/${this.envService.posId}/theme/${themeId}/duplicate`, {});
  }

  getShops(isDefault?: boolean): Observable<any[]> {
    return this.http.get<any[]>(`${this.posApiPath}/business/${this.envService.businessId}/terminal`, {
      params: isDefault ? { isDefault: JSON.stringify(isDefault) } : null,
    });
  }

  getShop(): Observable<any> {
    return this.http.get<any[]>(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/${this.envService.posId}`);
  }

  updateShopDeploy(accessId: string, payload: any): Observable<any> {
    return this.http.patch<any[]>(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/access/${accessId}`,
      payload,
    );
  }

  createShop(payload: any): Observable<any> {
    return this.http.post<any[]>(`${this.posApiPath}/business/${this.envService.businessId}/terminal`, payload);
  }

  deleteShop(applicationId: string): Observable<null> {
    return this.http
      .delete<null>(`${this.posApiPath}/business/${this.envService.businessId}/terminal/${applicationId}`);
  }

  setAsDefaultShop(applicationId: string): Observable<any> {
    return this.http.put<any>(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/${applicationId}/default`, {});
  }

  updateShop(payload: any): Observable<any> {
    return this.http.patch<any[]>(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/${this.envService.posId}`,
      payload,
    );
  }

  // TODO(@mivnv): Move it to the media service
  uploadImage(container: string, file: File, returnShortPath: boolean): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(
      `${this.apiMediaPath}/api/image/business/${this.envService.businessId}/${container}`,
      formData,
    )
      .pipe(
        map((response: any) => {
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
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(
      `${this.apiMediaPath}/api/image/business/${this.envService.businessId}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    ).pipe(
      map((event: any) => {
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
  uploadVideo(container: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(
      `${this.apiMediaPath}/api/video/business/${this.envService.businessId}/${container}`,
      formData,
    )
      .pipe(
        map((response: any) => {
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
  uploadVideoWithProgress(container: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(
      `${this.apiMediaPath}/api/video/business/${this.envService.businessId}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    ).pipe(
      map((event: any) => {
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

  getShopPreview(applicationId: string, include: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.envService.businessId}`
    + `/application/${applicationId}/preview`;

    return this.http.get<any>(endpoint, { params: { include, page: 'front' } });
  }

  getShopPreviewPages(applicationId: string, pageId?: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/application/${applicationId}/source/pages/${pageId ? pageId : ''}`);
  }

  // SHAPES

  postShape(shape: any): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/application/${this.envService.posId}/shape`, shape);
  }

  getShapes(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${this.envService.posId}/shape`);
  }

  getShapesByAlbum(albumId: string, { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/application/${this.envService.posId}/shape/album${albumId ? `/${albumId}` : ''}`,
      { params: { offset: offset.toString(), limit: limit.toString() } },
    );
  }


  getShape(shapeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${this.envService.posId}/shape/${shapeId}`);
  }

  patchShape(id: string, shape): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/application/${this.envService.posId}/shape/${id}`, shape);
  }

  deleteShape(shapeId: string): Observable<any> {
    return this.http.delete(`${this.editorApiPath}/api/application/${this.envService.posId}/shape/${shapeId}`);
  }

  patchShapeAlbum(albumId: string, album: any): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/application/${this.envService.posId}/shape-album/${albumId}`;

    return this.http.patch<any>(endpoint, album);
  }

  postShapeAlbum(album: any): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/application/${this.envService.posId}/shape-album`, album);
  }

  getShapeAlbums(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${this.envService.posId}/shape-album`);
  }

  deleteShapeAlbum(albumId: string): Observable<any> {
    return this.http
      .delete<any>(`${this.editorApiPath}/api/application/${this.envService.posId}/shape-album/${albumId}`);
  }

  getTemplateShapes(): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/application/${this.envService.posId}/shape/template`);
  }

  getTemplateShapeAlbums(): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/application/${this.envService.posId}/shape-album/template`);
  }

  getTemplateShapesByAlbum(albumId: string, { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/application/${this.envService.posId}`
      + `/shape/template/album${albumId ? `/${albumId}` : ''}`,
      { params: { offset: offset.toString(), limit: limit.toString() } },
    );
  }

  createApp(payload: any): Observable<any> {
    return undefined;
  }

  createPageAlbum(shopId: string, themeId: string, album: any): Observable<any> {
    return undefined;
  }

  createTheme(input: CreateShopThemePayload): Observable<any> {
    return undefined;
  }

  deleteApp(shopId: string): Observable<null> {
    return undefined;
  }

  deletePageAlbum(shopId: string, themeId: string, albumId: string, album: any): Observable<any> {
    return undefined;
  }

  getApp(appId: string): Observable<any> {
    return undefined;
  }

  getApps(isDefault?: boolean): Observable<any[]> {
    return undefined;
  }

  getPageAlbumById(shopId: string, themeId: string, albumId: string): Observable<any> {
    return undefined;
  }

  getPageAlbumByParent(shopId: string, themeId: string, parentId: string): Observable<any> {
    return undefined;
  }

  getPageAlbums(shopId: string, themeId: string): Observable<any> {
    return undefined;
  }

  getPageAlbumsFlatTree(shopId: string, themeId: string): Observable<any> {
    return undefined;
  }

  getPageAlbumsTree(shopId: string, themeId: string): Observable<any> {
    return undefined;
  }

  getPageByAlbum(shopId: string, themeId: string, albumId: string, pagination?: PebPaginationParams): Observable<any> {
    return undefined;
  }

  linkPageToAlbum(shopId: string, themeId: string, pageId: string, albumId: string): Observable<any> {
    return undefined;
  }

  setAsDefaultApp(shopId: string): Observable<any> {
    return undefined;
  }

  updateApp(payload: any): Observable<any> {
    return undefined;
  }

  updateAppDeploy(accessId: string, payload: any): Observable<any> {
    return undefined;
  }

  updatePageAlbum(shopId: string, themeId: string, albumId: string, album: any): Observable<any> {
    return undefined;
  }


}
