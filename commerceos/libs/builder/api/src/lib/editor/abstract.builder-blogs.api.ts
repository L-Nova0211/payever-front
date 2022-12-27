import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebPageId } from '@pe/builder-core';

@Injectable()
export abstract class PebBuilderBlogsApi {

  abstract getBlogPreview(blogId: string, include?: string[]): Observable<any>;
  abstract getBlogActiveTheme(blogId: string): Observable<any>;
  abstract getBlogThemeActiveVersion(themeId: string): Observable<any>;
  abstract getCurrentBlogPreview(
    blogId: string,
    currentDetail?: boolean,
    diff?: boolean,
    page?: string,
  ): Observable<any>;

  abstract getBlogThemeById(themeId: string): Observable<any>;
  abstract getThemeDetail(themeId: string, page?:string): Observable<any>;
  abstract getPageAlbumsTree(blogId: string, themeId: string): Observable<any>;


  abstract getPage(
    themeId: string, pageId: PebPageId, screen?:string,
  ): Observable<any>;

  protected constructor() {}
}
