import { SafeUrl } from '@angular/platform-browser';

import { PeMediaFileTypeEnum } from '../enums';

export interface PeMediaInterface {
  file?: File;
  localUrl: SafeUrl;
  mediaUrl: string;
  mediaMimeType: PeMediaFileTypeEnum;
  metadata?: PeMediaMetadataInterface;
  wasLoaded?: boolean;
}

export interface PeMediaMetadataInterface {
  aspectRatio?: number;
  bitrate?: number;
  duration?: number;
  framerate?: number;
  mediaSize?: number;
  resolution?: {
    width: number;
    height: number;
  };
}
