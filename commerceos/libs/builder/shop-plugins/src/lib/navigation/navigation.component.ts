import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector, TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Select } from '@ngxs/store';
import { BehaviorSubject, EMPTY, forkJoin, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  first,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PageSnapshot, PebEditorAbstractNavigation } from '@pe/builder-abstract';
import { OVERLAY_DATA, OVERLAY_POSITIONS } from '@pe/builder-base-plugins';
import {
  PebEditorState,
  PebLanguage,
  PebPageId,
  PebPageType,
  PebPageVariant,
  PebScreen,
  PebStylesheet,
  PebThemeShortPageInterface,
} from '@pe/builder-core';
import { PebPagesComponent } from '@pe/builder-pages';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { EditorSidebarTypes, PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PagePreviewService } from '@pe/builder-shared';
import { MessageBus, PebDeviceService } from '@pe/common';

import { PebShopEditorCreatePageDialogComponent } from './dialogs/create-page/create-page.dialog';


@Component({
  selector: 'peb-shop-editor-navigation',
  templateUrl: 'navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorShopNavigationComponent implements PebEditorAbstractNavigation, OnDestroy {

  @Select(PebEditorOptionsState.language) language$!: Observable<PebLanguage>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  language: PebLanguage;
  screen: PebScreen;

  readonly pageType: typeof PebPageType = PebPageType;

  @Input() pages: PebThemeShortPageInterface[];

  private _activePageSnapshot: PageSnapshot;
  private lastActionId: string;
  private readonly savePreviewEmitter = new Subject<{ pageSnapshot?: PageSnapshot, screen?: PebScreen }>();

  @Output() execCommand = new EventEmitter<any>();

  /* old code */
  @Input() set loading(loading: boolean) {
    this.loadingSubject$.next(loading);
  }

  get mainPages() {
    return this.pages.filter(p => !p.parentId);
  }

  get activePageSnapshot() {
    return this._activePageSnapshot;
  }

  @Input() set activePageSnapshot(pageSnapshot: PageSnapshot) {
    this.isSelectedAll = false;
    if (pageSnapshot?.id !== this._activePageSnapshot?.id) {
      const activePageActions = this.editorStore.pageActions.filter(action =>
        action.affectedPageIds.some(id => id === this._activePageSnapshot?.id));
      const screen = this.screen;

      if (this._activePageSnapshot?.id &&
        (!this._activePageSnapshot?.data?.preview?.[screen] ||
          (activePageActions?.length && this.lastActionId !== activePageActions[activePageActions.length - 1]?.id))
      ) {
        this.savePreviewEmitter.next({ pageSnapshot, screen });
      }
      this.lastActionId = activePageActions?.length ? activePageActions[activePageActions.length - 1]?.id : undefined;
    }
    this._activePageSnapshot = pageSnapshot;
  }

  @ViewChild('pageMenu') pageMenu: TemplateRef<any>;

  contextMenuPage: PebThemeShortPageInterface;
  tempCopiedPage: PebThemeShortPageInterface | PebThemeShortPageInterface[];
  private overlayRef: OverlayRef;
  private previewShouldUpdate = false;

  private readonly loadingSubject$ = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject$.asObservable();
  skeletonPages = Array.from({ length: 6 });

  private destroyed$ = new Subject<void>();

  editorState = this.injector.get(PebEditorState);
  public cdr = this.injector.get(ChangeDetectorRef);
  public deviceService = this.injector.get(PebDeviceService);
  public sanitizer = this.injector.get(DomSanitizer);
  private overlay = this.injector.get(Overlay);
  private previewService = this.injector.get(PagePreviewService);
  public editorStore = this.injector.get(PebEditorStore);
  private viewContainerRef = this.injector.get(ViewContainerRef);
  private dialog = this.injector.get(MatDialog);
  private editorAccessorService = this.injector.get(PebEditorAccessorService);
  private messageBus = this.injector.get(MessageBus);

  public isSelectedAll = false;
  private isMobile = this.deviceService.isMobile;

  private pagesDialogRef: MatDialogRef<PebPagesComponent>;

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  @HostListener('window:beforeunload', ['$event'])
  @HostListener('document:visibilitychange', ['$event'])
  onBlurWindow(event: Event) {
    const screen = this.screen;
    const activePageActions = this.editorStore.pageActions.filter(action =>
      action.affectedPageIds.some(id => id === this._activePageSnapshot?.id));
    if (this._activePageSnapshot?.id &&
      (!this._activePageSnapshot?.data?.preview?.[screen] ||
        (activePageActions?.length && this.lastActionId !== activePageActions[activePageActions.length - 1]?.id))
    ) {
      this.savePreviewEmitter.next({ pageSnapshot: this._activePageSnapshot, screen });
    }
  }

  constructor(
    public injector: Injector,
  ) {
    this.language$.pipe(
      tap((language) => {
        this.language = language;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.savePreviewEmitter.complete();
  }

  getPageSnapshot(pageId: PebPageId): PageSnapshot {
    return pageId === this.activePageSnapshot.id ? this.activePageSnapshot : null;
  }

  getPageStylesheet(screen): PebStylesheet {
    return this.editorStore.page.stylesheets[screen];
  }

  onCreate() {
    this.pagesDialogRef = this.dialog.open(
      PebPagesComponent,
      {
        height: this.isMobile ? '100%' : '82.3vh',
        maxWidth: this.isMobile ? '100%' : '78.77vw',
        width: this.isMobile ? '100%' : '78.77vw',
        panelClass: 'pages-dialog',
        data: {
          screen: this.screen,
          pages: this.mainPages,
          themeId: this.editorStore.theme.id,
        },
      },
    );

    this.pagesDialogRef.componentInstance.createPage.pipe(
      tap((command) => {
        if (command) {
          this.execCommand.emit({ type: command.type, params: command.payload });
        }
      }),
    ).subscribe();

    this.pagesDialogRef.afterClosed().pipe(
      tap((command) => {
        if (command) {
          this.execCommand.emit({ type: command.type, params: command.payload });
        }
      }),
    ).subscribe();
  }

  private createPageDialog(connectTo: HTMLElement) {
    const masterPages = Object
      .values((this.editorStore.snapshot as any).pages)
      .filter((page: any) => page.type === PebPageType.Master); // TODO: Set proper type

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(connectTo)
        .withFlexibleDimensions(false)
        .withViewportMargin(0)
        .withPositions(OVERLAY_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
      panelClass: 'dialog-publish-panel',
      disposeOnNavigation: true,
      maxHeight: '700px',
    });
    const emitter: Subject<any> = new Subject();
    const emitter$: Observable<any> = emitter.asObservable();
    const injectionTokens = new WeakMap();
    injectionTokens.set(
      OVERLAY_DATA,
      {
        emitter,
        data: {
          pages: masterPages,
          label: this.editorState.pagesView === PebPageType.Master ? 'Add a Master Page' : 'Add a Page',
        },
      });
    const injector = new PortalInjector(this.injector, injectionTokens);
    const portal = new ComponentPortal(PebShopEditorCreatePageDialogComponent, null, injector);

    this.overlayRef.attach(portal);
    this.overlayRef.backdropClick().pipe(tap(() => this.detachOverlay())).subscribe();

    emitter$.pipe(
      tap(() => this.detachOverlay()),
      tap(selectedMaster => this.createPage(selectedMaster)),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  createPage(selectedMaster?: PebThemeShortPageInterface) {
    this.closeContextMenu();
    this.execCommand.next({
      type: 'createPage',
      params: {
        type: this.editorState.pagesView,
        masterId: selectedMaster?.id,
      },
    });
  }

  forkPage(selectedMaster?: PebThemeShortPageInterface) {
    this.closeContextMenu();
    this.execCommand.next({
      type: 'createPage',
      params: {
        type: PebPageType.Replica,
        masterId: selectedMaster?.id,
      },
    });
    this.editorState.pagesView = PebPageType.Replica;
  }

  deletePage(page: PebThemeShortPageInterface) {
    this.closeContextMenu();
    if (this.isSelectedAll) {
      this.isSelectedAll = false;
      this.deletePageHandler(this.pages.filter(innerPage => !(this.isDeleteDisabled(innerPage))));
    } else {
      if (this.isDeleteDisabled(page)) {
        return;
      }
      this.deletePageHandler(page);
    }
  }

  deletePageHandler(page: any) {
    if (page === undefined || page.length === 0) {
      console.warn('No set page(s) to be deleted!');

      return;
    }
    this.execCommand.next({ type: 'deletePage', params: page });
  }

  isExpandDisabled(page: PebThemeShortPageInterface): boolean {
    if (page.expand === true) {
      return true;
    }
    const children = this.pages.filter(child => child.parentId === page.id);

    return !children || children.length === 0;
  }

  isCollapseDisabled(page: PebThemeShortPageInterface): boolean {
    if (!page.expand) {
      return true;
    }
    const children = this.pages.filter(child => child.parentId === page.id);

    return !children || children.length === 0;
  }

  isDeleteDisabled(page: PebThemeShortPageInterface): boolean {
    return page.variant === PebPageVariant.Front || (page.type === PebPageType.Replica && this.pages.length === 1);
  }

  isPageRemovable(page: PebThemeShortPageInterface): boolean {
    if (page.type !== this.pageType.Master) {
      return true;
    }

    const isMasterPageReplicated = this.editorStore.snapshot.pages.some((innerPage) => {
      return innerPage.master != null && innerPage.master.id === page.id;
    });

    return !isMasterPageReplicated;
  }

  onCloseClick() {
    this.closeContextMenu();
  }

  newSlide(page: PebThemeShortPageInterface, element: HTMLElement) {
    this.closeContextMenu();
    this.createPage();
  }

  skipSlide(page: PebThemeShortPageInterface) {
    this.closeContextMenu();
    const skip = page.skip;
    if (skip === undefined) {
      page.skip = true;
    } else {
      page.skip = !skip;
    }

    this.editorStore.updatePage(page, { skip: page.skip })
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }

  cutPage(page: PebThemeShortPageInterface) {
    const tempCopiedPage = this.isSelectedAll
      ? this.pages.filter(innerPage => !(this.isDeleteDisabled(innerPage)))
      : [page];
    forkJoin(tempCopiedPage.map((p) => {
      const pg = this.editorStore.pages[p.id];
      if (pg) {
        return of(pg);
      }

      return this.editorStore.getPage(p.id);
    })).pipe(
      first(),
      tap((pages) => {
        this.tempCopiedPage = pages;
        this.deletePageHandler(this.tempCopiedPage);
        this.closeContextMenu();
      }),
    ).subscribe();
  }

  copyPage(page: PebThemeShortPageInterface) {
    const tempCopiedPage = this.isSelectedAll
      ? this.pages.filter(innerPage => !(this.isDeleteDisabled(innerPage)))
      : [page];
    forkJoin(tempCopiedPage.map((p) => {
      const pg = this.editorStore.pages[p.id];
      if (pg) {
        return of(pg);
      }

      return this.editorStore.getPage(p.id);
    })).pipe(
      first(),
      tap((pages) => {
        this.tempCopiedPage = pages;
        this.closeContextMenu();
      }),
    ).subscribe();
  }

  pastePage(page: PebThemeShortPageInterface) {
    this.closeContextMenu();
    if (this.isSelectedAll) {
      this.isSelectedAll = false;
    }
    if (!this.tempCopiedPage || (this.tempCopiedPage as PebThemeShortPageInterface[]).length === 0) {
      console.warn('No set page(s) to be pasted!');

      return;
    }
    this.execCommand.next({ type: 'pastePage', params: this.tempCopiedPage });
  }

  selectAllPage() {
    this.closeContextMenu();
    this.isSelectedAll = true;
    this.cdr.detectChanges();
  }

  expandPage(page: PebThemeShortPageInterface) {
    page.expand = true;
    this.pages = this.pages.map(p => (p.id === page.id) ? page : p);
    this.cdr.detectChanges();
    this.closeContextMenu();
  }

  collapsePage(page: PebThemeShortPageInterface) {
    page.expand = false;
    this.pages = this.pages.map(p => (p.id === page.id) ? page : p);
    this.cdr.detectChanges();
    this.closeContextMenu();
  }

  editMasterSlide(page: PebThemeShortPageInterface) {
    this.closeContextMenu();
    this.editorState.pagesView = PebPageType.Master;
    this.editorState.pagesView$.subscribe(() => {
      if (this.pages.length > 0) {
        this.execCommand.next({ type: 'activatePage', params: this.pages[0] });
      }
    });
  }

  reapplyMaster(page: PebThemeShortPageInterface) {
    this.closeContextMenu();
  }

  duplicatePage(page: PebThemeShortPageInterface) {
    this.closeContextMenu();
    let duplicatedPage: any;
    if (this.isSelectedAll) {
      this.isSelectedAll = false;
      duplicatedPage = this.pages;
    } else {
      duplicatedPage = page;
    }
    if (duplicatedPage === undefined || duplicatedPage.length === 0) {
      console.warn('No set page(s) to be duplicated!');

      return;
    }
    this.execCommand.next({ type: 'duplicatePage', params: duplicatedPage });
  }

  actionCommand(command: any) {
    this.execCommand.next(command);
  }

  switchExpandCollapse(page: PebThemeShortPageInterface) {
    this.pages = this.pages.map(p => (p.id === page.id) ? page : p);
    this.cdr.detectChanges();
  }

  openContextMenu(event: any) {
    const evt: MouseEvent = event[0];
    const page: PebThemeShortPageInterface = event[1];
    this.closeContextMenu();
    if ((window as any).PEB_CONTEXT_MENUS_DISABLED) {
      console.warn('Context menus are disabled.\nActivate them by setting "PEB_CONTEXT_MENUS_DISABLED = false"');

      return;
    }

    evt.preventDefault();
    evt.stopPropagation();

    this.contextMenuPage = page;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(evt)
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
    });

    this.overlayRef.backdropClick().pipe(
      tap(() => this.overlayRef.dispose()),
    ).subscribe();

    this.overlayRef.attach(new TemplatePortal(this.pageMenu, this.viewContainerRef));
  }

  closePageNavigation() {
    if (!this.deviceService.isMobile) {
      return;
    }
    this.editorState.sidebarsActivity = {
      ...this.editorState.sidebarsActivity,
      [EditorSidebarTypes.Navigator]: false,
    };
  }

  closeContextMenu() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  private detachOverlay(): void {
    if (this.hasOverlayAttached()) {
      this.overlayRef.detach();
    }
  }

  private hasOverlayAttached(): boolean {
    return this.overlayRef && this.overlayRef.hasAttached();
  }
}
