import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MediaType, PebElementDef, PebScreen, pebScreenContentWidthList } from '@pe/builder-core';
import { getBackgroundImage, isBackgroundGradient, PebAbstractElement } from '@pe/builder-renderer';

@Component({
  selector: 'peb-element-section',
  templateUrl: './section.maker.html',
  styleUrls: ['./section.maker.scss'],
})
export class PebSectionMakerElement extends PebAbstractElement {

  @Input() element: PebElementDef;

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  @ViewChild('wrapper') wrapperEl: ElementRef;

  readonly videoLoaded$ = new BehaviorSubject<boolean>(false);
  mediaType = MediaType;

  get videoLoaded(): boolean {
    return this.videoLoaded$.value;
  }

  get contentContainer(): HTMLElement {
    return this.wrapperEl?.nativeElement;
  }

  onLoaded(): void {
    this.videoLoaded$.next(true);
  }

  getMediaType() {
    return this.styles.mediaType;
  }

  get mappedStyles() {
    const styles = this.styles;
    const fullWidth = !!this.data?.fullWidth;
    const { interactions, screen } = this.options ?? {};
    const screenWidth = pebScreenContentWidthList[screen];
    const videoScale = this.data?.videoScale / 100 || 1;

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
        backgroundRepeat: 'backgroundRepeat' in styles ? styles.backgroundRepeat : 'no-repeat',
        backgroundPosition: 'backgroundPosition' in styles ? styles.backgroundPosition : 'center center',
        backgroundSize: styles.backgroundSize
          ? typeof styles.backgroundSize === 'number'
            ? `${styles.backgroundSize}px`
            : styles.backgroundSize
          : 'auto',
      };
    }

    return {
      host: {
        display: styles.display ?? 'block',
        position: 'relative',
        width: '100%',
        height: `${styles.height}px`,
        ...(
          styles.backgroundImage && styles.imageBackgroundColor && styles.mediaType !== MediaType.None ?
            { backgroundColor: styles.imageBackgroundColor } : null
        ),
        paddingLeft: 'env(safe-area-inset-left, 0)',
        paddingRight: 'env(safe-area-inset-left, 0)',
        order: this.element.index,
      },
      overlayWrapper: {
        width: !fullWidth && screen === PebScreen.Desktop ? `${screenWidth}px` : '100%',
        ...(
          fullWidth || screen !== PebScreen.Desktop
            ? {
              marginRight: 'calc(env(safe-area-inset-left, 0) * -1)',
              marginLeft: 'calc(env(safe-area-inset-left, 0) * -1)',
            }
            : null
        ),
      },
      overlay: {
        width: !fullWidth && screen === PebScreen.Desktop ? `${screenWidth}px` : '100%',
        ...('backgroundColor' in styles && { backgroundColor: styles.backgroundColor }),
        ...backgroundStyle,
        ...('boxShadow' in styles && { boxShadow: styles.boxShadow }),
        ...('padding' in styles && { padding: `${styles.padding}px` }),
      },
      wrapper: {
        width: `${screenWidth}px`,
        ...('height' in styles && { height: `${styles.height}px` }),
      },
      videoContainer: {
        width: !fullWidth ? `${screenWidth}px` : '100%',
      },
      videoWrapper: {
        width: !fullWidth ? `${screenWidth}px` : '100%',
      },
      video: {
        opacity: `${styles.opacity}`,
        objectFit: this.data?.videoObjectFit?.value || styles.objectFit || 'contain',
        objectPosition: this.data?.videoObjectFitPosition || 'center center',
        willChange: 'transform',
        transform: `scale(${videoScale}) translate(${(100 - 100 / videoScale) / 2}%, ${(100 - 100 / videoScale) / 2}%)`,
        visibility: this.data?.isLoading ? 'hidden' : 'visible',
      },
      img: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        objectFit: styles.objectFit || 'cover',
      },
    };
  }
}
