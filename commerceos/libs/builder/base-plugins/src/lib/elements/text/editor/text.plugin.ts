import { ComponentRef, Injectable, Injector, NgZone } from '@angular/core';
import { EMPTY, merge, Observable } from 'rxjs';
import { catchError, filter, finalize, map, skip, switchMap, take, takeUntil } from 'rxjs/operators';

import { pebCreateLogger, PebElementType } from '@pe/builder-core';
import { PebEditorElement } from '@pe/builder-main-renderer';
import { AfterGlobalInit } from '@pe/builder-old';
import { AbstractEditElementPlugin } from '@pe/builder-shared';

import { PebEditorTextSidebarComponent } from './text.sidebar';

const log = pebCreateLogger('editor:plugins:text');


@Injectable()
export class PebEditorTextPlugin extends AbstractEditElementPlugin<PebEditorTextSidebarComponent>
  implements AfterGlobalInit {

  sidebarComponent = PebEditorTextSidebarComponent;

  logger = { log };

  constructor(
    injector: Injector,
    private readonly ngZone: NgZone,
  ) {
    super(injector);
  }

  afterGlobalInit(): Observable<any> {
    return this.screen$.pipe(
      switchMap(() => this.ngZone.onStable.pipe(
        take(1),
        switchMap(() => this.selectedElements$.pipe(
          filter(elements => elements.length === 1
            && elements[0].type === PebElementType.Text
            && elements[0].parent.type !== PebElementType.Grid,
          ),
          map(([element]) => this.renderer.getElementComponent(element.id)),
          switchMap((elCmp) => {
            this.initElementForms(elCmp);
            const sidebarRef = this.initSidebar(elCmp);

            this.initAlignmentForm(sidebarRef);

            return merge(
              this.handleAlignmentForm(elCmp, sidebarRef),
              this.handleForms(elCmp, sidebarRef),
            ).pipe(
              catchError((err) => {
                console.error(err);

                return EMPTY;
              }),
              takeUntil(this.selectedElements$.pipe(skip(1))),
              finalize(this.finalizeForms(elCmp, sidebarRef)),
            );
          }),
        )),
      )),
    );
  }

  initElementForms(elCmp: PebEditorElement): PebEditorElement {
    this.initBackgroundForm(elCmp);

    return elCmp;
  }

  handleForms(elCmp: PebEditorElement, sidebarRef: ComponentRef<any>): Observable<any> {
    return merge(
      this.handleBackgroundForm(elCmp, sidebarRef),
    );
  }

  finalizeForms(elCmp: PebEditorElement, sidebarRef: ComponentRef<any>): () => void {
    return () => {
      sidebarRef.destroy();
    };
  }
}
