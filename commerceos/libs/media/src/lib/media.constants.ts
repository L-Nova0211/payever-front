import { PeMediaFileTypeEnum } from './enums';

export const ICONS = {
  'add-file': '../assets/icons/add-file.svg',
  'content-placeholder': '../assets/icons/content-placeholder.svg',
};

export const MAXIMUM_FILE_SIZE = 10485760; // 10Mb

export const MEDIA_CONFIG = 'MEDIA_CONFIG';

export const MEDIA_FILES_TYPES = {
  jpeg: PeMediaFileTypeEnum.Image,
  jpg: PeMediaFileTypeEnum.Image,
  png: PeMediaFileTypeEnum.Image,
  svg: PeMediaFileTypeEnum.Image,
  image: ['png', 'jpg', 'jpeg', 'svg'],
  avi: PeMediaFileTypeEnum.Video,
  mov: PeMediaFileTypeEnum.Video,
  mpeg: PeMediaFileTypeEnum.Video,
  mp4: PeMediaFileTypeEnum.Video,
  video: ['mov', 'mp4', 'mpeg', 'avi'],
};

export const ONE_HUNDRED_PERCENTS = 100;
