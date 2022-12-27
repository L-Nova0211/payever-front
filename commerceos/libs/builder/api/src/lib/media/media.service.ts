import { HttpClient, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  MediaItemType,
  PebMediaService,
  PebMediaSidebarCollectionFilters,
  PebMediaSidebarCollectionItem,
  PebPaginationParams,
} from '@pe/builder-core';
import { EnvService } from '@pe/common';

import {
  BUILDER_MEDIA_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
} from '../constants';

import { SynchronizationTasKindEnum } from './enums/synchronization-task-kind.enum';

type ImageResponse = {blobName: string, brightnessGradation: string, thumbnail: string};


@Injectable({
  providedIn: 'any',
})
export class MediaService extends PebMediaService {

  constructor(
    @Inject(BUILDER_MEDIA_API_PATH) private builderMediaPath: string,
    @Inject(PEB_MEDIA_API_PATH) private mediaPath: string,
    @Inject(PEB_STORAGE_PATH) private storagePath: string,
    @Inject(PEB_STUDIO_API_PATH) private studioPath: string,
    @Inject(PEB_SYNCHRONIZER_API_PATH) private synchronizerPath: string,
    private http: HttpClient,
    private envService: EnvService,
  ) {
    super();
  }

  private get businessId() {
    return this.envService.businessId;
  }

  getCollection({ pagination = {}, filters = {} }: {
    pagination?: PebPaginationParams,
    filters?: PebMediaSidebarCollectionFilters,
  } = {}): Observable<PebMediaSidebarCollectionItem> {
    let params = new HttpParams();
    const { limit = 100, offset = 0 } = pagination;
    params = params.appendAll({ limit: limit.toString(), offset: offset.toString() });
    Object.entries(filters).forEach(([key, value], i) => {
      if (key === 'sortBy') {
        params = params.append(key, value);
      } else {
        if (value !== undefined && (typeof value !== 'object' || Object.keys(value).length)) {
          params = params.appendAll({
            [`filters[${i}][field]`]: key,
            [`filters[${i}][condition]`]: 'is',
          });
          if (typeof value === 'object') {
            Object.entries(value).forEach(([index, v]) => {
              params = params.append(`filters[${i}][value][${index}]`, `${v}`);
            });
          } else {
            params = params.append(`filters[${i}][value]`, `${value}`);
          }
        }
      }
    });

    return this.http.get<PebMediaSidebarCollectionItem>(
      `${this.builderMediaPath}/api/selection`,
      { params },
    );
  }

  /** @deprecated use getCollection */
  getImageCollection(filters: PebMediaSidebarCollectionFilters,
                     page = 1, perPage = 54): Observable<PebMediaSidebarCollectionItem> {
    return this.http.get<PebMediaSidebarCollectionItem>(
      `${this.builderMediaPath}/api/selection`,
      this.applyFilters(filters, 'image', page, perPage),
    );
  }

  /** @deprecated use getCollection */
  getVideoCollection(filters: PebMediaSidebarCollectionFilters,
                     page = 1, perPage = 54): Observable<PebMediaSidebarCollectionItem> {
    return this.http.get<PebMediaSidebarCollectionItem>(
      `${this.builderMediaPath}/api/selection`,
      this.applyFilters(filters, 'video', page, perPage),
    );
  }

  getCategories(types?: MediaItemType[]): Observable<string[]> {
    let params = new HttpParams();
    if (types?.length) {
      params = params.appendAll({ types });
    }

    return this.http.get<string[]>(`${this.builderMediaPath}/api/selection/categories`, { params });
  }

  getFormats(types?: MediaItemType[]): Observable<string[]> {
    let params = new HttpParams();
    if (types?.length) {
      params = params.appendAll({ types });
    }

    return this.http.get<string[]>(`${this.builderMediaPath}/api/selection/formats`, { params });
  }

  getStyles(types?: MediaItemType[]): Observable<string[]> {
    let params = new HttpParams();
    if (types?.length) {
      params = params.appendAll({ types });
    }

    return this.http.get<string[]>(`${this.builderMediaPath}/api/selection/styles`, { params });
  }

  uploadImage(file: File, container: string, blobName?: string): Observable<any> {
    const formData = new FormData();
    formData.append('buffer', file, file.name);
    let url = `${this.mediaPath}/api/image/business/${this.businessId}/${container}`;
    if (blobName) {
      url = `${url}/${blobName}`;
    }

    return this.http.post<any>(url, formData).pipe(
        map((response) => {
          response.blobName = `${this.storagePath}/${container}/${response.blobName}`;
          response.thumbnail = `${this.storagePath}/${container}/${response.thumbnail}`;

          return response;
        }),
    );
  }


  uploadImageWithProgress(file: File, container: string) {
    const formData = new FormData();
    formData.append('buffer', file, file.name);

    return this.http.post<ImageResponse>(
      `${this.mediaPath}/api/image/business/${this.businessId}/${container}`,
      formData, { reportProgress: true, observe: 'events' }).pipe(
        map((event) => {
          return {
            progress: event.type === HttpEventType.UploadProgress
              ? Math.round((100 * event.loaded) / event.total)
              : 0,
            ...(event.type === HttpEventType.Response && {
              body: {
                ...event.body,
                blobName: `${this.storagePath}/${container}/${event.body.blobName}`,
                thumbnail: `${this.storagePath}/${container}/${event.body.thumbnail}`,
              },
            }),
          };
        }),
      );
  }

  uploadVideo(file: File, container: string): Observable<any> {
    const formData = new FormData();
    formData.append('buffer', file, file.name);

    return this.http.post<any>(
      `${this.mediaPath}/api/video/business/${this.businessId}/${container}`,
      formData).pipe(
      map((response) => {
        response.preview = `${this.storagePath}/${container}/${response.preview}`;
        response.blobName = `${this.storagePath}/${container}/${response.blobName}`;
        response.thumbnail = `${this.storagePath}/${container}/${response.thumbnail}`;

        return response;
      }),
    );
  }

  searchMedia(keyword: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('name', keyword);

    return this.http.get<any>(`${this.studioPath}/api/${this.businessId}/media/search`, { params });
  }

  applyFilters(filters: PebMediaSidebarCollectionFilters, type: 'image' | 'video', page: number, perPage: number) {
    const { categories, formats, sortBy, styles, hasPeople } = filters;
    let params = new HttpParams();
    params = params.append('page', `${page}`);
    params = params.append('perPage', `${perPage}`);
    params = params.append('sortBy', sortBy);

    const filterTypes: Array<{ type, data }> = [
      {
        type: 'type',
        data: type,
      },
    ];

    if (categories.length > 0) {
      filterTypes.push({
        type: 'categories',
        data: categories,
      });
    }

    if (formats.length > 0) {
      filterTypes.push({
        type: 'formats',
        data: formats,
      });
    }

    if (styles.length > 0) {
      filterTypes.push({
        type: 'styles',
        data: styles,
      });
    }

    filterTypes.push({
      type: 'hasPeople',
      data: hasPeople,
    });

    if (filterTypes.length > 0) {
      filterTypes.forEach((filter, i) => {
        if (filter.type === 'type') {
          params = params.append(`filters[${i}][field]`, 'type');
          params = params.append(`filters[${i}][condition]`, 'is');
          params = params.append(`filters[${i}][value]`, type);
        } else {
          if (filter.type === 'hasPeople') {
            params = params.append(`filters[${i}][field]`, 'hasPeople');
            params = params.append(`filters[${i}][condition]`, 'is');
            params = params.append(`filters[${i}][value]`, `${filter.data}`);
          } else {
            params = params.append(`filters[${i}][field]`, filter.type);
            params = params.append(`filters[${i}][condition]`, 'is');
            filter.data.forEach((value, index) => {
              params = params.append(`filters[${i}][value][${index}]`, `${value}`);
            });
          }
        }
      });
    }

    return { params };
  }

  uploadFile(file: File): Observable<HttpEvent<{ id: string, url: string }>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<{ id: string, url: string }>(
      `${this.mediaPath}/api/storage/file`,
      formData,
      { reportProgress: true, observe: 'events' },
    );
  }

  importFromFile(fileUrl: string, overwriteExisting: boolean, uploadedImages?: any[]): Observable<any> {
    const apiURL = `${this.synchronizerPath}/api/synchronization/business/${this.envService.businessId}/tasks`;

    return this.http.put<any>(
      apiURL,
      {
        kind: SynchronizationTasKindEnum.FileImport,
        fileImport: {
          fileUrl,
          overwriteExisting,
          uploadedImages,
        },
      });
  }

  // STUDIO

  getUserAlbums(options: any = {}): Observable<any> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit);

    return this.http.get<any>(`${this.studioPath}/api/${this.businessId}/album?limit=100`, {});
  }

  getStudioGridFilters(options: any = {}): Observable<any> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit);

    return this.http.get<any>(`${this.studioPath}/api/attribute?limit=1000`, {
      params,
    });
  }

  getUserFilters(options: any = {}): Observable<any> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit);

    return this.http.get<any>(`${this.studioPath}/api/${this.businessId}/attribute?limit=1000`, {
      params,
    });
  }

  getAllMedia(options: any = {}): Observable<any> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit);

    return this.http.get<any>(`${this.studioPath}/api/${this.businessId}/subscription`, {
      params,
    });
  }

  searchUserMedia(name: string, options: any = {}): Observable<any> {
    let params = new HttpParams();
    // todo: implement pagination with infinite scroll
    /* params = params.append('page', options.page);
     params = params.append('limit', options.limit);*/
    params = params.append('name', name);
    if (options.sort) {
      params = params.append(options.sort.order, options.sort.param);
    }

    return this.http.get<any>(`${this.studioPath}/api/${this.businessId}/media/search`, {
      params,
    });
  }

  searchSubscriptions(name: string, options: any = {}): Observable<any> {
    let params = new HttpParams();
    // todo: implement pagination with infinite scroll
    /* params = params.append('page', options.page);
     params = params.append('limit', options.limit);*/
    params = params.append('name', name);
    if (options.sort) {
      params = params.append(options.sort.order, options.sort.param);
    }

    return this.http.get<any>(`${this.studioPath}/api/${this.businessId}/subscription/search`, {
      params,
    });
  }

  getAlbumMediaById(albumId: string): Observable<any> {
    return this.http.get(`${this.studioPath}/api/${this.businessId}/media/album/${albumId}`);
  }

  createAlbum(body: any): Observable<any> {
    body.businessId = this.businessId;

    return this.http.post<any>(`${this.studioPath}/api/${this.businessId}/album`, body, {});
  }

  updateAlbum(albumId: string, body: any): Observable<any> {
    body.businessId = this.businessId;

    return this.http.patch<any>(`${this.studioPath}/api/${this.businessId}/album/${albumId}`, body, {});
  }

  getAlbumsByAttribute(attribute: any): Observable<any> {
    return this.http.get<any>(`${this.studioPath}/api/${this.businessId}/album/by-user-attribute/${attribute._id}/${attribute.name}?limit=1000&page=1&asc=name&desc=updatedAt&asc=url`);
  }
}
