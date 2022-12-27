import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, EnvService } from '@pe/common';
import { PE_ENV } from '@pe/common';

import { MediaType } from '../enums';
import {
  PeAttribute,
  PeCreateAlbumBody,
  PeCreateUserAttributeBody,
  PeCreateUserAttributeGroupBody,
  PeCreateUserAttributeGroupResponse,
  PeCreateUserMedia,
  PeStudioAlbum,
  PeStudioMedia,
  PeStudioPageOptions,
  PeUpdateUserMedia,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class StudioApiService {
  private readonly apiPath: string;

  constructor(
    private envService: EnvService,
    private http: HttpClient,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
    this.apiPath = (env.backend as any).studio;
  }

  getAllMedia(options: PeStudioPageOptions = {}): Observable<PeStudioMedia[]> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit);

    return this.http.get<PeStudioMedia[]>(`${this.apiPath}/api/${this.envService.businessId}/subscription`, {
      params,
    });
  }

  getSubscriptionMediaByAttribute(
    attributeId: string,
    attributeValue: string,
  ): Observable<PeStudioMedia[]> {
    return this.http.get<PeStudioMedia[]>(
      `${this.apiPath}/api/subscription/attribute/${attributeId}/${attributeValue}`,
    );
  }

  getOwnUserMedia(options: PeStudioPageOptions = {}): Observable<PeStudioMedia[]> {
    let params = new HttpParams();
    // todo: implement pagination with infinite scroll
    /* params = params.append('page', options.page);
    params = params.append('limit', options.limit);*/
    if (options.sort) {
      params = params.append(options.sort.order, options.sort.param);
    }

    return this.http.get<PeStudioMedia[]>(`${this.apiPath}/api/${this.envService.businessId}/media`, {
      params,
    });
  }

  searchUserMedia(name: string, options: PeStudioPageOptions = {}): Observable<PeStudioMedia[]> {
    let params = new HttpParams();
    // todo: implement pagination with infinite scroll
    /* params = params.append('page', options.page);
     params = params.append('limit', options.limit);*/
    params = params.append('name', name);
    if (options.sort) {
      params = params.append(options.sort.order, options.sort.param);
    }

    return this.http.get<PeStudioMedia[]>(`${this.apiPath}/api/${this.envService.businessId}/media/search`, {
      params,
    });
  }

  searchSubscriptions(
    name: string,
    options: PeStudioPageOptions = {},
  ): Observable<PeStudioMedia[]> {
    let params = new HttpParams();
    // todo: implement pagination with infinite scroll
    params = params.append('name', name);
    if (options.sort) {
      params = params.append(options.sort.order, options.sort.param);
    }

    return this.http.get<PeStudioMedia[]>(`${this.apiPath}/api/${this.envService.businessId}/subscription/search`, {
      params,
    });
  }

  getStudioGridFilters(options: PeStudioPageOptions = {}): Observable<PeAttribute[]> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit ?? '20');

    return this.http.get<PeAttribute[]>(`${this.apiPath}/api/attribute`, {
      params,
    });
  }

  getUserFilters(options: PeStudioPageOptions = {}): Observable<PeAttribute[]> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit ?? '20');

    return this.http.get<PeAttribute[]>(`${this.apiPath}/api/${this.envService.businessId}/attribute`, {
      params,
    });
  }

  getUserSubscriptionMediaById(mediaId: string): Observable<PeStudioMedia> {
    return this.http.get<any>(`${this.apiPath}/api/${this.envService.businessId}/media/${mediaId}`, {});
  }

  getSubscriptionMediaById(mediaId: string): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/api/${this.envService.businessId}/subscription/${mediaId}`, {});
  }

  deleteMultipleUserMedia(mediaIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiPath}/api/${this.envService.businessId}/medias/delete`, { ids: mediaIds });
  }

  deleteUserMedia(mediaId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiPath}/api/${this.envService.businessId}/media/${mediaId}`, {});
  }

  createUserMedia(body: PeCreateUserMedia, observe?: boolean): Observable<PeStudioMedia | HttpEvent<PeStudioMedia>> {
    const payload = {
      businessId: this.envService.businessId,
      ...body,
    };

    return this.http.post<PeStudioMedia>(
      `${this.apiPath}/api/${this.envService.businessId}/media`,
      payload,
      {
        ...(observe && { observe: 'events', reportProgress: true }),
      }
    );
  }

  updateUserMedia(body: PeUpdateUserMedia, observe?: boolean): Observable<PeStudioMedia | HttpEvent<PeStudioMedia>> {
    const { id, ...rest } = body;
    const payload = {
      businessId: this.envService.businessId,
      ...rest,
    };

    return this.http.patch<PeStudioMedia>(
      `${this.apiPath}/api/${this.envService.businessId}/media/${id}`,
      payload,
      {
        ...(observe && { observe: 'events', reportProgress: true }),
      }
    );
  }

  sendMediaFile<T>(file: File, type: MediaType, container: string): Observable<HttpEvent<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(
      `${this.env.backend.media}/api/${type}/business/${this.envService.businessId}/${container}`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
      }
    );
  }

  createAlbum(body: PeCreateAlbumBody): Observable<PeStudioAlbum> {
    return this.http.post<PeStudioAlbum>(`${this.apiPath}/api/${this.envService.businessId}/album`, body, {});
  }

  updateAlbum(albumId: string, body: PeCreateAlbumBody): Observable<PeStudioAlbum> {
    return this.http.patch<PeStudioAlbum>(
      `${this.apiPath}/api/${this.envService.businessId}/album/${albumId}`,
      body,
      {}
    );
  }

  addMultipleMediaToAlbum(ids: string[], albumId: string): Observable<PeStudioMedia[]> {
    return this.http.post<any>(
      `${this.apiPath}/api/${this.envService.businessId}/medias/add/album/${albumId}`,
      { ids }
    );
  }

  deleteAlbum(albumId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiPath}/api/${this.envService.businessId}/album/${albumId}`);
  }

  getUserAlbums(options: PeStudioPageOptions = {}): Observable<PeStudioAlbum[]> {
    const params = new HttpParams()
      .append('page', options.page ?? '1')
      .append('limit', options.limit ?? '100')
      .append(options.sort?.order ?? 'asc', options.sort?.param ?? 'updatedAt');

    return this.http.get<PeStudioAlbum[]>(`${this.apiPath}/api/${this.envService.businessId}/album`, { params });
  }

  getSubscriptionAlbums(): Observable<PeStudioAlbum[]> {
    return this.http.get<any>(`${this.apiPath}/api/albums`);
  }

  getAlbumById(albumId: string): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/api/${this.envService.businessId}/album/${albumId}`);
  }

  getAlbumsByAttribute(attribute: PeAttribute, options: PeStudioPageOptions = {}): Observable<any> {
    let params = new HttpParams();
    params.append('page', options.page ?? '1');
    params.append('limit', options.limit ?? '100');
    if (options.sort) {
      params = params.append(options.sort.order, options.sort.param);
    }

    return this.http.get<PeStudioAlbum[]>(
      `${this.apiPath}/api/${this.envService.businessId}/album/by-user-attribute/` +
      `${attribute._id}/${attribute.name}`,
      { params }
    );
  }

  getAlbumMediaById(albumId: string, options: PeStudioPageOptions = {}): Observable<any> {
    let params = new HttpParams();
    params.append('page', options.page ?? '1');
    params.append('limit', options.limit ?? '20');
    if (options.sort) {
      params = params.append(options.sort.order, options.sort.param);
    }

    return this.http.get(`${this.apiPath}/api/${this.envService.businessId}/media/album/${albumId}`, { params });
  }

  downloadMedia(mediaUrl) {
    const mediaName = mediaUrl.split('/').pop();
    this.http.get(mediaUrl, { responseType: 'blob' }).pipe(
      take(1),
      tap((val) => {
        const url = URL.createObjectURL(val);
        this.downloadUrl(url, mediaName);
        URL.revokeObjectURL(url);
      }),
    ).subscribe();
  }

  getUserAttributes(options?): Observable<PeAttribute[]> {
    return this.http.get<PeAttribute[]>(`${this.apiPath}/api/${this.envService.businessId}/attribute`, {
      params: this.searchParams(options),
    });
  }

  searchParams(searchData) {
    return new HttpParams().set('limit', searchData?.limit ?? '20').set('page', searchData?.page ?? '1');
  }

  createUserAttribute(body: PeCreateUserAttributeBody): Observable<PeAttribute> {
    return this.http.post<any>(`${this.apiPath}/api/${this.envService.businessId}/attribute`, body, {});
  }

  createUserAttributeGroup(body: PeCreateUserAttributeGroupBody): Observable<PeCreateUserAttributeGroupResponse> {
    return this.http.post<any>(`${this.apiPath}/api/${this.envService.businessId}/attribute/group`, body, {});
  }

  getUserAttributeGroups(
    options: PeStudioPageOptions = {},
  ): Observable<PeCreateUserAttributeGroupResponse[]> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit ?? '20');

    return this.http.get<PeCreateUserAttributeGroupResponse[]>(
      `${this.apiPath}/api/${this.envService.businessId}/attribute/group`,
      { params }
    );
  }

  updateAttribute(payload: any, id: any): Observable<PeAttribute> {
    return this.http.patch<PeAttribute>(
      `${this.apiPath}/api/${this.envService.businessId}/attribute/${id}`,
      payload,
      {}
    );
  }

  deleteAttribute(selectedCategoryId: string) {
    return this.http.delete(`${this.apiPath}/api/${this.envService.businessId}/attribute/${selectedCategoryId}`);
  }

  private downloadUrl(url: string, fileName: string) {
    const a: any = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
  }
}
