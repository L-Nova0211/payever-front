import { ComponentRef, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { distinctUntilChanged, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import {
  applyIdsMapForPage,
  generateUniqueIdsForPage,
  PebAction,
  PebEditorState,
  PebMasterElementIdMap,
  PebPageType,
  PebThemePageInterface,
  PebThemeShortPageInterface,
} from '@pe/builder-core';
import { AfterGlobalInit } from '@pe/builder-old';
import {
  PebActionType,
  pebCreateAction,
  PebEditorAccessorService,
  PebEditorStore,
  PebInitPageIds,
} from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { PebDeselectAllAction } from '@pe/builder-state';

import { PebEditorMasterChangesBannerComponent } from './master-changes-banner/master-changes-banner.component';

interface PluginState {
  masterPage: PebThemePageInterface;
  banner: ComponentRef<PebEditorMasterChangesBannerComponent>;
  notUpdatedForks: PebThemeShortPageInterface[];
}

@Injectable()
export class PebEditorShopMasterPageChangesPlugin implements AfterGlobalInit {

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  constructor(
    private editorStore: PebEditorStore,
    protected state: PebEditorState,
    private editorAccessorService: PebEditorAccessorService,
    private store: Store,
  ) { }

  afterGlobalInit() {
    return this.editorStore.page$.pipe(
      distinctUntilChanged(),
      filter(Boolean),
      switchMap((currentPage: PebThemePageInterface) => {
        // const currentPage: PebPageShort = this.editorStore.snapshot.pages[activePageId];

        if (!currentPage || currentPage.type !== PebPageType.Master) {
          return EMPTY;
        }

        const pluginState: PluginState = {
          masterPage: currentPage,
          banner: this.editor.insertToSlot(
            PebEditorMasterChangesBannerComponent,
            PebEditorSlot.ngContentContainer,
          ),
          notUpdatedForks: [],
        };

        pluginState.banner.instance.loading = false;
        pluginState.banner.instance.pageName = currentPage.name;
        pluginState.banner.changeDetectorRef.detectChanges();



        return pluginState.banner.instance.apply.pipe(
          map(() => {
            const updatedMasterPage: PebThemeShortPageInterface = this.editorStore.snapshot.pages.find(p =>
              p.id === currentPage.id,
            );
            const forks: PebThemeShortPageInterface[] =
              this.editorStore.snapshot.pages.filter(p => p.master?.id === updatedMasterPage.id);
            const notUpdatedForks = forks.filter(fork =>
              fork.master.lastActionId !== updatedMasterPage.master?.lastActionId,
            );
            pluginState.notUpdatedForks = notUpdatedForks;

            return notUpdatedForks;
          }),
          switchMap(() => this.applyChanges(pluginState)),
          takeUntil(this.editorStore.activePageId$.pipe(
            filter(nextPageId => nextPageId !== pluginState.masterPage.id)),
          ),
          finalize(() => pluginState.banner?.destroy()),
        );
      }),
    );
  }

  private applyChanges({ masterPage, banner, notUpdatedForks }: PluginState) {
    banner.instance.loading = true;
    banner.changeDetectorRef.detectChanges();

    if (!notUpdatedForks || !notUpdatedForks.length) {
      return this.closeMasterPages({ masterPage, banner, notUpdatedForks });
    }

    return forkJoin(notUpdatedForks.map(page => this.getNextInitAction(page))).pipe(
      switchMap((nextInitActions) => {
        return this.editorStore.updateReplicas(nextInitActions).pipe(
          tap(snapshot => this.editorStore.snapshot = snapshot),
          switchMap(() => this.closeMasterPages({ masterPage, banner, notUpdatedForks })),
        );
      }),
    );
  }

  private closeMasterPages({ notUpdatedForks }: PluginState) {
    this.store.dispatch(new PebDeselectAllAction());
    this.state.sidebarsActivity[ShopEditorSidebarTypes.EditMasterPages] = false;
    this.state.pagesView = PebPageType.Replica;

    return this.editorStore.activatePage(
      notUpdatedForks[0]?.id
      ?? this.editorStore.snapshot.pages.find(p => p.type === PebPageType.Replica)?.id,
    );
  }

  private getNextInitAction(page: PebThemeShortPageInterface): Observable<PebAction> {
    const { master } = page;
    const routeId = this.editorStore.snapshot.application.routing.find(r => r.pageId === page.id).routeId;

    const ids: PebInitPageIds = {
      routeId,
      templateId: page.templateId,
      stylesheetIds: page.stylesheetIds,
      contextId: page.contextId,
      pageId: page.id,
    };

    return this.editorStore.getPage(master.id).pipe(
      map((masterPageSource) => {
        const updatedIdsMap: PebMasterElementIdMap = generateUniqueIdsForPage(masterPageSource);

        const idsMap: PebMasterElementIdMap = { ...updatedIdsMap, ...master.idsMap };

        const masterPageWithAppliedIds = applyIdsMapForPage(masterPageSource, idsMap);

        return pebCreateAction(
          PebActionType.CreatePageWithIds,
          {
            ids,
            page: {
              ...masterPageWithAppliedIds,
              type: PebPageType.Replica,
              master: {
                ...master,
                idsMap,
                // lastActionId: masterPageSource.lastActionId,
              },
            },
          },
        );
      }),
    );
  }
}
