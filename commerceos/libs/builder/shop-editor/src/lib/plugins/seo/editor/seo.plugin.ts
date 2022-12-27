import { Inject, Injectable, OnDestroy } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { Select, Store } from '@ngxs/store';
import { merge, Observable, Subject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import {
  pebCreateLogger,
  PebEditorState,
  PebElementDef,
  PebElementId,
  PebThemePageInterface,
} from '@pe/builder-core';
import { AfterGlobalInit, checkElements } from '@pe/builder-old';
import {
  EditorSidebarTypes,
  PebEditorAccessorService,
  PebEditorStore,
} from '@pe/builder-services';
import { PebDeselectAllAction, PebElementSelectionState, PebSelectAction } from '@pe/builder-state';

import { PebShopEditorState } from '../../../shop-editor.state';

import { PebEditorShopSeoSidebarComponent } from './seo.sidebar';

const log = pebCreateLogger('blog-editor:plugins:seo');

@Injectable()
export class PebEditorShopSeoPlugin implements AfterGlobalInit, OnDestroy {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  selectedElements: PebElementId[];

  readonly destroy$ = new Subject<void>();

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  constructor(
    private editorAccessorService: PebEditorAccessorService,
    private editorStore: PebEditorStore,
    private store: Store,
    private apmService: ApmService,
    @Inject(PebEditorState) private state: PebShopEditorState,
  ) {
    this.selectedElements$.pipe(
      tap((elements) => {
        this.selectedElements = elements.map(element => element.id);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  get activePage(): PebThemePageInterface {
    return this.editorStore.page;
  }

  afterGlobalInit(): Observable<any> {
    return this.editor.commands$.pipe(
      filter(command => (command as any).type === 'toggleSeoSidebar' && !this.state.seoSidebarOpened),
      switchMap(() => {
        log('open sidebar');
        let returnPrevSelection = false;
        const prevSelected = this.selectedElements;

        this.state.seoSidebarOpened = true;
        this.store.dispatch(new PebDeselectAllAction());

        this.editor.detail = { back: 'Page', title: 'SEO' };
        const sidebarCmpRef = this.editor.insertToSlot(PebEditorShopSeoSidebarComponent, PebEditorSlot.sidebarDetail);

        this.state.sidebarsActivity[EditorSidebarTypes.Inspector] = true;

        return merge(
          this.editor.commands$.pipe(
            tap((command) => {
              console.log({ command });
            }),
            filter(command => (command as any).type === 'toggleSeoSidebar' && this.state.seoSidebarOpened),
            tap(() =>
              returnPrevSelection = true,
            ),
          ),
          this.editor.commands$.pipe(
            filter(command => (command as any).type === 'createPage'),
          ),
          this.editor.commands$.pipe(
            filter(command => (command as any).type === 'activatePage'),
          ),
          this.selectedElements$.pipe(
            filter(els => els.length > 0),
          ),
          sidebarCmpRef.instance.destroy$,
        ).pipe(
          tap(() => {
            log('close sidebar');
            sidebarCmpRef.destroy();
            this.editor.backTo('main');

            if (returnPrevSelection) {
              checkElements(prevSelected, this.apmService);
              this.store.dispatch(new PebSelectAction(prevSelected));
            }
            this.state.seoSidebarOpened = false;
          }),
        );
      }),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }


}
