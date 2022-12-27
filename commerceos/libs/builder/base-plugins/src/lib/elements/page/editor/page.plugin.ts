import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngxs/store';
import { merge, Observable } from 'rxjs';
import { filter, finalize, map, repeat, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  getPageUrlByName,
  pebCreateLogger,
  PebElementId,
  pebGenerateId,
  PebPageShort,
  PebPageVariant,
  PebShopRoute,
  PebThemeDetailInterface,
  PebThemePageInterface,
  PebThemeShortPageInterface,
} from '@pe/builder-core';
import { PebInsertAction } from '@pe/builder-main-editor';
import { PebEditorElement } from '@pe/builder-main-renderer';
import { AfterGlobalInit } from '@pe/builder-old';
import { AbstractEditElementPlugin } from '@pe/builder-shared';

import { PebEditorPageSidebarComponent } from './page.sidebar';


const log = pebCreateLogger('editor:plugin:page');

@Injectable()
export class PebEditorPagePlugin
  extends AbstractEditElementPlugin<PebEditorPageSidebarComponent>
  implements AfterGlobalInit
{

  sidebarComponent = PebEditorPageSidebarComponent;

  logger = { log };

  constructor(
    injector: Injector,
    protected store: Store,
  ) {
    super(injector);
  }

  afterGlobalInit(): Observable<any> {
    return this.editorStore.page$.pipe(
      switchMap((activePage) => {
        return this.selectedElements$.pipe(
          map(selectedElements => selectedElements.map(selectedElement => selectedElement.id)),
          filter((selectedIds: PebElementId[]) => {

            if (!activePage) {
              return false;
            }

            const documentId = activePage.template.id;

            return !selectedIds.length || selectedIds.includes(documentId);
          }),
        );
      }),
      switchMap((res) => {
        const snapshot = this.editorStore.snapshot;
        const activePage = this.editorStore.page;
        const documentEl: PebEditorElement = this.renderer.getElementComponent(
          activePage.template.id,
        );
        if (!documentEl) {
          // This element hasn't rendered yet
          return this.renderer.rendered.pipe(
            map(() => this.renderer.getElementComponent(activePage.template.id)),
            filter((documentElement: PebEditorElement) => !!documentElement),
            take(1),
            switchMap(documentElement => this.openPageSidebar(activePage, snapshot, documentElement)),
          );
        }

        return this.openPageSidebar(activePage, snapshot, documentEl);
      }),
      repeat(),
    );
  }

  private openPageSidebar(
    activePage: PebThemePageInterface,
    snapshot: PebThemeDetailInterface,
    documentEl: PebEditorElement,
  ): Observable<any> {
    const sidebarCmpRef = this.editor.openSidebarPage(this.sidebarComponent);

    sidebarCmpRef.instance.page = activePage;
    sidebarCmpRef.instance.application = snapshot.application;
    sidebarCmpRef.changeDetectorRef.detectChanges();
    sidebarCmpRef.instance.component = documentEl;

    return merge(
      this.trackSidebarChanges(activePage, sidebarCmpRef.instance),
    ).pipe(
      takeUntil(this.editorStore.page$.pipe(filter(page => page?.id !== activePage?.id))),
      finalize(() => sidebarCmpRef.destroy()),
    );
  }

  trackSidebarChanges(
    activePage: PebThemePageInterface,
    sidebar: PebEditorPageSidebarComponent,
  ): Observable<any> {
    return merge(
      sidebar.createNewSection.pipe(
        tap(() => { this.store.dispatch(new PebInsertAction()) })
      ),
      sidebar.changePageName.pipe(
        filter((value: string) => value && activePage.name !== value),
        switchMap((value: string) => this.editorStore.updatePage(activePage, { name: value })),
      ),

      sidebar.changePageType.pipe(
        switchMap(value => this.editorStore.updatePage(activePage, { variant: value })),
      ),

      sidebar.changeRootPage.pipe(
        switchMap((value: boolean) => {
          const pagesPayload = this.getPagesPayload(value, activePage);
          const routingPayload = this.getRoutingPayload(pagesPayload);

          return this.editorStore.updatePagesWithShopRouting(pagesPayload, routingPayload);
        }),
      ),

      sidebar.changePageLink.pipe(
        switchMap((value: PebShopRoute) => this.editorStore.updateShopThemeRouting([value])),
      ),
    );
  }

  private getPagesPayload(
    value: boolean,
    activePage: PebThemeShortPageInterface,
  ): Array<Partial<PebThemeShortPageInterface>> {
    const prevFrontPage = this.editorStore.snapshot.pages.find(page => page.variant === PebPageVariant.Front);

    return [
      ...(prevFrontPage ? [{
        id: prevFrontPage.id,
        name: prevFrontPage.name,
        variant: PebPageVariant.Default,
      }] : []),
      ...(value ? [{
        id: activePage.id,
        name: activePage.name,
        variant: PebPageVariant.Front,
      }] : []),
    ];
  }

  private getRoutingPayload(pages: Array<Partial<PebPageShort>>): PebShopRoute[] {
    return pages.map((page) => {
      const route = this.editorStore.snapshot.application.routing.find(r => r.pageId === page.id);

      return {
        ...(route ?? { routeId: pebGenerateId(), pageId: page.id }),
        url: page.variant === PebPageVariant.Front ? '/' : getPageUrlByName(page.name),
      };
    });
  }
}
