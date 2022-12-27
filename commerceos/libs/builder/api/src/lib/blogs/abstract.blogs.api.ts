import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebBlog, PebThemeDetailInterface } from '@pe/builder-core';

export interface BlogPreviewDTO {
  current: PebThemeDetailInterface;
  published: null|PebBlog;
}

export interface PebSingleBlog {
  isDefault: boolean;
  id: string;
  name: string;
  picture: string;
  channelSet: {
    id: string;
  };
  business: {
    id: string;
    name: string;
    defaultLanguage: string;
  };
  accessConfig: PebBlogAccessConfig;
  businessId: string;
}

export interface PebBlogAccessConfig {
  isLive: boolean;
  isPrivate: boolean;
  isLocked: boolean;
  id: string;
  internalDomain: string;
  internalDomainPattern: string;
  ownDomain: string;
  createdAt: string;
  privateMessage: string;
}

@Injectable()
export abstract class PebBlogsApi {

  abstract getBlogsList(isDefault?: boolean): Observable<any[]>;

  abstract getSingleBlog(applicationId: string): Observable<PebSingleBlog>;

  abstract createBlog(payload: any): Observable<any>;

  abstract validateBlogName(name: string): Observable<any>;

  abstract deleteBlog(applicationId: string): Observable<null>;

  abstract updateBlog(applicationId: string, payload: any): Observable<any>;

  abstract markBlogAsDefault(applicationId: string): Observable<any>;

  abstract updateBlogAccessConfig(
    applicationId: string,
    payload: Partial<PebBlogAccessConfig>,
  ): Observable<PebBlogAccessConfig>;

  abstract checkIsLive(applicationId: string): Observable<boolean>;

  abstract updateBlogDeploy(applicationId: string, payload: any): Observable<any>;

  abstract patchIsLive(applicationId: string, isLive: boolean): Observable<null>;

  abstract addSocialImage(accessId: string, picture: string): Observable<any>;

  abstract getAllDomains(applicationId: string): Observable<any>;

  abstract addDomain(applicationId: string, domain: string): Observable<any>;

  abstract checkDomain(applicationId: string, domainId: string): Observable<any>;

  abstract patchDomain(applicationId: string, domainId: string, domain: string): Observable<any>;

  abstract deleteDomain(applicationId: string, domainId: string): Observable<any>;
}
