import { CdkDragDrop, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Select } from '@ngxs/store';
import { merge, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PageSnapshot } from '@pe/builder-abstract';
import { PebEditorState, PebPageId, PebScreen } from '@pe/builder-core';
import { pebScreenDocumentWidthList, PebThemeShortPageInterface } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PagePreviewService } from '@pe/builder-shared';
import { PebDeviceService, PeDestroyService } from '@pe/common';


@Component({
  selector: 'peb-page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PageListComponent implements OnInit, OnChanges {

  @Select(PebEditorOptionsState.screen) screen$: Observable<PebScreen>;

  @Input() totalPages: PebThemeShortPageInterface[];
  @Input() pages: PebThemeShortPageInterface[];
  @Input() parentPage: PebThemeShortPageInterface;
  @Input() activePageSnapshot: PageSnapshot;
  @Input() isSelectedAll = false;

  @Output() execCommand = new EventEmitter<any>();
  @Output() openMenu = new EventEmitter<any>();
  @Output() expandCollapse = new EventEmitter<any>();

  private readonly insertGroupDragX = 20;
  dragPlaceHolder = 'page-box-placeholder';

  readonly isMobile = this.deviceService.isMobile;

  pagesDict = {};

  previewOptions = {
    width: 100,
    height: 60,
    padding: {
      desktop: 0,
      tablet: 24,
      mobile: 40,
    },
  };

  content$: Observable<SafeHtml>;
  scale$: Observable<string>;

  constructor(
    private cdr: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    public editorState: PebEditorState,
    private editorStore: PebEditorStore,
    private deviceService: PebDeviceService,
    private previewService: PagePreviewService,
    private editorAccessorService: PebEditorAccessorService,
    private destroy$: PeDestroyService,
  ) { }

  ngOnInit(): void {
    this.previewService.previewSavedSubject$.pipe(
      tap(() => {
        this.pagesDict = {
          [this.activePageSnapshot.id]: this.activePageSnapshot,
        };
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.scale$ = this.screen$.pipe(
      map((screen) => {
        const scale = this.previewOptions.width / pebScreenDocumentWidthList[screen];

        return `scale(${scale})`;
      }),
    );

    this.content$ = this.editorAccessorService.rendererSubject$.pipe(
      filter(renderer => !!renderer),
      switchMap((renderer) => merge(
        this.editorStore.actionCommitted$,
        renderer.rendered,
      ).pipe(
        map(() => {
          const html = this.previewService.replaceVideoAnImage(renderer);

          return this.sanitizer.bypassSecurityTrustHtml(html.outerHTML);
        }),
      ))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activePageSnapshot) {
      const snapshot = changes.activePageSnapshot.currentValue as PageSnapshot;
      this.pagesDict[snapshot?.id] = snapshot;
    }
  }

  trackByPage(index, page) {
    return page ? page.id : undefined;
  }

  isActivePage$(pageId: string): Observable<boolean> {
    return this.editorStore.activePageId$.pipe(
      map(activePageId => activePageId === pageId),
    );
  }

  isSelectedPage$(pageId: string): Observable<boolean> {
    return this.editorStore.activePageId$.pipe(
      map(activePageId => activePageId === pageId ? false : this.isSelectedAll),
    );
  }

  onSelect(selectedPage: PebThemeShortPageInterface) {
    this.isSelectedAll = false;
    this.execCommand.emit({ type: 'activatePage', params: selectedPage });
  }

  getPageSnapshot(pageId: PebPageId): PageSnapshot {
    return pageId === this.activePageSnapshot?.id ? this.activePageSnapshot : null;
  }

  getPage(pageId: string) {
    return this.pagesDict[pageId] ? this.editorStore.pages[pageId] : null;
  }

  getChildPages(page: PebThemeShortPageInterface): PebThemeShortPageInterface[] {
    return this.totalPages.filter(child => child.parentId === page.id);
  }

  openContextMenu(evt: MouseEvent, page: PebThemeShortPageInterface) {
    this.openMenu.emit([evt, page]);
  }

  _openContextMenu(event: any) {
    this.openMenu.emit(event);
  }

  actionCommand(event: any) {
    this.execCommand.emit(event);
  }

  getPreviewClassName(page: PebThemeShortPageInterface): string {
    return !page.parentId ? 'page__preview' : 'page__preview_child';
  }

  getPageNameClassName(page: PebThemeShortPageInterface): string {
    return !page.parentId ? 'page__name' : 'page__name_child';
  }

  getSkipClassName(page: PebThemeShortPageInterface): string {
    return !page.parentId ? 'skip-container' : 'skip-container-child';
  }

  dragMoved(event: CdkDragMove) {
    this.dragPlaceHolder = (event.distance.x > this.insertGroupDragX)
    ? 'page-box-child-placeholder'
    : 'page-box-placeholder';
  }

  hasChild(page: PebThemeShortPageInterface): boolean {
    return this.getChildPages(page)?.length > 0;
  }

  showExpandArrow(page: PebThemeShortPageInterface): string {
    if (!this.hasChild(page)) {
      return 'expand-arrow-hide';
    }

    return page.expand ? 'expand-arrow-show' : 'collapse-arrow-show';
  }

  switchExpandCollapse(page: PebThemeShortPageInterface) {
    page.expand = !page.expand;
    this.expandCollapse.emit(page);
  }

  dropped(event: CdkDragDrop<string[]>) {
    const selectedPage = this.pages[event.previousIndex];
    if (!this.parentPage) {

      // Main pages
      const parentPage = this.getParentPage(event);
      if (event.distance.x <= this.insertGroupDragX || !parentPage) {
        // order change between Main Pages
        this.actionReorderPages(event);

        return;
      }

      // Main => Inner
      this.pages[event.previousIndex].parentId = parentPage.id;
      this.editorStore.updatePage(selectedPage, { parentId: parentPage.id })
      .pipe(
        tap(() => {
          let pageIds = this.totalPages.map(page => page.id);
          const parentIndex = pageIds.indexOf(pageIds.find(id => parentPage.id === id));
          pageIds = this.arrayMove(pageIds, event.previousIndex, parentIndex + 1);
          this.execCommand.emit({ type: 'reorderPages', params: pageIds });
          this.cdr.detectChanges();
        }),
      )
      .subscribe();

      return;
    }

    // Inner pages
    if (event.distance.x > this.insertGroupDragX) {
      // order change between Inner Pages
      let pageIds = this.totalPages.map(page => page.id);
      const parentIndex = pageIds.indexOf(pageIds.find(id => this.parentPage.id === id));

      moveItemInArray(this.pages, event.previousIndex, event.currentIndex);

      pageIds = this.arrayMove(pageIds, parentIndex + 1 + event.previousIndex, parentIndex + 1 + event.currentIndex);
      this.execCommand.emit({ type: 'reorderPages', params: pageIds });

      return;
    }

    // Inner => Main pages
    this.pages[event.previousIndex].parentId = undefined;
    this.editorStore.updatePage(selectedPage, { parentId: undefined })
    .pipe(
      tap(() => {
        let pageIds = this.totalPages.map(page => page.id);
        const parentIndex = pageIds.indexOf(pageIds.find(id => this.parentPage.id === id));
        pageIds = this.arrayMove(pageIds, parentIndex + 1 + event.previousIndex, parentIndex);
        this.execCommand.emit({ type: 'reorderPages', params: pageIds });
        this.cdr.detectChanges();
      }),
    )
    .subscribe();

  }


  private arrayMove(arr: string[], oldIndex: number, newIndex: number) {
    if (newIndex >= arr.length) {
      let k = newIndex - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);

    return arr;
  }

  private getParentPage(event: CdkDragDrop<string[]>): PebThemeShortPageInterface {
    const page = this.pages[event.previousIndex];

    if (this.pages[event.currentIndex].id === page.id) {
      return this.pages[event.currentIndex - 1];
    }

    if (this.pages[event.currentIndex - 1]?.id === page.id) {
      return this.pages[event.currentIndex];
    }

    return this.pages[event.currentIndex - 1];
  }

  private actionReorderPages(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.pages, event.previousIndex, event.currentIndex);
    const pageIds = [];
    this.pages.map(p => [p, ...this.getChildPages(p)].map(e => pageIds.push(e.id)));
    this.execCommand.emit({ type: 'reorderPages', params: pageIds });
  }
}
