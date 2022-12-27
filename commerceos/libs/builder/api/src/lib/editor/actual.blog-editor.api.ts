import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { PebEnvService } from '@pe/builder-core';

import { PebBuilderBlogsApi } from './abstract.builder-blogs.api';

export const PEB_BLOG_API_BUILDER_PATH = new InjectionToken<string>('PEB_BLOG_API_BUILDER_PATH');

@Injectable()
export class PebActualBlogEditorApi implements PebBuilderBlogsApi {

  constructor(
    @Inject(PEB_BLOG_API_BUILDER_PATH) private editorApiPath: string,
    private envService: PebEnvService,
    private http: HttpClient,
  ) { }

  getBlogThemeById(themeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getThemeDetail(themeId: string, page?: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/theme/${themeId}/detail`,
      { params: page ? { page } : null },
    );
  }

  getPage(themeId: string, pageId: string, screen?: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/theme/${themeId}/page/${pageId}`,
      { params: screen ? { screen } : null },
    );
  }

  getBlogPreview(blogId: string, include?: string[]): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${blogId}/preview`,
    );
  }

  getBlogActiveTheme(blogId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${blogId}/themes/active`,
    );
  }

  getBlogThemeActiveVersion(themeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/version/active`);
  }

  getCurrentBlogPreview(blogId: string, currentDetail: boolean, diff: boolean, page: string = null): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${blogId}/preview`;
    const params = Object.assign(
      {},
      currentDetail ? { currentDetail: JSON.stringify(currentDetail) } : null,
      diff ? { diff: JSON.stringify(diff) } : null,
      page ? { page } : null,
    );

    return this.http.get<any>(endpoint, { params });
  }

  getPageAlbumsTree(blogId: string, themeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${blogId}/theme/${themeId}/page-album/tree`);
  }

}
