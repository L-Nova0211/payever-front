import { Inject, Injectable } from '@angular/core';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { MediaType } from '../enums';
import { PeStudioMedia } from '../interfaces';

import { StudioApiService } from './studio-api.service';

@Injectable({ providedIn: 'root' })
export class UploadMediaService {
  type: MediaType;
  container: string;
  file: File;
  image: PeStudioMedia;
  uploadProgress: number;
  totalUploadProgress: number;

  constructor(
    private studioApiService: StudioApiService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    ) {}

  postMediaBlob(file: File) {
    const type = file && file.type.split('/')[0] === MediaType.Image ? MediaType.Image : MediaType.Video;
    this.container = type === MediaType.Image ? 'builder' : 'builder-video';

    return this.studioApiService.sendMediaFile(file, type, this.container);
  }

  createUserMedia(response: any, file) {
    const body = response.body;
    const type = file && file.type.split('/')[0] === MediaType.Image ? MediaType.Image : MediaType.Video;

    return this.studioApiService.createUserMedia( {
      url:
        type === MediaType.Video
          ? `${this.env.custom.storage}/builder-video/${body.blobName}_preview`
          : `${this.env.custom.storage}/builder/${body.blobName}`,
      mediaType: type,
      name: file.name,
    });
  }

  addAlbumMedia(ids: string[], albumId: string) {
    return this.studioApiService.addMultipleMediaToAlbum(ids, albumId);
  }
}
