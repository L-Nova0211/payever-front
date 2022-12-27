import { Location } from '@angular/common';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PeAuthService } from '@pe/auth';
import { PE_ENV, EnvironmentConfigInterface } from '@pe/common';

import { MediaContainerType } from '../enums';
import {
  BlobCreateResponse,
  CustomConfigInterface,
  FileUploadResponse,
  NodeJsBackendConfigInterface,
} from '../interfaces';

export enum MediaUrlTypeEnum {
  Regular = 'regular',
  Thumbnail = 'thumbnail',
  Blurred = 'blurred',
  BlurredThumbnail = 'blurred-thumbnail',
}

@Injectable()
export class MediaService {
  constructor(
    @Inject(PE_ENV) private mediaEnv: EnvironmentConfigInterface,
    private http: HttpClient,
    private authService: PeAuthService
  ) {}

  createBlobByBusiness(
    businessUuid: string,
    container: MediaContainerType,
    file: File,
    type: 'video' | 'image' = 'image',
  ): Observable<HttpEvent<BlobCreateResponse>> {
    return this.createBlob(this.createBusinessEndpointUrl(businessUuid, container, type), file);
  }

  createBlobsByBusiness(
    businessUuid: string,
    container: MediaContainerType,
    file: File[],
  ): Observable<HttpEvent<BlobCreateResponse[]>> {
    return this.createBlobs(this.createBusinessEndpointUrl(businessUuid, container), file);
  }

  deleteBlobByBusiness(businessUuid: string, container: MediaContainerType, blobName: string): Observable<void> {
    return this.deleteBlob(this.createBusinessEndpointUrl(businessUuid, container), blobName);
  }

  createBlobByUser(
    userUuid: string,
    container: MediaContainerType,
    file: File,
  ): Observable<HttpEvent<BlobCreateResponse>> {
    return this.createBlob(this.createUserEndpointUrl(userUuid, container), file);
  }

  deleteBlobByUser(userUuid: string, container: MediaContainerType, blobName: string): Observable<void> {
    return this.deleteBlob(this.createUserEndpointUrl(userUuid, container), blobName);
  }

  createBlob(endpointUrl: string, file: File): Observable<HttpEvent<BlobCreateResponse>> {
    return this.postFile<BlobCreateResponse>(endpointUrl, file);
  }

  createBlobs(endpointUrl: string, files: File[]): Observable<HttpEvent<BlobCreateResponse[]>> {
    const formData: FormData = new FormData();
    files.forEach(file => {
      formData.append('file', file, file.name);
    });

    return this.http.post<BlobCreateResponse[]>(endpointUrl, formData, { reportProgress: true, observe: 'events' });
  }

  deleteBlob(endpointUrl: string, blobName: string): Observable<void> {
    return this.http.delete<void>(`${endpointUrl}/${blobName}`);
  }

  uploadFile(file: File): Observable<HttpEvent<FileUploadResponse>> {
    const fileUploadUrl: string = this.createFileStorageEndpointUrl();
    const token = this.authService.token || localStorage.getItem('TOKEN');
    const options = {
      header: {
      Authorization: `Bearer ${token}`,
    },
    }

    return this.postFile<FileUploadResponse>(fileUploadUrl, file, options);
  }

  getMediaUrl(blob: string, container: string, type: MediaUrlTypeEnum = null, size: string = null): string {
    if (!blob) {
      return blob;
    }
    if (blob.indexOf('http://') === 0 || blob.indexOf('https://') === 0) {
      return blob;
    }
    type = type || MediaUrlTypeEnum.Regular;
    const containerUrlPart: string = size ? `${container}:${size}` : container;
    const config: CustomConfigInterface = this.mediaEnv.custom;
    const baseUrlNormalized: string = Location.stripTrailingSlash(config.storage);

    // NOTE: Suffixes '-thumbnail' and '-blurred' are set y media micro (NOT FOR ALL BLOB CONTAINERS!)
    const blobName: string = ['regular', ''].indexOf(type) >= 0 ? blob : `${blob}-${type}`;

    const blobEncoded: string = encodeURIComponent(blobName).replace('(', '%28').replace(')', '%29');

    return `${baseUrlNormalized}/${containerUrlPart}/${blobEncoded}`;
  }

  getIconsPngUrl(blob: string): string {
    const config: CustomConfigInterface = this.mediaEnv.custom;
    const baseUrlNormalized: string = Location.stripTrailingSlash(config.cdn);

    return `${baseUrlNormalized}/icons-png/${blob}`;
  }

  private postFile<T>(endpointUrl: string, file: File, token = null): Observable<HttpEvent<T>> {
    const formData: FormData = new FormData();
    const options = {
      reportProgress: true,
      observe: 'events',
      ...token,
    };
    formData.append('file', file, file.name);

    return this.http.post<T>(endpointUrl, formData, options);
  }

  private createBusinessEndpointUrl(
    businessUuid: string,
    container: MediaContainerType,
    type: 'image' | 'video' = 'image',
  ): string {
    const config: NodeJsBackendConfigInterface = this.mediaEnv.backend;

    if (type === 'video') {
      return `${Location.stripTrailingSlash(config.media)}/api/video/builder-video`;
    }

    return `${Location.stripTrailingSlash(config.media)}/api/image/business/${businessUuid}/${container}`;
  }

  private createUserEndpointUrl(userUuid: string, container: MediaContainerType): string {
    const config: NodeJsBackendConfigInterface = this.mediaEnv.backend;

    return `${Location.stripTrailingSlash(config.media)}/api/image/user/${userUuid}/${container}`;
  }

  private createFileStorageEndpointUrl(): string {
    const config: NodeJsBackendConfigInterface = this.mediaEnv.backend;

    return `${Location.stripTrailingSlash(config.media)}/api/storage/file`;
  }
}
