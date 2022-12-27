import { ChangeDetectorRef, Component, EventEmitter, HostBinding, Inject, Input, Optional, Output } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { AppType, APP_TYPE, PeDestroyService, PreloaderState } from '@pe/common';
import { FolderItem, MoveIntoFolderEvent } from '@pe/folders';


import { PeGridService } from '../grid.service';
import { PeMoveOverviewService } from '../misc/services/move-overview.service';
import { DEFAULT_SIDENAV, PeGridSidenavService } from '../sidenav';
import { PeGridToolbarService } from '../toolbar/toolbar.service';

@Component({
  selector: 'pe-grid-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  providers: [PeDestroyService],
})

export class PeGridContentComponent {
  @SelectSnapshot(PreloaderState.loading) loading: {};

  @Input() folders: FolderItem[];
  @Input() fixContentBottomPadding = false;
  @Input() sidenavName = DEFAULT_SIDENAV;
  @Input() totalData: {
    label: string;
    value: string;
  };

  @Input() mobileTitle: string;
  @Input() showMobileFooter = true;
  @Input() showMobileTitle = true;
  @Input() mobileView = false;

  @Output() moveToFolder = new EventEmitter<MoveIntoFolderEvent>();
  @Output() deleteItems = new EventEmitter<{
    themeIds: string[],
    folderIds: string[]
  }>();

  @HostBinding('class') get theme() {
    return this.peGridService.theme;
  }

  @HostBinding('class.pe-grid-content_fix-bottom-padding') get isPaddingFixed(): boolean {
    return !this.isMobile && this.fixContentBottomPadding;
  }

  @HostBinding('class.pe-grid-content_opened') get isOpenSidenav() {
    return this.sidenavName === DEFAULT_SIDENAV
      ? this.peGridSidenavService.toggleOpenStatus$.value
      : this.peGridSidenavService.sidenavOpenStatus?.[this.sidenavName]
        ? this.peGridSidenavService.sidenavOpenStatus[this.sidenavName].value
        : true;
  }

  @HostBinding('class.pe-grid-content_embed-mod') get embedMod() {
    return this.peGridService.embedMod;
  }

  @HostBinding('class.pe-grid-content-mobile-view')
  get isContentMobile() {
    return this.mobileView;
  }

  get isMobile(): boolean {
    return window.innerWidth <= 720 || this.mobileView;
  }

  constructor(
    private peGridService: PeGridService,
    private peGridSidenavService: PeGridSidenavService,
    private peGridToolbarService: PeGridToolbarService,
    private cdr: ChangeDetectorRef,
    private moveOverviewService: PeMoveOverviewService,
    private destroy$: PeDestroyService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
  }

  get isMobileTitle(): boolean {
    return this.isMobile && this.mobileTitle && this.showMobileTitle;
  }

  get isSelected(): boolean {
    return !!this.peGridService.selectedItems.length;
  }

  get allSelected(): boolean {
    return this.peGridService.isAllSelected();
  }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  toggleSelect(): void {
    this.peGridService.selectedItems = this.allSelected ? [] : this.peGridService.items;
    this.cdr.detectChanges();
  }

  onDelete(): void {
    this.deleteItems.emit({
      themeIds: this.peGridService.selectedItemsIds,
      folderIds: this.peGridService.selectedFoldersIds,
    });
    this.peGridService.selectedItems = [];
    this.cdr.detectChanges();
  }

  onMove(): void {
    this.moveOverviewService.openOverview();
    this.moveOverviewService.selectFolder$.pipe(
      take(1),
      filter(event => !!event.folder),
      tap((event: MoveIntoFolderEvent) => {
        this.moveToFolder.emit(event);
        this.peGridService.selectedItems = [];
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  openFilter(): void {
    this.peGridToolbarService.openMobileSearch();
  }


}
