import { Observable } from 'rxjs';

import {
  PebAction,
  PebPageId, PebPaginationParams,
  PebScreen,
  PebShapesAlbum,
  PebShapesShape,
  PebShop,
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
  PebStylesheet,
  PebStylesheetId,
  PebTheme,
  PebThemeDetailInterface,
  PebThemePageInterface,
  PebThemeShortPageInterface,
  ThemeVersionInterface,
} from '@pe/builder-core';

import { ShopPreviewDTO } from '../shops/abstract.shops.api';

export interface CreateShopThemePayload {
  name?: string;
  namePrefix?: string;
  content: PebShop;
}

export type CreateShopThemeDto = any;

export abstract class PebEditorApi {
  abstract getBusinessApps(): Observable<{ [appType: string]: any[] }>;

  abstract getAllAvailableThemes(): Observable<PebShopTheme[]>;

  abstract createTheme(input: CreateShopThemePayload): Observable<any>;

  abstract createShopTheme(input: CreateShopThemePayload): Observable<CreateShopThemeDto>;

  abstract addAction(shopId: any, action: PebAction);

  abstract undoAction(themeId: string, actionId: string): Observable<null>;

  abstract updateReplicas(
    themeId: string,
    actions: PebAction[],
  ): Observable<PebThemeDetailInterface>;

  abstract getShopThemeVersions(themeId: string): Observable<PebShopThemeVersionEntity[]>;

  abstract getShopThemeVersionById(themeId: string, versionId: string): Observable<any>;

  abstract getShopThemeActiveVersion(themeId: string): Observable<PebShopThemeVersion>;

  abstract createShopThemeVersion(themeId: string, name?: string): Observable<PebShopThemeVersionEntity>;

  abstract deleteShopThemeVersion(themeId: string, versionId: PebShopThemeVersionId): Observable<any>;

  abstract activateShopThemeVersion(
    shopId: any,
    versionId: PebShopThemeVersionId,
  ): Observable<ThemeVersionInterface>;

  abstract publishShopThemeVersion(themeId: string, versionId: PebShopThemeVersionId): Observable<any>;

  abstract getShopActiveTheme(): Observable<{
    id: string,
    theme: string,
    isActive: boolean,
    isDeployed: boolean,
  }>;

  abstract updateShopThemePreview(themeId: string, imagePreview: string): Observable<void>;

  abstract updateShopThemeName(themeId: string, name: string): Observable<any>;

  abstract updateShopThemeDefaultScreen(themeId: string, defaultScreen: PebScreen): Observable<any>;

  abstract generateTemplateTheme(
    category: string,
    page: string,
    theme: string,
    logo?: string,
  ): Observable<PebShopGeneratedThemeResponse>;

  abstract updateThemeSourcePagePreviews(
    themeId: PebShopThemeId,
    sourceId: PebShopThemeSourceId,
    previews: PebShopThemeSourcePagePreviews,
  ): Observable<any>;

  abstract getThemeDetail(themeId: PebShopThemeId, page?: string): Observable<PebThemeDetailInterface>;

  abstract getSnapshotByVersionId(
    themeId: PebShopThemeId,
    versionId: PebShopThemeVersionId,
  ): Observable<PebThemeDetailInterface>;

  abstract updateThemeVersion(themeId: string, versionId: string, body: any): Observable<any>;

  abstract getPages(themeId: PebShopThemeId): Observable<PebThemeShortPageInterface[]>;

  abstract getPage(
    themeId: PebShopThemeId, pageId: PebPageId, screen?: string,
  ): Observable<PebThemePageInterface>;

  abstract getPageStylesheet(
    themeId: PebShopThemeId,
    pageId: PebPageId,
    screen: string,
  ): Observable<{ id: PebStylesheetId, stylesheet: { [s: string]: PebStylesheet } }>;

  abstract getActions(themeId: PebShopThemeId, limit?: number, offset?: number): Observable<PebAction[]>;

  abstract getPageActions(themeId: PebShopThemeId, pageId: PebPageId): Observable<PebAction[]>;

  // TODO: Should be deprecated
  abstract uploadImage(container: string, file: File, returnShortPath?: boolean): Observable<PebShopImageResponse>;

  // TODO: Should be deprecated
  abstract uploadImageWithProgress(container: string, file: File, returnShortPath?: boolean): Observable<any>;

  // TODO: Should be deprecated
  abstract uploadVideo(container: string, file: File): Observable<PebShopImageResponse>;

  // TODO: Should be deprecated
  abstract uploadVideoWithProgress(container: string, file: File): Observable<any>;

  /** @deprecated: Use PebThemesApi.getThemesList instead */
  abstract getShopThemesList(): Observable<any>;

  abstract getShopThemeById(themeId: PebShopThemeId): Observable<PebTheme>;

  /** @deprecated: Use PebThemesApi.getTemplateThemes instead */
  abstract getTemplateThemes(): Observable<PebShopThemeEntity[]>;

  /** @deprecated: Use PebThemesApi.installTemplateTheme instead */
  abstract installTemplateTheme(themeId: string): Observable<PebShopThemeEntity>;

  /** @deprecated: Use PebThemesApi.instantInstallTemplateTheme instead */
  abstract instantInstallTemplateTheme(themeId: string): Observable<PebShopThemeEntity>;

  /** @deprecated: Use PebThemesApi.deleteTemplateTheme instead */
  abstract deleteTemplateTheme(themeId: string): Observable<void>;

  /** @deprecated: Use PebThemesApi.duplicateTemplateTheme instead */
  abstract duplicateTemplateTheme(themeId: string): Observable<PebShopThemeEntity>;

  /** @deprecated: Use PebShopsApi.getShopsList instead */
  abstract getApps(isDefault?: boolean): Observable<any[]>;

  /** @deprecated: Use PebShopsApi.getSingleShop instead */
  abstract getApp(appId: string): Observable<any>;

  /** @deprecated: Use PebShopsApi.createShop instead */
  abstract createApp(payload: any): Observable<any>;

  /** @deprecated: Use PebShopsApi.deleteShop instead */
  abstract deleteApp(shopId: string): Observable<null>;

  /** @deprecated: Use PebShopsApi.updateShop instead */
  abstract updateApp(payload: any): Observable<any>;

  /** @deprecated: Use PebShopsApi.markShopAsDefault instead */
  abstract setAsDefaultApp(shopId: string): Observable<any>;

  /** @deprecated: Use PebShopsApi.updateShopDeploy instead */
  abstract updateAppDeploy(accessId: string, payload: any): Observable<any>;

  /** @deprecated: Use PebShopsApi.getShopPreview instead */
  abstract getShopPreview(shopId: string, include?: string): Observable<ShopPreviewDTO>;

  abstract getCurrentShopPreview(
    shopId: string,
    currentDetail?: boolean,
    diff?: boolean,
    page?: string,
  ): Observable<ShopPreviewDTO>;

  abstract getPageAlbumsTree(shopId: string, themeId: string): Observable<any>;

  abstract getPageAlbumsFlatTree(shopId: string, themeId: string): Observable<any>;

  abstract getPageAlbums(shopId: string, themeId: string): Observable<any>;

  abstract createPageAlbum(shopId: string, themeId: string, album: any): Observable<any>;

  abstract deletePageAlbum(shopId: string, themeId: string, albumId: string, album: any): Observable<any>;

  abstract updatePageAlbum(shopId: string, themeId: string, albumId: string, album: any): Observable<any>;

  abstract getPageAlbumById(shopId: string, themeId: string, albumId: string): Observable<any>;

  abstract getPageAlbumByParent(shopId: string, themeId: string, parentId: string): Observable<any>;

  abstract getPageByAlbum(
    shopId: string,
    themeId: string,
    albumId: string,
    pagination?: PebPaginationParams,
  ): Observable<any>;

  abstract linkPageToAlbum(shopId: string, themeId: string, pageId: string, albumId: string): Observable<any>;

  abstract postShape(shape: Partial<PebShapesShape>): Observable<PebShapesShape>;

  abstract patchShape(id: string, shape: Partial<PebShapesShape>): Observable<PebShapesShape>;

  abstract deleteShape(id: string): Observable<any>;

  abstract getShapes(): Observable<PebShapesShape[]>;

  abstract getShapesByAlbum(albumId: string, pagination?: PebPaginationParams): Observable<PebShapesShape[]>;

  abstract getShape(shapeId: string): Observable<PebShapesShape>;

  abstract patchShapeAlbum(albumId: string, album: Partial<PebShapesAlbum>): Observable<any>;

  abstract postShapeAlbum(album: Partial<PebShapesAlbum>): Observable<any>;

  abstract deleteShapeAlbum(albumId: string): Observable<any>;

  abstract getShapeAlbums(): Observable<PebShapesAlbum[]>;

  abstract getTemplateShapes(): Observable<PebShapesShape[]>;

  abstract getTemplateShapeAlbums(): Observable<PebShapesAlbum[]>;

  abstract getTemplateShapesByAlbum(albumId: string, pagination?: PebPaginationParams): Observable<PebShapesShape[]>;
}
