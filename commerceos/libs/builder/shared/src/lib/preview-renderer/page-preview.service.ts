import { Inject, Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
import { concatMap, filter, switchMap, take, withLatestFrom } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebShopContainer, PebShopImageResponse } from '@pe/builder-core';
import { pebGenerateId, PebScreen, pebScreenDocumentWidthList } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { PebPagePreviewData } from './constants';
import * as domToImage from './dom-to-image';

@Injectable({ providedIn: 'root' })
export class PagePreviewService {

  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  width: number;
  height: number;
  contentPadding = 0;

  updated$ = new BehaviorSubject<boolean>(false);

  readonly previewSavedSubject$ = new Subject<void>();

  screenshot$ = (id = pebGenerateId()) => {
    const pageId = this.editorStore.activePageId;

    return this.editorAccessorService.rendererSubject$
    .pipe(
      switchMap((renderer) => {
        const html = this.replaceVideoAnImage(renderer);
        const options = {
          width: this.width / devicePixelRatio,
          height: this.height / devicePixelRatio,
          cacheBust: true,
          skipFonts: true,
          style: {
            transform:  this.scaleTransform(),
          },
        };
        const blob = from(domToImage.toBlob(html,options));

        return blob;
      }),
      withLatestFrom(this.screen$),
      switchMap(([blob, screen]: [any, string]) => this.api.uploadImage(
          PebShopContainer.Images,
          new File([blob], `builder-page-preview-${screen}-${id}.png`),
      )),
      withLatestFrom(this.screen$),
      concatMap(([blob, screen]) => {

        return this.editorStore.updatePagePreview({ [pageId]: {
          [screen]: `${this.env.custom.storage}/images/builder-page-preview-${screen}-${id}`,
        } });
      }),
      take(1),
    );
  };

  constructor(
    private editorStore: PebEditorStore,
    private editorAccessorService: PebEditorAccessorService,
    private api: PebEditorApi,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {

    this.editorStore.actionCommitted$
    .pipe(
      withLatestFrom(this.updated$),
      filter(([_,updated]) => {
        this.updated$.next(!updated);

        return !updated;
      }),
      switchMap(() => this.screenshot$(pebGenerateId()) ),
    )
    .subscribe();
  }

  /***
  * @deprecated
  **/
  renderPreview(data: PebPagePreviewData) {
    const result = new Subject<PebShopImageResponse>();

    return result;
  }

  scaleTransform() {
    const scale = (this.width - this.contentPadding * 2) / pebScreenDocumentWidthList['desktop'] / devicePixelRatio;

    return `scale(${scale})`
  }

  replaceVideoAnImage(renderer): HTMLElement {
    const clone = renderer.nativeElement.cloneNode(true) as HTMLElement;

    Array.from(clone.getElementsByTagName('video')).forEach((video) => {
      const img = document.createElement('img');

      video.src += '-thumbnail';
      Array.from(video.attributes).forEach(attribute => {
        img.setAttribute(attribute.nodeName, attribute.nodeValue);
      });
      video.parentNode.replaceChild(img, video);
    });

    return clone;
  }
}
