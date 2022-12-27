import { Location } from '@angular/common';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PeMediaFileTypeEnum, PeMediaUrlTypeEnum } from '../enums';
import { PeMediaMetadataInterface } from '../interfaces';
import { MEDIA_FILES_TYPES } from '../media.constants';
import { PE_CUSTOM_CDN_PATH, PE_MEDIA_API_PATH, PE_MEDIA_CONTAINER } from '../tokens';

@Injectable()
export class PeMediaService {
  file: File;
  container: string;
  totalUploadProgress: number;
  type: PeMediaFileTypeEnum;
  uploadProgress: number;

  constructor(
    private httpClient: HttpClient,

    @Inject(PE_CUSTOM_CDN_PATH) private peCustomCdnPath: string,
    @Inject(PE_MEDIA_API_PATH) private peMediaApiPath: string,
    @Inject(PE_MEDIA_CONTAINER) private peMediaContainer: string,
  ) { }

  public postMediaBlob(file: File, type: PeMediaFileTypeEnum, businessId: string, container?: string) {
    const mediaContainer = container ?? this.peMediaContainer;
    const uploadFile$ = this.sendMediaFile(file, type, businessId, mediaContainer);

    return uploadFile$;
  }

  private sendMediaFile<T>(
    file: File,
    type: PeMediaFileTypeEnum,
    businessId: string,
    container?: string
  ): Observable<HttpEvent<T>> {
    const mediaContainer = container ?? this.peMediaContainer;
    const formData = new FormData();
    const fileName = file.name.split('.');
    fileName.splice(fileName.length - 1, 0, new Date().toISOString());
    formData.set('file', file, fileName.join('.'));

    return this.httpClient.post<any>(
      `${this.peMediaApiPath}/api/${type}/business/${businessId}/cdn/${mediaContainer}`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
      },
    );
  }

  public async getFileByUrl(url: string): Promise<File> {
    const fileName = url.split(`/${this.peMediaContainer}/`)[1];
    const file = await fetch(url)
      .then(blob => blob.blob())
      .then(blobFile => new File([blobFile], fileName));

    return file;
  }

  public getMediaMetadata(file: File, fileType: PeMediaFileTypeEnum): Promise<PeMediaMetadataInterface> {
    return new Promise((res, rej) => {
      const fileReader = new FileReader();
      const metadata: PeMediaMetadataInterface = {};
      metadata.mediaSize = file.size;
      fileReader.onload = () => {
        if (fileType === PeMediaFileTypeEnum.Image) {
          const image = new Image();
          image.onload = () => {
            metadata.aspectRatio = image.width / image.height;
            metadata.resolution = { width: image.width, height: image.height };
          };
          image.src = fileReader.result as string;
          image.remove();
        } else {
          const video = document.createElement(PeMediaFileTypeEnum.Video);
          video.addEventListener('loadedmetadata', () => {
            metadata.aspectRatio = video.videoWidth / video.videoHeight;
            metadata.duration = video.duration;
            metadata.resolution = { width: video.videoWidth, height: video.videoHeight };
          });
          video.src = fileReader.result as string;
          video.remove();
        }
      };
      fileReader.readAsDataURL(file);

      res(metadata);
    });
  }

  public getMediaType(url: string): PeMediaFileTypeEnum {
    const parsedUrl = url.split('.');
    const extension = parsedUrl[parsedUrl.length - 1];

    return MEDIA_FILES_TYPES[extension] === PeMediaFileTypeEnum.Image
      ? PeMediaFileTypeEnum.Image
      : PeMediaFileTypeEnum.Video;
  }

  public getMediaUrl(blob: string, container?: string, type?: PeMediaUrlTypeEnum, size?): string {
    if (!blob) { return blob; }
    else if (blob.indexOf(PeMediaUrlTypeEnum.Thumbnail) + PeMediaUrlTypeEnum.Thumbnail.length === blob.length) {
      blob = blob.slice(0, blob.indexOf(PeMediaUrlTypeEnum.Thumbnail) - 1);
    }
    if (blob.indexOf('http://') === 0 || blob.indexOf('https://') === 0) {
      const suffix = type === PeMediaUrlTypeEnum.Thumbnail ? '-' + type : '';

      return blob + suffix;
    }
    type = type || PeMediaUrlTypeEnum.Regular;
    const mediaContainer = container ?? this.peMediaContainer;
    const containerUrlPart = size ? mediaContainer + ':' + size : mediaContainer;
    const baseUrlNormalized = Location.stripTrailingSlash(this.peCustomCdnPath);
    const blobName = [PeMediaUrlTypeEnum.Regular, ''].indexOf(type) >= 0 ? blob : blob + '-' + type;
    const blobEncoded = encodeURIComponent(blobName.slice(mediaContainer.length + 1)).replace('(', '%28').replace(')', '%29');

    return baseUrlNormalized + '/' + containerUrlPart + '/' + blobEncoded;
  }
}
