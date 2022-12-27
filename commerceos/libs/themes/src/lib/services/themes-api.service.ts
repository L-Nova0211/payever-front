import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  pebCreateEmptyShop,
  PebEnvService,
  PebPaginationParams,
  PebShopThemeEntity,
} from '@pe/builder-core';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { PeThemesRequestsErrorsEnum, PeThemeTypesEnum } from '../enums';

export const THEMES_API_PATH = new InjectionToken<string>('THEMES_API_PATH');

@Injectable()
export class ThemesApi {
  public applicationId: string;

  constructor(
    private apmService: ApmService,
    private httpClient: HttpClient,

    private pebEnvService: PebEnvService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,

    @Inject(THEMES_API_PATH) private themesApiPath: string,
  ) { }

  private get applicationPath(): string {
    const { applicationId, businessId, shopId } = this.pebEnvService;

    return `${this.themesApiPath}/api/business/${businessId}/application/${applicationId ?? shopId}`;
  }

  public getThemesList(): Observable<any> {
    return this.httpClient
      .get(`${this.applicationPath}/themes`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemesList, error, true);

          return throwError(error);
        }));
  }

  public getTemplateList(filters: Array<{ field: string, condition: string, value: string }> = []): Observable<any> {
    const params: { [key: string]: string | string[] } = {};
    filters.forEach((filter, i) => {
      Object.entries(filter).forEach(([key, value]) => {
        params[`filters[${i}][${key}]`] = value;
      });
    });

    return this.httpClient
      .get(`${this.applicationPath}/theme/template`, { params })
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetTemplateList, error, true);

          return throwError(error);
        }));
  }

  public getThemeById(themeId: string): Observable<any> {
    return this.httpClient
      .get(`${this.themesApiPath}/api/theme/${themeId}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeById, error, true);

          return throwError(error);
        }));
  }

  public updateTheme(themeId: string, themeData: {
    name: string,
    type: PeThemeTypesEnum,
    picture: string,
  }): Observable<any> {
    return this.httpClient
      .patch(`${this.themesApiPath}/api/theme/${themeId}`, themeData)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.UpdateTheme, error, true);

          return throwError(error);
        }));
  }

  public getTemplateThemes({ offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.httpClient
      .get<any>(`${this.themesApiPath}/api/templates`, {
        params: { offset: offset.toString(), limit: limit.toString() },
      })
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetTemplateThemes, error, true);

          return throwError(error);
        }));
  }

  public getTemplateItemThemes(ids: string[], { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.httpClient
      .post<any>(`${this.themesApiPath}/api/template/themes`, { ids }, {
        params: { offset: offset.toString(), limit: limit.toString() },
      })
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetTemplateItemThemes, error, true);

          return throwError(error);
        }));
  }

  public getThemesByTemplateId(itemId: string[], { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.httpClient
      .post<any>(`${this.themesApiPath}/api/template/items`, { ids: itemId })
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemesByTemplateId, error, true);

          return throwError(error);
        }));
  }

  public duplicateTemplateTheme(themeId: string, folderId: string): Observable<PebShopThemeEntity> {
    return this.httpClient
      .post<PebShopThemeEntity>(
        `${this.applicationPath}/theme/${themeId}/duplicate`,
        folderId ? { folderId } : { },
      )
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.DuplicateTemplateTheme, error, true);

          return throwError(error);
        }));
  }

  public deleteTemplateTheme(themeId: string): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.applicationPath}/theme/${themeId}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.DeleteTemplateTheme, error, true);

          return throwError(error);
        }));
  }

  public instantInstallTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.httpClient
      .put<PebShopThemeEntity>(`${this.applicationPath}/template/${themeId}/instant-setup`, {})
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.InstantInstallTemplateTheme, error, true);

          return throwError(error);
        }));
  }

  public installTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.httpClient
      .post<PebShopThemeEntity>(`${this.applicationPath}/theme/${themeId}/install`, {})
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.InstallTemplateTheme, error, true);

          return throwError(error);
        }));
  }

  public switchTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.httpClient
      .put<PebShopThemeEntity>(`${this.applicationPath}/theme/${themeId}/switch`, {})
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.SwitchTemplateTheme, error, true);

          return throwError(error);
        }));
  }

  public createThemeAlbum(album: any): Observable<any> {
    return this.httpClient
      .post<any>(`${this.applicationPath}/theme-album`, album)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.CreateThemeAlbum, error, true);

          return throwError(error);
        }));
  }

  public updateThemeAlbum(albumId: string, album: any): Observable<any> {
    return this.httpClient
      .patch<any>(`${this.applicationPath}/theme-album/${albumId}`, album)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.UpdateThemeAlbum, error, true);

          return throwError(error);
        }));
  }

  public getThemeBaseAlbum(): Observable<any> {
    return this.httpClient
      .get<any>(`${this.applicationPath}/theme-album`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeBaseAlbum, error, true);

          return throwError(error);
        }));
  }

  public getThemeAlbumById(albumId: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.applicationPath}/theme-album/${albumId}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeAlbumById, error, true);

          return throwError(error);
        }));
  }

  public getThemeAlbumByParent(albumId: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.applicationPath}/theme-album/parent/${albumId}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeAlbumByParent, error, true);

          return throwError(error);
        }));
  }

  public getThemeAlbumByAncestor(albumId: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.applicationPath}/theme-album/ancestor/${albumId}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeAlbumByAncestor, error, true);

          return throwError(error);
        }));
  }

  public deleteThemeAlbum(albumId: string): Observable<any> {
    return this.httpClient
      .delete<any>(`${this.applicationPath}/theme-album/${albumId}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.DeleteThemeAlbum, error, true);

          return throwError(error);
        }));
  }

  public getThemeByAlbum(
    albumId?: string,
    pagination?: PebPaginationParams,
    filters: Array<{ field: string, condition: string, value: string }> = []
  ): Observable<any> {
    const { offset = 0, limit = 100 } = pagination;
    const params: { [key: string]: string | string[] } = { offset: offset.toString(), limit: limit.toString() };
    if (albumId) {
      params.albumId = albumId;
    }

    return this.httpClient
      .get<any>(`${this.applicationPath}/theme/album`, { params })
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeByAlbum, error, true);

          return throwError(error);
        }));
  }

  public linkThemeToAlbum(themeId: string, albumId?: string): Observable<any> {
    return this.httpClient
      .post<any>(`${this.applicationPath}/theme/${themeId}/album/${albumId}`, {})
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.LinkThemeToAlbum, error, true);

          return throwError(error);
        }));
  }

  public unlinkTheme(themeId: string): Observable<any> {
    return this.httpClient
      .delete<any>(`${this.applicationPath}/theme/${themeId}/album`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.UnlinkTheme, error, true);

          return throwError(error);
        }));
  }

  public createApplicationTheme(name: string, folderId?: string): Observable<any> {
    const content = pebCreateEmptyShop()
    const targetFolderId = folderId
      ? { targetFolderId: folderId }
      : { };

    return this.httpClient
      .post<any>(`${this.applicationPath}/theme`, { content, name, ...targetFolderId })
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.CreateApplicationTheme, error, true);

          return throwError(error);
        }));
  }

  public duplicateThemeAlbum(payload: { albumIds: string[], parent?: string, prefix?: string }): Observable<any> {
    return this.httpClient
      .post<any>(`${this.applicationPath}/theme-album/duplicate`, payload)
      .pipe(
        catchError(error => {
          this.errorHandler(PeThemesRequestsErrorsEnum.DuplicateThemeAlbum, error, true);

          return throwError(error);
        }));
  };

  private errorHandler(description: string, error: any, showWarning?: boolean): void {
    const errorDescription = this.translateService.translate(description);

    if (showWarning) {
      this.snackbarService.toggle(true, {
        content: errorDescription,
        duration: 15000,
        iconColor: '#E2BB0B',
        iconId: 'icon-alert-24',
        iconSize: 24,
      });
    }
    this.apmService.apm.captureError(`${errorDescription} ms: ${JSON.stringify(error)}`);
  }
}
