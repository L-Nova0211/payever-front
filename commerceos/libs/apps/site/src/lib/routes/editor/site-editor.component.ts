import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { combineLatest, forkJoin, Observable } from 'rxjs';
import { catchError, finalize, map, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebEditorState, PebLanguage, PebPageType } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { EditorSidebarTypes, PebEditorAccessorService } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';
import { AppThemeEnum, EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { PePlatformHeaderItem } from '@pe/platform-header';

import { PeSiteBuilderEditComponent } from '../../components/builder-edit/builder-edit.component';
import { PebSiteBuilderInsertComponent } from '../../components/builder-insert/builder-insert.component';
import { PebSiteBuilderViewComponent } from '../../components/builder-view/builder-view.component';
import { OPTIONS } from '../../constants';
import { SiteEnvService } from '../../services/site-env.service';
import { PebSitesApi } from '../../services/site/abstract.sites.api';

@Component({
  selector: 'peb-site-editor',
  templateUrl: './site-editor.component.html',
  styleUrls: ['./site-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebSiteEditorComponent implements OnInit, OnDestroy {

  @Select(PebEditorOptionsState.language) language$!: Observable<PebLanguage>;

  readonly destroyed$ = this.destroy$.asObservable();
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  themeId = this.route.snapshot.params.themeId;

  constructor(
    private dialog: MatDialog,
    private messageBus: MessageBus,
    private editorApi: PebEditorApi,
    private route: ActivatedRoute,
    private editorState: PebEditorState,
    @Inject(EnvService) private envService: SiteEnvService,
    private destroy$: PeDestroyService,
    private editorAccessorService: PebEditorAccessorService,
    private sitesApi: PebSitesApi,
  ) {
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
      switchMap(({ theme }) => {
        this.themeId = theme;

        return combineLatest([this.editorApi.getShopThemeById(theme), this.editorApi.getThemeDetail(theme)]).pipe(
          map(([t, snapshot]) => ({ theme: t, snapshot })),
        );
      }),
    );

  ngOnInit(): void {
    this.messageBus.emit('site.builder.init', '');
    document.body.classList.add('pe-builder-styles');
    this.messageBus.listen('site.set.builder_view').pipe(
      tap((data: EditorSidebarTypes | ShopEditorSidebarTypes) => {
        this.setValue(data);

      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('site.set.builder_edit').pipe(
      tap((type: string) => {
        this.editorAccessorService.editorComponent.commands$.next({ type });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('editor.application.open').pipe(
      switchMap(() => this.sitesApi.getSingleSite(this.route.snapshot.params.siteId).pipe(
        tap(site => this.messageBus.emit('site.open', site)),
      )),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('site.set.builder_insert').pipe(
      tap(({ type, params }) => {
        this.editorAccessorService.editorComponent.commands$.next({ type, params });
      }),
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

    this.editorState.pagesView$.pipe(
      tap((pagesView: any) => {
        OPTIONS.find(option =>
          option.option === ShopEditorSidebarTypes.EditMasterPages).active =
          pagesView === PebPageType.Master ? true : false;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('site.builder-view.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        sectionItem.class = `${sectionItemClass} next-shop__header-button--active`;
        const dialogRef = this.dialog.open(PebSiteBuilderViewComponent, {
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
            this.messageBus.emit('site.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('site.builder-publish.open').pipe(
      mergeMap(({ sectionItem, event }: { sectionItem: PePlatformHeaderItem, event: PointerEvent }) => {
        const sectionItemClass = sectionItem?.class;
        if (sectionItem) {
          sectionItem.class = `${sectionItemClass} next-site__header-button--active`;
        }
        this.editorAccessorService.editorComponent.commands$.next({
          type: 'openPublishDialogUnderElement',
          params: {
            appId: this.route.snapshot.params.siteId,
            element: event?.currentTarget,
          },
        });

        return this.messageBus.listen('editor.publish-dialog.closed').pipe(
          take(1),
          tap(() => {
            sectionItem.class = sectionItemClass;
            this.messageBus.emit('site.header.config', null);
          }),
        );
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('site.builder-edit.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        sectionItem.class = `${sectionItemClass} next-site__header-button--active`;
        const dialogRef = this.dialog.open(PeSiteBuilderEditComponent, {
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
            this.messageBus.emit('site.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('site.builder-insert.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        sectionItem.class = `${sectionItemClass} next-site__header-button--active`;
        const dialogRef = this.dialog.open(PebSiteBuilderInsertComponent, {
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
            this.messageBus.emit('site.header.config', null);
          }),
        ).subscribe();
      }),
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
    this.messageBus.emit('site.builder.destroy', '');
    document.body.classList.remove('pe-builder-styles');
  }


  setValue(value: EditorSidebarTypes | ShopEditorSidebarTypes | 'preview'): void {
    if (value === 'preview') {
      this.onOpenPreview(this.themeId);

      return;
    }

    const option = OPTIONS.find(opt => opt.option === value);
    option.active = !option.active;
    if (!option.disabled) {
      if (value === ShopEditorSidebarTypes.EditMasterPages) {
        this.editorState.pagesView = this.editorState.pagesView === PebPageType.Master ?
          PebPageType.Replica : PebPageType.Master;
      } else {
        this.editorState.sidebarsActivity = {
          ...this.editorState.sidebarsActivity as any,
          [value]: !this.editorState.sidebarsActivity[value],
        };
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
