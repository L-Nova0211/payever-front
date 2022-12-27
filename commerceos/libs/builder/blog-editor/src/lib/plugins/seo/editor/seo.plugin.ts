import { Inject, Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { merge, Observable } from 'rxjs';
import { filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import {
  pebCreateLogger,
  PebEditorState,
  PebElementDef,
  PebElementId,
  pebGenerateId,
  PebPageSeo,
  PebShopRoute,
  PebThemePageInterface,
} from '@pe/builder-core';
import { AfterGlobalInit } from '@pe/builder-old';
import {
  EditorSidebarTypes,
  PebActionType,
  pebCreateAction,
  PebEditorAccessorService,
  PebEditorStore,
} from '@pe/builder-services';
import { PebDeselectAllAction, PebElementSelectionState, PebSelectAction } from '@pe/builder-state';

import { PebBlogEditorState } from '../../../blog-editor.state';

import { PebEditorBlogSeoSidebarComponent } from './seo.sidebar';

const log = pebCreateLogger('blog-editor:plugins:seo');

@Injectable()
export class PebEditorBlogSeoPlugin implements AfterGlobalInit {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  selectedElements: PebElementId[];

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  constructor(
    private editorAccessorService: PebEditorAccessorService,
    private editorStore: PebEditorStore,
    private store: Store,
    @Inject(PebEditorState) private state: PebBlogEditorState,
  ) {}

  get activePage(): PebThemePageInterface {
    return this.editorStore.page;
  }

  afterGlobalInit(): Observable<any> {
    return this.editor.commands$.pipe(
      filter((command: any) => command.type === 'toggleSeoSidebar' && !this.state.seoSidebarOpened),
      switchMap(() => {
        log('open sidebar');
        let returnPrevSelection = false;
        const prevSelected = this.selectedElements;

        this.state.seoSidebarOpened = true;
        this.store.dispatch(new PebDeselectAllAction());

        const snapshot = this.editorStore.snapshot;
        const activePage = this.editorStore.page;

        this.editor.detail = { back: 'Page', title: 'SEO' };
        const sidebarCmpRef = this.editor.insertToSlot(PebEditorBlogSeoSidebarComponent, PebEditorSlot.sidebarDetail);
        sidebarCmpRef.instance.page = activePage;
        sidebarCmpRef.instance.routing = snapshot.application.routing;
        const pageRoute = snapshot.application.routing.find(route => route.pageId === activePage.id);
        sidebarCmpRef.instance.url = pageRoute ? pageRoute.url : '';

        this.state.sidebarsActivity[EditorSidebarTypes.Inspector] = true;

        return this.trackSidebarChanges(sidebarCmpRef.instance).pipe(
          takeUntil(
            merge(
              this.editor.commands$.pipe(
                filter((command: any) => command.type === 'toggleSeoSidebar' && this.state.seoSidebarOpened),
                tap(() =>
                  returnPrevSelection = true,
                ),
              ),
              this.editor.commands$.pipe(
                filter((command: any) => command.type === 'createPage'),
              ),
              this.editor.commands$.pipe(
                filter((command: any) => command.type === 'activatePage'),
              ),
              this.selectedElements$.pipe(
                filter(els => els.length > 0),
              ),
              sidebarCmpRef.instance.destroy$,
            ),
          ),
          finalize(() => {
            log('close sidebar');
            if (!this.selectedElements.length) {
              // this.state.sidebarsActivity[EditorSidebarTypes.Inspector] = false;
            }
            sidebarCmpRef.destroy();
            this.editor.backTo('main');

            if (returnPrevSelection) {
              this.store.dispatch(new PebSelectAction(prevSelected));
            }
            this.state.seoSidebarOpened = false;
          }),
        );
      }),
    );
  }

  trackSidebarChanges(sidebar: PebEditorBlogSeoSidebarComponent): Observable<any> {

    return merge(
      sidebar.changeTitle.pipe(
        switchMap((value: any) => {
          const snapshotPage = this.activePage;

          return this.editorStore.updatePage(snapshotPage, value);
        })),
      sidebar.changeUrl.pipe(
        switchMap((url: string) => {
          const activePage = this.activePage;
          const route = this.editorStore.snapshot.application.routing.find(r => r.pageId === activePage.id);
          const routing: PebShopRoute[] = [{
            ...route,
            url,
            pageId: activePage.id,
            routeId: route?.routeId ?? pebGenerateId(),
          }];

          return this.editorStore.updateShopThemeRouting(routing);
        })),
      sidebar.changeDescription.pipe(
        switchMap((description: string) => this.updateSeo({ description }))),
      sidebar.changeShowInSearchResults.pipe(
        switchMap((showInSearchResults: boolean) => this.updateSeo({ showInSearchResults }))),
      sidebar.changeCanonicalUrl.pipe(
        switchMap((canonicalUrl: string) => this.updateSeo({ canonicalUrl }))),
      sidebar.changeMarkupData.pipe(
        switchMap((markupData: string) => this.updateSeo({ markupData }))),
      sidebar.changeCustomMetaTags.pipe(
        switchMap((customMetaTags: string) => this.updateSeo({ customMetaTags }))),
    );
  }

  private updateSeo(seoChanges: Partial<PebPageSeo>) {
    const activePage = this.activePage;
    const updateAction = pebCreateAction(
      PebActionType.UpdatePageData,
      {
        ...activePage,
        data: {
          ...activePage.data,
          seo: {
            ...(activePage.data?.seo ?? {
              description: null,
              showInSearchResults: null,
              canonicalUrl: null,
              markupData: null,
              customMetaTags: null,
            }),
            ...seoChanges,
          },
        },
      },
    );

    return this.editorStore.commitAction(updateAction);
  }
}
