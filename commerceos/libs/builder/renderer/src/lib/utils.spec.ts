import { PebLanguage, PebLanguagesData } from '@pe/builder-core';
import { DEFAULT_LOCALE, TranslateService } from '@pe/i18n';

import {
  generateObjectHash,
  getBackgroundImage,
  getGradientProperties,
  getOpacityBackgroundColor,
  isBackgroundGradient,
  rendererTranslate,
} from './utils';

describe('utils', () => {

  it('should generate object hash', () => {

    const object = {
      id: '007',
      firstName: 'James',
      lastName: 'Bond',
    };

    expect(generateObjectHash(object)).toBe(1557826619);

  });

  it('should get background image', () => {

    let bgImage: string;

    // w/o bg image
    expect(getBackgroundImage(bgImage)).toBeNull();

    // w/ bg image & include BG_GRADIENT
    bgImage = 'linear-gradient(to-top, #000, transparent)';
    expect(getBackgroundImage(bgImage)).toEqual(bgImage);

    // w/ bg image
    bgImage = 'https://google.com/test.jpg';
    expect(getBackgroundImage(bgImage)).toEqual(`url("${bgImage}")`);

  });

  it('should get background color with opacity', () => {

    expect(getOpacityBackgroundColor('#333333', 1)).toEqual('#333333');
    expect(getOpacityBackgroundColor('#333333', .75)).toEqual('rgba(51,51,51,0.75)');

  });

  it('should check if background is gradient', () => {

    expect(isBackgroundGradient(undefined)).toBe(false);
    expect(isBackgroundGradient('linear-gradient(to-top, #000, transparent)')).toBe(true);

  });

  it('should get gradient props', () => {

    const styles = { backgroundImage: null };

    /**
     * styles.backgroundImage is null
     */
    expect(getGradientProperties(styles)).toBeNull();

    /**
     * styles.backgroundImage is '#333333'
     */
    styles.backgroundImage = '#333333';

    expect(getGradientProperties(styles)).toBeNull();

    /**
     * styles.backgroundImage is gradient
     */
    styles.backgroundImage = 'linear-gradient(to-top, #454545, white)';

    expect(getGradientProperties(styles)).toEqual({
      angle: 90,
      startColor: '#ffffff',
      start: 0,
      endColor: '#ffffff',
      end: 100,
    });

    /**
     * styles.backgroundImage is correct full gradient
     */
    styles.backgroundImage = 'linear-gradient(120deg, #333333 20%, #999999 90%)';

    expect(getGradientProperties(styles)).toEqual({
      angle: 120,
      startColor: '#333333',
      start: 20,
      endColor: '#999999',
      end: 90,
    });

  });

  it('should translate', () => {

    const translateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['translate', 'hasTranslation']);
    const options = {
      locale: null,
      defaultLocale: null,
    };

    translateService.hasTranslation.and.returnValue(true);
    translateService.translate.and.callFake((key: string) => `${key}.translated`);

    /**
     * argument value is null
     * options.locale & defaultLocale is null
     */
    expect(rendererTranslate(null, options as any, translateService)).toEqual('');
    expect(translateService.hasTranslation).not.toHaveBeenCalled();
    expect(translateService.translate).not.toHaveBeenCalled();

    /**
     * argument value is set
     */
    expect(rendererTranslate('Test', options as any, translateService)).toEqual('test.translated');
    expect(translateService.hasTranslation).not.toHaveBeenCalled();
    expect(translateService.translate).toHaveBeenCalledWith('test', undefined, DEFAULT_LOCALE);

    /**
     * options.defaultLocale is set
     */
    options.defaultLocale = PebLanguage.English;
    translateService.translate.calls.reset();

    expect(rendererTranslate('Test', options as any, translateService)).toEqual('test.translated');
    expect(translateService.hasTranslation)
      .toHaveBeenCalledOnceWith('test', PebLanguagesData[options.defaultLocale].shortName);
    expect(translateService.translate)
      .toHaveBeenCalledWith('test', undefined, PebLanguagesData[options.defaultLocale].shortName);

    /**
     * options.locale is set
     */
    options.locale = PebLanguage.German;
    translateService.hasTranslation.calls.reset();
    translateService.translate.calls.reset();

    expect(rendererTranslate('Test', options as any, translateService)).toEqual('test.translated');
    expect(translateService.hasTranslation)
      .toHaveBeenCalledWith('test', PebLanguagesData[options.locale].shortName);
    expect(translateService.translate)
      .toHaveBeenCalledWith('test', undefined, PebLanguagesData[options.locale].shortName);

  });

});
