import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MediaType, PebElementDef } from '@pe/builder-core';
import { getBackgroundImage, isBackgroundGradient, PebAbstractElement, PebEditorOptions } from '@pe/builder-renderer';


@Component({
  selector: 'peb-element-document',
  templateUrl: './document.maker.html',
  styleUrls: ['./document.maker.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebDocumentMakerElement extends PebAbstractElement {

  @Input() element: PebElementDef;
  @Input() options: PebEditorOptions;

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;

  readonly videoLoaded$ = new BehaviorSubject<boolean>(false);
  readonly mediaType = MediaType;

  get videoLoaded(): boolean {
    return this.videoLoaded$.value;
  }

  onLoaded(): void {
    this.videoLoaded$.next(true);
  }

  getMediaType() {
    return this.styles.mediaType;
  }

  get mappedStyles() {
    const styles = this.styles;
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
      overlay: {
        ...('backgroundColor' in styles && { backgroundColor: styles.backgroundColor }),
        ...backgroundStyle,
      },
      video: {
        height: `${100 / videoScale}%`,
        width: `${100 / videoScale}%`,
        opacity: styles.opacity,
        objectFit: this.data?.videoObjectFit?.value || styles.objectFit || 'contain',
        objectPosition: this.data?.videoObjectFitPosition || 'center center',
        willChange: 'transform',
        transform: `scale(${videoScale}) translate(${(100 - 100 / videoScale) / 2}%, ${(100 - 100 / videoScale) / 2}%)`,
        visibility: this.data?.isLoading ? 'hidden' : 'visible',
      },
    };
  }
}
