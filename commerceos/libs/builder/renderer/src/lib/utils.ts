import { MediaType, PebElementStyles, PebLanguagesData } from '@pe/builder-core';
import { DEFAULT_LOCALE, TranslateService } from '@pe/i18n-core';

import { PebEditorOptions } from './state';

export interface BgGradient {
  angle: number;
  startColor: string;
  start: number;
  endColor: string;
  end: number;
}

const BG_GRADIENT = 'linear-gradient';

export function generateObjectHash(object: any) {
  const str = JSON.stringify(object);

  let hash = 0;
  if (str.length === 0) {
    return hash;
  }

  for (let i = 0; i < str.length; i = i + 1) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return hash;
}

export function getBackgroundImage(backgroundImage: any): string {
  if (!backgroundImage) {
    return null;
  }

  /***
   * fix: These are temporary fixes until these features are removed.
   */
  if (!!backgroundImage?.changingThisBreaksApplicationSecurity) {
    backgroundImage = backgroundImage.changingThisBreaksApplicationSecurity;
  }

  return backgroundImage.includes(BG_GRADIENT)
    ? backgroundImage
    : `url("${backgroundImage}")`;
}

export function getOpacityBackgroundColor(hexBgColor: string, opacity: number): string {
  if (opacity === undefined || opacity === 1) {
    return hexBgColor;
  }

  const r = parseInt(hexBgColor.slice(1, 3), 16);
  const g = parseInt(hexBgColor.slice(3, 5), 16);
  const b = parseInt(hexBgColor.slice(5, 7), 16);

  return `rgba(${r},${g},${b},${opacity})`;
}

export function isBackgroundGradient(backgroundImage: any): boolean {
  let bgImg = backgroundImage || '';

  /***
   * fix: These are temporary fixes until these features are removed.
   */
  if (!!bgImg?.changingThisBreaksApplicationSecurity) {
    bgImg = bgImg.changingThisBreaksApplicationSecurity;
  }

  return bgImg.includes(BG_GRADIENT);
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

export function rendererTranslate(
  value: string,
  options: PebEditorOptions,
  translateService: TranslateService,
): string {
  if (!value) {
    return '';
  }
  const key = value.toLowerCase();
  const localeData = PebLanguagesData[options.language];
  if (localeData && translateService.hasTranslation(key, localeData.shortName)) {
    return translateService.translate(key, undefined, localeData.shortName);
  }

  const defaultLocaleData = PebLanguagesData[options.defaultLanguage];
  if (defaultLocaleData && translateService.hasTranslation(key, defaultLocaleData.shortName)) {
    return translateService.translate(key, undefined, defaultLocaleData.shortName);
  }

  return translateService.translate(key, undefined, DEFAULT_LOCALE);
}

export function getBackgroundStyle(styles): PebElementStyles {
  let backgroundStyle = {};

  const backgroundImage = getBackgroundImage(styles.backgroundImage as string);

  if (styles.mediaType === MediaType.None || styles.mediaType === MediaType.Video) {
    backgroundStyle = {
      backgroundImage: null,
    };
  } else if (backgroundImage && isBackgroundGradient(backgroundImage)) {
    backgroundStyle = { backgroundImage, backgroundClip: 'padding-box' };
  } else if (backgroundImage) {
    backgroundStyle = {
      backgroundImage,
      backgroundColor: styles.imageBackgroundColor,
      backgroundClip: 'padding-box',
      ...('backgroundRepeat' in styles && { backgroundRepeat: styles.backgroundRepeat }),
      ...('backgroundPosition' in styles && { backgroundPosition: styles.backgroundPosition }),
      backgroundSize: styles.backgroundSize
        ? typeof styles.backgroundSize === 'number'
          ? `${styles.backgroundSize}px`
          : styles.backgroundSize
        : null,
    };
  }

  return backgroundStyle;
}
