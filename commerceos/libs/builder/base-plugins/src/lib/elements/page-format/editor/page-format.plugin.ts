import { Injectable, Injector } from '@angular/core';
import { EMPTY, merge, Observable } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  retry,
  share,
  skip,
  switchMap,
  take,
  takeUntil,
} from 'rxjs/operators';

import { pebCreateLogger, PebElementType } from '@pe/builder-core';
import { PebEditorElement } from '@pe/builder-main-renderer';
import { AfterGlobalInit } from '@pe/builder-old';
import { AbstractEditElementPlugin } from '@pe/builder-shared';

import { PebEditorPageSidebarFormatComponent } from './page-format.sidebar';

const log = pebCreateLogger('editor:plugin:page');

@Injectable()
export class PebEditorPageFormatPlugin
  extends AbstractEditElementPlugin<PebEditorPageSidebarFormatComponent>
  implements AfterGlobalInit
{

  sidebarComponent = PebEditorPageSidebarFormatComponent;

  logger = { log };

  constructor(injector: Injector) {
    super(injector);
  }

  afterGlobalInit(): Observable<any> {

    const pageChanges$ = this.editorStore.page$.pipe(
      distinctUntilChanged((a, b) => a?.id === b?.id),
      share(),
    );

    return pageChanges$.pipe(
      switchMap(activePage => this.renderer.rendered.pipe(
        map(() => this.renderer.getElementComponent(activePage.template.id)),
        filter(Boolean),
        take(1),
      )),
      switchMap((elCmp: PebEditorElement) => this.selectedElements$.pipe(
        filter(elements => elements.length === 1 && elements[0].type === PebElementType.Document),
        map(elements => elements.map(element => element.id)),
        switchMap(() => {
          this.initBackgroundForm(elCmp);
          this.initVideoForm(elCmp);

          const sidebarRef = this.initSidebar(elCmp, {
            application: this.editorStore.snapshot.application,
            page: this.editorStore.page,
          });

          return merge(
            this.handleBackgroundForm(elCmp, sidebarRef),
            this.handleVideoForm(elCmp, sidebarRef),
          ).pipe(
            catchError((err) => {
              console.error(err);

              return EMPTY;
            }),
            takeUntil(
              merge(
                this.selectedElements$.pipe(skip(1)),
                pageChanges$.pipe(skip(1)),
              ),
            ),
          );
        }),
      )),
      retry(),
    );
  }
}
