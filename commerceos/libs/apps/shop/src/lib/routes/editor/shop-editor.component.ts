import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { combineLatest, forkJoin, Observable } from 'rxjs';
import { catchError, filter, finalize, map, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebEditorState, PebLanguage, PebPageType } from '@pe/builder-core';
import { PebEditorOptionsState, PebSetLanguageAction } from '@pe/builder-renderer';
import { EditorSidebarTypes, PebEditorAccessorService } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';
import { AppThemeEnum, EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { PePlatformHeaderItem } from '@pe/platform-header';

import { PebShopBuilderViewComponent } from '../../components';
import { PeShopBuilderEditComponent } from '../../components/builder-edit/builder-edit.component';
import { PebShopBuilderInsertComponent } from '../../components/builder-insert/builder-insert.component';
import { OPTIONS } from '../../constants';
import { PebShopsApi } from '../../services/abstract.shops.api';
import { PeBuilderShareService } from '@pe/builder-share';

@Component({
  selector: 'peb-shop-editor',
  templateUrl: './shop-editor.component.html',
  styleUrls: ['./shop-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebShopEditorComponent implements OnInit, OnDestroy {

  @Select(PebEditorOptionsState.language) language$!: Observable<PebLanguage>;

  readonly destroyed$ = this.destroy$.asObservable();
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  themeId = this.route.snapshot.params.themeId;
  shopId = this.route.snapshot.params.shopId;

  constructor(
    private dialog: MatDialog,
    private messageBus: MessageBus,
    private editorApi: PebEditorApi,
    private route: ActivatedRoute,
    private editorState: PebEditorState,
    private apiService: PebShopsApi,
    private envService: EnvService,
    private editorAccessorService: PebEditorAccessorService,
    private destroy$: PeDestroyService,
    private store: Store,
    private builderShare: PeBuilderShareService,
  ) {
    if (window.innerWidth > 720) {
      this.messageBus.emit('shop.toggle.sidebar', true);
    }
  }

  data$ = this.route.snapshot.params.themeId ?
    combineLatest([
      this.editorApi.getShopThemeById(this.route.snapshot.params.themeId),
      this.editorApi.getThemeDetail(this.route.snapshot.params.themeId),
    ]).pipe(
      map(([theme, snapshot]) => ({ theme, snapshot })),
    ) : this.editorApi.getShopActiveTheme().pipe(
      catchError((error) => {
        return error;
      }),
      switchMap(({ theme: themeId }) => {
        this.themeId = themeId;

        return combineLatest([
          this.editorApi.getShopThemeById(themeId),
          this.editorApi.getThemeDetail(themeId),
        ]).pipe(
          map(([theme, snapshot]) => ({ theme, snapshot })),
        );
      }),
    );

  ngOnInit(): void {
    this.messageBus.emit('shop.builder.init', '')
    document.body.classList.add('pe-builder-styles');
    this.messageBus.listen('shop.set.builder_view').pipe(
      tap((data: EditorSidebarTypes | ShopEditorSidebarTypes) => {
        this.setValue(data);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('editor.application.open').pipe(
      filter(() => this.route.snapshot.params.shopId),
      switchMap(() => this.apiService.getSingleShop(this.route.snapshot.params.shopId).pipe(
        tap(shop => this.messageBus.emit('shop.open', shop)),
      )),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.editorState.sidebarsActivity$.pipe(
      tap((sidebarsActivity) => {
        OPTIONS.find(option =>
          option.option === EditorSidebarTypes.Navigator).active = sidebarsActivity[EditorSidebarTypes.Navigator];
        OPTIONS.find(option =>
          option.option === EditorSidebarTypes.Inspector).active = sidebarsActivity[EditorSidebarTypes.Inspector];
        OPTIONS.find(option =>
          option.option === EditorSidebarTypes.Layers).active = sidebarsActivity[EditorSidebarTypes.Layers];
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('shop.set.builder_edit').pipe(
      tap((type: string) => {
        this.editorAccessorService.editorComponent.commands$.next({ type });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('shop.set.builder_insert').pipe(
      tap(({ type, params }) => {
        this.editorAccessorService.editorComponent.commands$.next({ type, params });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.editorState.pagesView$.pipe(
      tap((pagesView: any) => {
        OPTIONS.find(option =>
          option.option ===
          ShopEditorSidebarTypes.EditMasterPages).active = pagesView === PebPageType.Master ? true : false;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('shop.builder-view.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        if (sectionItem) {
          sectionItem.class = `${sectionItemClass} next-shop__header-button--active`;
        }
        const dialogRef = this.dialog.open(PebShopBuilderViewComponent, {
          position: {
            top: '48px',
            left: '53px',
          },
          disableClose: false,
          hasBackdrop: true,
          backdropClass: 'builder-backdrop',
          maxWidth: '267px',
          width: '267px',
          panelClass: 'builder-dialog',
          autoFocus: false,
        });
        dialogRef.backdropClick().pipe(
          tap(() => {
            dialogRef.close();
          }),
          takeUntil(this.destroyed$),
        ).subscribe();
        dialogRef.afterClosed().pipe(
          takeUntil(this.destroyed$),
          finalize(() => {
            sectionItem.class = sectionItemClass;
            this.messageBus.emit('shop.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('shop.builder-publish.open').pipe(
      mergeMap(({ sectionItem, event = null }: { sectionItem: PePlatformHeaderItem, event: PointerEvent }) => {
        const sectionItemClass = sectionItem?.class;
        if (sectionItem) {
          sectionItem.class = `${sectionItemClass} next-shop__header-button--active`;
        }
        this.editorAccessorService.editorComponent.commands$.next({
          type: 'openPublishDialogUnderElement',
          params: {
            appId: this.shopId,
            element: event?.currentTarget,
          },
        });

        return this.messageBus.listen('editor.publish-dialog.closed').pipe(
          take(1),
          tap(() => {
            sectionItem.class = sectionItemClass;
            this.messageBus.emit('shop.header.config', null);
          }),
        );
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.messageBus.listen('shop.builder-edit.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        sectionItem.class = `${sectionItemClass} next-shop__header-button--active`;
        const dialogRef = this.dialog.open(PeShopBuilderEditComponent, {
          position: {
            top: '48px',
            left: '195px',
          },
          disableClose: false,
          hasBackdrop: true,
          backdropClass: 'builder-backdrop',
          maxWidth: '286px',
          width: '286px',
          panelClass: ['builder-dialog', this.theme],
          autoFocus: false,
        });
        dialogRef.backdropClick().pipe(
          tap(() => {
            dialogRef.close();
          }),
          takeUntil(this.destroyed$),
        ).subscribe();
        dialogRef.afterClosed().pipe(
          takeUntil(this.destroyed$),
          finalize(() => {
            sectionItem.class = sectionItemClass;
            this.messageBus.emit('shop.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.messageBus.listen('shop.builder-insert.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        sectionItem.class = `${sectionItemClass} next-shop__header-button--active`;
        const dialogRef = this.dialog.open(PebShopBuilderInsertComponent, {
          position: {
            top: '48px',
            left: '250px',
          },
          disableClose: false,
          hasBackdrop: true,
          backdropClass: 'builder-backdrop',
          maxWidth: '286px',
          width: '286px',
          panelClass: ['builder-dialog', this.theme],
          data: {
            shopId: this.shopId,
          },
          autoFocus: false,
        });
        dialogRef.backdropClick().pipe(
          tap(() => {
            dialogRef.close();
          }),
          takeUntil(this.destroyed$),
        ).subscribe();
        dialogRef.afterClosed().pipe(
          takeUntil(this.destroyed$),
          finalize(() => {
            sectionItem.class = sectionItemClass;
            this.messageBus.emit('shop.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('shop.builder-share.open').pipe(
      tap(() => this.builderShare.openGetLinkDialog({ appType: 'shop' })),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.language$.pipe(
      tap((language) => {
        const languageOption = OPTIONS.find(o => o.option === 'language');
        if (languageOption) {
          languageOption?.options?.forEach((o) => {
            o.active = o.option === `language.${language}`;
          });
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();


  }

  ngOnDestroy() {
    this.messageBus.emit('shop.builder.destroy', '');
    document.body.classList.remove('pe-builder-styles');
  }


  setValue(value: EditorSidebarTypes | ShopEditorSidebarTypes | 'preview' | string): void {
    if (value === 'preview') {
      this.onOpenPreview(this.themeId);

      return;
    }

    const values = value.split('.');
    if (values[0] === 'language' && values.length > 1) {
      this.store.dispatch(new PebSetLanguageAction(values[1] as PebLanguage));

      return;
    }

    const option = OPTIONS.find(o => o.option === value)
    if (option) {
      option.active = !option.active;
      if (!option.disabled) {
        if (value === ShopEditorSidebarTypes.EditMasterPages) {
          this.editorState.pagesView =
            this.editorState.pagesView === PebPageType.Master ?
              PebPageType.Replica : PebPageType.Master;
        } else {
          this.editorState.sidebarsActivity = {
            ...this.editorState.sidebarsActivity as any,
            [value]: !this.editorState.sidebarsActivity[value],
          }
        }
      }
    }
  }

  private onOpenPreview(themeId: string) {
    this.editorApi.getThemeDetail(themeId).pipe(
      switchMap(snapshot => forkJoin(
        snapshot.pages.map(p => this.editorApi.getPage(themeId, p.id)),
      ).pipe(
        map(pages => ({ snapshot, pages })),
      )),
      tap((themeSnapshot) => {
        this.dialog.open(PebViewerPreviewDialog, {
          position: {
            top: '0',
            left: '0',
          },
          height: '100vh',
          maxWidth: '100vw',
          width: '100vw',
          panelClass: 'themes-preview-dialog',
          data: {
            themeSnapshot,
          },
        });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
