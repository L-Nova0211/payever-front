import { FormGroup } from '@angular/forms';

import { PebElementStyles, PebPageVariant } from '@pe/builder-core';

import { SelectOption } from './select/select.component';
import { isBackgroundGradient } from './utils';

export enum AlignType {
  Left = 'Left',
  Center = 'Center',
  Right = 'Right',
  Top = 'Top',
  Middle = 'Middle',
  Bottom = 'Bottom',
}

export const ALIGN_TYPES: SelectOption[][] = [
  [
    { value: AlignType.Left, name: 'Left' },
    { value: AlignType.Center, name: 'Center' },
    { value: AlignType.Right, name: 'Right' },
  ],
  [
    { value: AlignType.Top, name: 'Top' },
    { value: AlignType.Middle, name: 'Middle' },
    { value: AlignType.Bottom, name: 'Bottom' },
  ],
];

export interface BgGradient {
  angle: number;
  startColor: string;
  start: number;
  endColor: string;
  end: number;
}

export function getGradientProperties(styles: PebElementStyles): BgGradient {
  const backgroundImage = (styles.backgroundImage as string)?.replace('white', '#ffffff');

  if (backgroundImage && isBackgroundGradient(backgroundImage)) {
    const re = /\d+\.?\d?deg,\s?|#[a-fA-F0-9]{3,8}\s\d+%|rgba?\(\d+\.?\d*,\s?\d+\.?\d*,\s?\d+\.?\d*,?\s?\d?\.?\d*\)\s\d+\.?\d*%/g;
    const matches = backgroundImage.match(re);
    if (matches) {
      const angle = parseFloat(matches.shift());
      const colorStops = matches.map((step) => {
        const [color, percent] = step.split(' ');

        return { color, distance: parseFloat(percent) };
      });

      return {
        angle,
        startColor: colorStops[0].color,
        start: colorStops[0].distance,
        endColor: colorStops[1].color,
        end: colorStops[1].distance,
      };
    }

    return {
      angle: 90,
      startColor: '#ffffff',
      start: 0,
      endColor: '#ffffff',
      end: 100,
    };
  }

  return null;
}

export const PageTypes: SelectOption[] = [
  { value: PebPageVariant.Default, name: 'Default' },
  { value: PebPageVariant.Category, name: 'Category' },
  { value: PebPageVariant.Product, name: 'Product' },
  { value: PebPageVariant.Login, name: 'Login' },
  { value: PebPageVariant.Password, name: 'Password' },
  { value: PebPageVariant.NotFound, name: '404' },
];


export enum FillType {
  None = 'None',
  ColorFill = 'Color fill',
  ImageFill = 'Image fill',
  GradientFill = 'Gradient fill',
  Video = 'Video',
}

export const FillTypes: SelectOption[] = [
  { name: FillType.None },
  { name: FillType.ColorFill },
  { name: FillType.ImageFill },
  { name: FillType.GradientFill },
];
export const getFillType = (type: string) => FillTypes.find(option => option.name === type);


export enum PebTextStyleType {
  Bold = 'bold',
  Italic = 'italic',
  Underline = 'underline',
  Strike = 'line-through',
}

export enum ImageSize {
  Initial = 'initial',
  Contain = 'contain',
  Cover = 'cover',
  Stretch = '100% 100%',
  OriginalSize = 'auto',
}

export enum VideoSize {
  Tile = 'none',
  Contain = 'contain',
  Cover = 'cover',
  Stretch = 'fill',
  OriginalSize = 'none',
}

export const ImageSizes: SelectOption[] = [
  { value: ImageSize.OriginalSize, name: 'Original Size' },
  { value: ImageSize.Stretch, name: 'Stretch' },
  { value: ImageSize.Initial, name: 'Tile' },
  { value: ImageSize.Cover, name: 'Scale to Fill' },
  { value: ImageSize.Contain, name: 'Scale to Fit' },
];

export const VideoSizes: SelectOption[] = [
  { value: VideoSize.OriginalSize, name: 'Original Size' },
  { value: VideoSize.Stretch, name: 'Stretch' },
  // { value: VideoSize.Tile, name: 'Tile' },
  { value: VideoSize.Cover, name: 'Scale to Fill' },
  { value: VideoSize.Contain, name: 'Scale to Fit' },
];

export const PageSidebarDefaultOptions = {
  BgColor: '#ffffff',
  PageType: PageTypes[0],
  FillType: FillTypes[0],
  ImageSize: ImageSizes[0],
  ImageScale: 100,
  VideoSize: VideoSizes[3],
  videoScale: 100,
};

export function initFillType(styles: PebElementStyles, form?: FormGroup) {
  if (styles.backgroundImage && styles.backgroundImage !== '') {
    if (isBackgroundGradient(styles.backgroundImage as string, form)) {
      return getFillType(FillType.GradientFill);
    }

    return getFillType(FillType.ImageFill);
  }

  if (styles.backgroundColor && styles.backgroundColor !== '') {
    return getFillType(FillType.ColorFill);
  }

  return PageSidebarDefaultOptions.FillType;
}

export function getSelectedOption(
  options: SelectOption[],
  value: string | number | undefined,
  defaultValue: SelectOption,
): SelectOption {
  if (!value) {
    return defaultValue;
  }

  return options.find(option => option.value === String(value)) || defaultValue;
}

export function getBgScale(styles: PebElementStyles) {
  const bgSize = styles.backgroundSize as string;
  const bgImage = styles.backgroundImage;

  const size = Number(bgSize?.replace(/px|%/g, '').split(' ')[0]);
  const image = new Image();

  if (bgImage) {
    image.src = bgImage;
  }

  const result = Math.round(size / (image?.width / 100));

  const scale = bgSize?.includes('%')
    ? isNaN(size) ? null : size
    : isNaN(result) ? null : result;

  return scale ?? 100;
}

export function asyncGetBgScale(styles: PebElementStyles): Promise<any> {
  return new Promise<any>((resolve) => {
    const bgSize = styles.backgroundSize as string;
    const bgImage = styles.backgroundImage;

    const size = Number(bgSize?.replace(/px|%/g, '').split(' ')[0]);
    const image = new Image();
    const onload = () => {
      const result = Math.round(size / (image?.width / 100));

      const scale = bgSize?.includes('%')
        ? isNaN(size) ? null : size
        : isNaN(result) ? null : result;
      resolve(scale ?? 100);
    };
    if (bgImage) {image.src = bgImage;}
    if (image.complete) {
      onload();
    } else {
      image.onload = onload;
    }
  });
}

export function asyncGetVideoDimensions(video: HTMLVideoElement) {
  return new Promise<any>((resolve) => {
    if (video) {
      if (video.videoWidth) {
        const { videoWidth, videoHeight } = video;
        resolve({ videoWidth, videoHeight });
      } else {
        video.addEventListener('loadedmetadata', () => {
          const { videoWidth, videoHeight } = video;
          resolve({ videoWidth, videoHeight });
        });
      }
    } else {
      resolve({ videoWidth: '100%', videoHeight: '100%' });
    }

  });
}
