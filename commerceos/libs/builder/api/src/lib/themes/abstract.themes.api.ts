import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebPaginationParams } from '@pe/builder-core';

@Injectable()
export abstract class PebThemesApi {
  abstract getThemesList(): Observable<any>;

  abstract getThemeById(themeId: string): Observable<any>;

  abstract getTemplateThemes(pagination?: PebPaginationParams): Observable<any>;

  abstract getTemplateItemThemes(ids: string[], pagination?: PebPaginationParams): Observable<any>;

  abstract getThemesByTemplateId(itemId: string[], pagination?: PebPaginationParams):Observable<any>;

  abstract duplicateTemplateTheme(themeId: string, albumId?: string): Observable<any>;

  abstract duplicateThemeAlbum(payload: { albumIds: string[], parent?: string, prefix?: string }): Observable<any>

  abstract deleteTemplateTheme(themeId: string): Observable<void>;

  abstract instantInstallTemplateTheme(themeId: string): Observable<any>;

  abstract installTemplateTheme(themeId: string): Observable<any>;

  abstract switchTemplateTheme(themeId: string): Observable<any>;

  abstract createThemeAlbum(album: any): Observable<any>;

  abstract updateThemeAlbum(albumId: string, album: any): Observable<any>;

  abstract getThemeBaseAlbum(): Observable<any>;

  abstract getThemeAlbumById(albumId: string): Observable<any>;

  abstract getThemeAlbumByParent(albumId: string): Observable<any>;

  abstract getThemeAlbumByAncestor(albumId: string): Observable<any>;

  abstract deleteThemeAlbum(albumId: string): Observable<any>;

  abstract getThemeByAlbum(albumId?: string, pagination?: PebPaginationParams): Observable<any>;

  abstract linkThemeToAlbum(themeId: string, albumId?: string): Observable<any>;

  abstract unlinkTheme(themeId: string): Observable<any>;

  abstract createApplicationTheme(name: string): Observable<any>;

}
