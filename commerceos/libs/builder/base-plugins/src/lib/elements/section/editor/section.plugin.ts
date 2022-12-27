import { Injectable, Injector, NgZone, OnDestroy } from '@angular/core';
import { merge, Observable, Subject } from 'rxjs';
import { filter, finalize, map, skip, switchMap, take, takeUntil } from 'rxjs/operators';

import { pebCreateLogger, PebElementType } from '@pe/builder-core';
import { AfterGlobalInit } from '@pe/builder-old';
import { AbstractEditElementPlugin } from '@pe/builder-shared';

import { PebEditorSectionSidebarComponent } from './section.sidebar';

const log = pebCreateLogger('editor:plugins:edit-section');

@Injectable()
export class PebEditorSectionPlugin
  extends AbstractEditElementPlugin<PebEditorSectionSidebarComponent>
  implements AfterGlobalInit, OnDestroy {

  readonly destroy$ = new Subject<void>();

  sidebarComponent = PebEditorSectionSidebarComponent;

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
          filter(elements => elements.length === 1 && elements[0].type === PebElementType.Section),
          map(([element]) => this.renderer.getElementComponent(element.id)),
          switchMap((elCmp) => {
            this.initBackgroundForm(elCmp);
            this.initVideoForm(elCmp);

            const sidebarRef = this.initSidebar(elCmp);

            return merge(
              this.handleBackgroundForm(elCmp, sidebarRef),
              this.handleVideoForm(elCmp, sidebarRef),
            ).pipe(
              takeUntil(this.selectedElements$.pipe(skip(1))),
              finalize(() => sidebarRef.destroy()),
            );
          }),
        )),
      )),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
