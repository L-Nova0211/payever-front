import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, forkJoin, Observable } from 'rxjs';

import {
  catchError,
  finalize,
  map,
  mergeMap,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PebBlogsApi, PebBuilderBlogsApi } from '@pe/builder-api';
import { PebEditorState, PebEnvService, PebLanguage, PebPageType } from '@pe/builder-core';
import { PebEditorOptionsState, PebSetLanguageAction } from '@pe/builder-renderer';
import { EditorSidebarTypes, PebEditorAccessorService } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';
import { AppThemeEnum, MessageBus, PeDestroyService, EnvService } from '@pe/common';
import { PePlatformHeaderItem } from '@pe/platform-header';

import { PeBlogBuilderEditComponent } from '../../components/builder-edit/builder-edit.component';
import { PebBlogBuilderInsertComponent } from '../../components/builder-insert/builder-insert.component';
import { PebBlogBuilderViewComponent } from '../../components/builder-view/builder-view.component';
import { OPTIONS } from '../../constants';
import { Select, Store } from '@ngxs/store';

@Component({
  selector: 'peb-blog-editor',
  templateUrl: './blog-editor.component.html',
  styleUrls: ['./blog-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeDestroyService ],
})
export class PebBlogEditorComponent implements OnInit, OnDestroy {

  @Select(PebEditorOptionsState.language) language$!: Observable<PebLanguage>;

  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

    themeId =this.route.snapshot.params.themeId;
    blogId = this.route.snapshot.params.blogId;
    readonly destroyed$ = this.destroy$.asObservable();

  constructor(
    private dialog: MatDialog,
    private messageBus: MessageBus,
    private editorApi: PebBuilderBlogsApi,
    private route: ActivatedRoute,
    private editorState: PebEditorState,
    private pebEnvService: PebEnvService,
    private envService: EnvService,
    private apiService:PebBlogsApi,
    private editorAccessorService: PebEditorAccessorService,
    private destroy$: PeDestroyService,
    private store: Store,
  ) {
    if (window.innerWidth > 720) {
      this.messageBus.emit('blog.toggle.sidebar', true);
    }
  }



  data$ = this.route.snapshot.params.themeId ?

    combineLatest([
      this.editorApi.getBlogThemeById(this.route.snapshot.params.themeId),
      this.editorApi.getThemeDetail(this.route.snapshot.params.themeId),
    ]).pipe(
      map(([theme, snapshot]) => ({ theme, snapshot })),
    ) : this.editorApi.getBlogActiveTheme(this.pebEnvService.applicationId).pipe(
      catchError((error) => {
        return error;
      }),
      switchMap(({ theme: themeId }) => {
        this.themeId = themeId;

        return combineLatest([
          this.editorApi.getBlogThemeById(themeId),
          this.editorApi.getThemeDetail(themeId),
        ]).pipe(
          map(([theme, snapshot]) => ({ theme, snapshot })),
        );
      }),
    );

  ngOnInit(): void {
    this.messageBus.emit('blog.builder.init', {
      blog: this.route.snapshot.params.blogId,
      theme: this.route.snapshot.params.themeId,
    });
    this.pebEnvService.applicationId = this.route.snapshot.params.blogId;
    document.body.classList.add('pe-builder-styles');
    this.messageBus.listen('blog.set.builder_view').pipe(
      tap((data: EditorSidebarTypes | ShopEditorSidebarTypes) => {
        this.setValue(data);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
    this.messageBus.listen('editor.application.open').pipe(
      switchMap(() => this.apiService.getSingleBlog(this.route.snapshot.params.blogId).pipe(
        tap(blog => this.messageBus.emit('blog.open', blog)),
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
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('blog.set.builder_edit').pipe(
      tap((type: string) => {
        this.editorAccessorService.editorComponent.commands$.next({ type });
      }),
      takeUntil(this.destroy$),
    ).subscribe()

    this.editorState.pagesView$.pipe(
      tap((pagesView: any) => {
        OPTIONS.find(option =>
          option.option ===
          ShopEditorSidebarTypes.EditMasterPages).active = pagesView === PebPageType.Master ? true : false;
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.language$.pipe(
      tap((language) => {
        const languageOption = OPTIONS.find(o => o.option === 'language');
        if (languageOption) {
          languageOption?.options?.forEach((o) => {
            o.active =  o.option === `language.${language}`;
          });
        }
      }),
    ).subscribe();
    this.messageBus.listen('blog.builder-view.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        if (sectionItem) {
          sectionItem.class = `${sectionItemClass} next-blog__header-button--active`;
        }
        const dialogRef = this.dialog.open(PebBlogBuilderViewComponent, {
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
            this.messageBus.emit('blog.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();


    this.messageBus.listen('blog.builder-publish.open').pipe(
      mergeMap(({ sectionItem, event = null }: { sectionItem: PePlatformHeaderItem, event: PointerEvent }) => {
        const sectionItemClass = sectionItem?.class;
        if (sectionItem) {
          sectionItem.class = `${sectionItemClass} next-blog__header-button--active`;
        }
        this.editorAccessorService.editorComponent.commands$.next({
          type: 'openPublishDialogUnderElement',
          params: {
            appId: this.blogId,
            element: event?.currentTarget,
          },
        });

        return this.messageBus.listen('editor.publish-dialog.closed').pipe(
          take(1),
          tap(() => {
            sectionItem.class = sectionItemClass;
            this.messageBus.emit('blog.header.config', null);
          }),
        );
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.messageBus.listen('blog.set.builder_edit').pipe(
      tap((type: string) => {
        this.editorAccessorService.editorComponent.commands$.next({ type });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('blog.set.builder_insert').pipe(
      tap(({ type, params }) => {
        this.editorAccessorService.editorComponent.commands$.next({ type, params });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('blog.builder-edit.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        sectionItem.class = `${sectionItemClass} next-blog__header-button--active`;
        const dialogRef = this.dialog.open(PeBlogBuilderEditComponent, {
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
            this.messageBus.emit('blog.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.messageBus.listen('blog.builder-insert.open').pipe(
      tap(({ sectionItem }: { sectionItem: PePlatformHeaderItem }) => {
        const sectionItemClass = sectionItem?.class;
        sectionItem.class = `${sectionItemClass} next-blog__header-button--active`;
        const dialogRef = this.dialog.open(PebBlogBuilderInsertComponent, {
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
            blogId: this.blogId,
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
            this.messageBus.emit('blog.header.config', null);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.messageBus.emit('blog.builder.destroy', '');
    document.body.classList.remove('pe-builder-styles');
    this.destroy$.next();
    this.destroy$.complete();
  }


  setValue(value: EditorSidebarTypes | ShopEditorSidebarTypes | 'preview' | string): void {
    if (value ==='preview') {
      this.onOpenPreview(this.themeId);

      return;
    }

    if (value === 'toggleLanguagesSidebar') {
      this.editorAccessorService.editorComponent.commands$.next({ type: 'toggleLanguagesSidebar' });

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
      takeUntil(this.destroy$),
    ).subscribe();
    }
}
