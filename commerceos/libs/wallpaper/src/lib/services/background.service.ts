import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { MediaUrlPipe } from '@pe/media';

@Injectable({ providedIn: 'any' })
export class BackgroundService {

  private renderer: Renderer2;
  private changeBackgroundTimer: any;
  private hideOverlayTimer: any;

  constructor(
    private rendererFactory: RendererFactory2,
    private mediaUrlPipe: MediaUrlPipe
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  getBackgroundImage(elementSelector: string): string {
    const styles: CSSStyleDeclaration = getComputedStyle(document.querySelector(elementSelector));

    return styles.getPropertyValue('background-image').slice(4, -1).replace(/"/g, '');
  }

  setBackgroundImage(imageUrl: string, elementSelectors: string | string[]): void {
    if (Array.isArray(elementSelectors)) {
      elementSelectors.forEach((elementSelector) => {
        this.setBgByElementSelector(imageUrl, elementSelector);
      });
    } else {
      this.setBgByElementSelector(imageUrl, elementSelectors);
    }
  }

  setBackgroundImageThroughOverlay(imageUrl: string, elementSelector: string, overlayElementSelector: string): void {
    const element: Element = document.querySelector(elementSelector);
    const overlayElement: Element = document.querySelector(overlayElementSelector);
    if (element && overlayElement) {
      this.preloadImage(imageUrl).subscribe((success) => {
        clearTimeout(this.changeBackgroundTimer);
        clearTimeout(this.hideOverlayTimer);
        if (success) {
          this.renderer.setStyle(overlayElement, 'background-image', `url(${imageUrl})`);
          this.renderer.setStyle(overlayElement, 'opacity', 1);
          this.changeBackgroundTimer = setTimeout(
            () => {
              this.renderer.setStyle(element, 'background-image', `url(${imageUrl})`);
              this.hideOverlayTimer = setTimeout(
                () => {
                  this.renderer.setStyle(overlayElement, 'opacity', 0);
                },
                250
              );
            },
            250
          );
        }
      });
    }
  }

  setBackgroundImageFromBlob(blobName: string, blobContainer: string, elementSelectors: string | string[]): void {
    this.setBackgroundImage(this.mediaUrlPipe.transform(blobName, blobContainer), elementSelectors);
  }

  setBackgroundImageThroughOverlayFromBlob(blobName: string, blobContainer: string, elementSelector: string, overlayElementSelector: string): void {
    this.setBackgroundImageThroughOverlay(this.mediaUrlPipe.transform(blobName, blobContainer), elementSelector, overlayElementSelector);
  }

  preloadImage(url: string): Observable<{}> {
    const cache: any = window['pe_preloadedImages'] || (window['pe_preloadedImages'] = {});
    if (!cache[url]) {
      cache[url] = this.preloadImageFile(url).pipe(
        shareReplay(1)
      );
    }

    return cache[url];
  }

  preloadImages(urls: string[]): Observable<{}[]> {
    return forkJoin(urls.map((imageUrl) => {
      return this.preloadImage(imageUrl);
    }));
  }

  private setBgByElementSelector(imageUrl: string, elementSelector: string): void {
    const element: Element = document.querySelector(elementSelector);
    if (element) {
      this.preloadImage(imageUrl).subscribe((success) => {
        if (success) {
          this.renderer.setStyle(element, 'background-image', `url(${imageUrl})`);
        }
      });
    }
  }

  private preloadImageFile(imageUrl: string): Observable<boolean> {
    return new Observable((observer) => {
      if (imageUrl.includes('commerseos-background') || imageUrl.includes('commerceos-background')) {
        // TODO What this means?
        observer.next(true);
        observer.complete();

        return;
      }
      const elem: HTMLElement = document.createElement('img');
      elem.setAttribute('src', imageUrl);
      elem.setAttribute('style', 'display:none;');
      elem.onload = () => {
        observer.next(true);
        observer.complete();
      };
      elem.onerror = (error) => {
        // We can't emit error together with shareReplay(1), so have to emit false
        observer.next(false);
        observer.complete();
      };
      document.getElementsByTagName('body')[0].appendChild(elem);
    });
  }
}
