import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { PebEnvService } from '@pe/builder-core';
import { EnvService } from '@pe/common';

import { PebBlogAccessConfig, PebBlogsApi, PebSingleBlog } from './abstract.blogs.api';

export const PEB_BLOG_API_PATH = new InjectionToken<string>('PEB_BLOG_API_PATH');

@Injectable()
export class ActualBlogApi implements PebBlogsApi {

  constructor(
    private http: HttpClient,
    @Inject(EnvService) private envService: PebEnvService,
    @Inject(PEB_BLOG_API_PATH) private blogApiPath: string,
  ) { }

  getBlogsList(): Observable<any[]> {
    const endpoint = `${this.blogApiPath}/business/${this.envService.businessId}/blog`;

    return this.http.get<any[]>(endpoint);
  }

  getSingleBlog(applicationId: string): Observable<PebSingleBlog> {
    const endpoint = `${this.blogApiPath}/business/${this.envService.businessId}/blog/${applicationId}`;

    return this.http.get<PebSingleBlog>(endpoint);
  }

  createBlog(payload: any): Observable<any> {
    const endpoint = `${this.blogApiPath}/business/${this.envService.businessId}/blog`;

    return this.http.post<any>(endpoint, payload);
  }

  validateBlogName(name: string): Observable<any> {
    const endpoint = `${this.blogApiPath}/business/${this.envService.businessId}/blog/isValidName?name=${name}`;

    return this.http.get(endpoint);
  }

  deleteBlog(applicationId: string): Observable<null> {
    const endpoint = `${this.blogApiPath}/business/${this.envService.businessId}/blog/${applicationId}`;

    return this.http.delete<null>(endpoint);
  }

  updateBlog(applicationId: string, payload: any): Observable<any> {
    const endpoint = `${this.blogApiPath}/business/${this.envService.businessId}/blog/${applicationId}`;

    return this.http.patch<any>(endpoint, payload);
  }

  markBlogAsDefault(applicationId: string): Observable<any> {
    const endpoint = `${this.blogApiPath}/business/${this.envService.businessId}/blog/${applicationId}/default`;

    return this.http.patch<any>(endpoint, {});
  }

  updateBlogDeploy(applicationId: string, payload: any): Observable<any> {
    const endpoint = `${this.blogApiPath}/business/${this.envService.businessId}/blog/access/${applicationId}`;

    return this.http.patch<any>(endpoint, payload);
  }

  updateBlogAccessConfig(
    applicationId: string,
    payload: Partial<PebBlogAccessConfig>,
    ): Observable<PebBlogAccessConfig> {

      return this.http.patch<PebBlogAccessConfig>(
      `${this.blogApiPath}/business/${this.envService.businessId}/blog/access/${applicationId}`,
      payload,
    );
  }

  checkIsLive(applicationId: string): Observable<boolean> {

    return this.http.get<boolean>(
      `${this.blogApiPath}/business/${this.envService.businessId}/blog/access/${applicationId}/is-live`,
    );
  }

  patchIsLive(applicationId: string, isLive: boolean): Observable<null> {

    return this.http.patch<null>(
      `${this.blogApiPath}/business/${this.envService.businessId}/blog/access/${applicationId}`,
      { isLive },
    );
  }

  addSocialImage(accessId: string, picture: string) {

    return this.http.patch(
      `${this.blogApiPath}/business/${this.envService.businessId}/blog/access/${accessId}`,
      { socialImage: picture },
    );
  }

  getAllDomains(applicationId: string): Observable<any> {

    return this.http.get(
      `${this.blogApiPath}/business/${this.envService.businessId}/blog/${applicationId}/domain`,
    );
  }

  addDomain(applicationId: string, domain: string): Observable<any> {

    return this.http.post(
      `${this.blogApiPath}/business/${this.envService.businessId}/blog/${applicationId}/domain`,
      { name: domain },
    );
  }

  checkDomain(applicationId: string, domainId: string): Observable<any> {

    return this.http.post(
      `${this.blogApiPath}/business/${this.envService.businessId}/blog/${applicationId}/domain/${domainId}/check`,
      {},
    );
  }

  patchDomain(applicationId: string, domainId: string, domain: string): Observable<any> {

    return this.http.patch(
      `${this.blogApiPath}/business/${this.envService.businessId}/blog/${applicationId}/domain/${domainId}`,
      { name: domain },
    );
  }

  deleteDomain(applicationId: string, domainId: string): Observable<any> {

    return this.http.delete(
      `${this.blogApiPath}/business/${this.envService.businessId}/blog/${applicationId}/domain/${domainId}`,
    );
  }

}
