import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output, PLATFORM_ID,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { debounce } from 'lodash-es';
import ResizeObserver from 'resize-observer-polyfill';
import { BehaviorSubject, fromEvent, merge, timer } from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  filter,
  mapTo,
  pairwise,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { AppType, APP_TYPE, PeDestroyService, PeUtilsService, PreloaderState } from '@pe/common';

import { GRID_LIST_ITEMS_TYPES, MAX_COLUMNS, MOBILE_COLUMNS } from '../constants';
import { ShowHideAnimation, FadeOutAnimation } from '../grid.animations';
import { PeGridService } from '../grid.service';
import { PeGridView } from '../misc/enums';
import { PeGridAddItem, PeGridItem, PeGridTableDisplayedColumns } from '../misc/interfaces';
import { PeGridSidenavService } from '../sidenav';
import { PeGridViewportService } from '../viewport';

import { PeGridItemComponent } from './item/item.component';
import { PeGridListItemComponent } from './list-item/list-item.component';
import { PeGridListService } from './list.service';


@Component({
  selector: 'pe-grid-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ PeDestroyService ],
  animations: [
    ShowHideAnimation,
    FadeOutAnimation,
  ],
})
export class PeGridListComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
  @SelectSnapshot(PreloaderState.loading) loading: {};

  @Input() isLoading = false;
  @Input() noItemsPlaceholder = 'items';
  @Input() minItemWidth = null;
  @Input() scrollBottomOffset = 10;
  isViewAdd = false
  @Input() set viewAdd(val: boolean) {
    this.isViewAdd = val;
    this.checkAddItem();
  };

  @Input() set displayedColumns(columns: PeGridTableDisplayedColumns[]) {
    this.listService.columns = columns;
  }

  @Output() create = new EventEmitter<void>();
  @Output() scrolledToEnd = new EventEmitter<void>();

  @ViewChild('virtualScroll', { static: false }) virtualScroll: ElementRef;
  @ViewChild('virtualScrollWrapper', { static: false }) virtualScrollWrapper: ElementRef;

  @ContentChild(TemplateRef, { static: false }) itemTemplate: TemplateRef<PeGridItemComponent>;
  @ContentChild(PeGridListItemComponent, { static: false }) virtualItem: PeGridListItemComponent;

  private readonly columns$ = new BehaviorSubject(MAX_COLUMNS);
  private readonly imageHeight$ = new BehaviorSubject(
    isPlatformBrowser(this.platformId) ? window.innerWidth <= 720 ? 100 : 200 : 160);

  private readonly rowHeight$ = new BehaviorSubject(
    isPlatformBrowser(this.platformId) ? window.innerWidth <= 720 ? 100 : 200 : 200);

  private resizeObserver: ResizeObserver;

  public items: (PeGridItem | PeGridAddItem)[] = [];
  public scrollWidth: number;
  public theme = this.gridService.theme;

  itemsInitialized$ = this.gridService.items$.pipe(
    skip(1),
    filter(value => !!value),
    mapTo(true),
  );

  @HostBinding('style') get columnsCount() {
    this.calcColumns();
    const imageHeight = this.viewportService.view === PeGridView.BigListCover
      ? `${100 / this.columns$.value / 2.5}vw`
      : `${this.imageHeight$.value - 48}px`;
    const heightKoef = window.innerWidth > 720 ? 32 : 72;

    return {
      '--columns': this.columns,
      '--image-height': imageHeight,
      height: `calc(100% - ${heightKoef}px)`,
      overflow: 'auto',
    };
  }

  private readonly gridItems$ = this.gridService.items$
    .pipe(
      distinctUntilChanged(),
      tap((items: PeGridItem[]) => {
        this.listService.transformColumns = { };
        this.items = [
          ...(this.isViewAdd ? [{ addGridItem: true }] : []),
          ...items.map((item: PeGridItem) => {
            this.listService.transformByNameColumns(item);

            return item;
          }),
        ];

        this.listService.firstRow = items[0];
        this.listService.lastRow = items[this.items.length - 1];
      }));

  private readonly viewChanges$ = this.viewportService.viewChange$
    .pipe(
      pairwise(),
      filter(([prev, current]: PeGridView[]) => prev !== current && GRID_LIST_ITEMS_TYPES.includes(current)),
      delay(1),
      switchMap(() => {
        this.calcColumns();
        this.cdr.markForCheck();

        return timer(500);
      }),
      tap(() => {
        this.calcRowHeight();
        this.cdr.markForCheck();
      }));

  constructor(
    private cdr: ChangeDetectorRef,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
    @Inject(PLATFORM_ID) private platformId,
    private gridService: PeGridService,
    private listService: PeGridListService,
    private sidenavService: PeGridSidenavService,
    private utilsService: PeUtilsService,
    private viewportService: PeGridViewportService,
    private readonly destroy$: PeDestroyService,
  ) {
    merge(
      this.gridItems$,
      this.viewChanges$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngAfterViewChecked(): void {
    this.virtualScroll && timer(1)
      .pipe(
        tap(() => {
          this.scrollWidth = this.virtualScroll.nativeElement.offsetWidth
            - this.virtualScrollWrapper.nativeElement.offsetWidth;
        }))
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.initListeners();
    this.initRowHeight();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  get columns(): number {
    return (this.isListWithMobileView && this.isMobile) ? 1 : this.columns$.value;
  }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  get isListWithMobileView(): boolean {
    return this.viewportService.view === PeGridView.ListWithMobile;
  }

  get isMobile(): boolean {
    return this.isListWithMobileView && (document.body.clientWidth <= 720);
  }

  public isShowSkeleton(): boolean {
    const length = this.isViewAdd && this.items?.length && (this.items[0] as PeGridAddItem)?.addGridItem ? 1 : 0;

    return (this.items?.length === length && this.isLoading) || this.isGlobalLoading;
  }

  private checkAddItem(): void {
    if (!this.items?.length) {
      this.items = this.isViewAdd ? [{ addGridItem: true }] : [];
    }
  }

  private initRowHeight(): void {
    if (this.viewportService.view === PeGridView.BigList) {
      const load$ = fromEvent(this.virtualItem?.imageRef.nativeElement, 'load')
        .pipe(
          delay(100),
          tap(() => {
            this.imageHeight$.next(Math.ceil(this.virtualItem.imageRef.nativeElement.offsetHeight));
            this.cdr.markForCheck();
          }),
          take(1));
      const timer$ = timer(100)
        .pipe(
          tap(() => {
            this.initRowHeight();
          }));

      merge(
        this.virtualItem?.imageRef
          ? load$
          : timer$
      ).pipe(takeUntil(this.destroy$)).subscribe();
    }
  }

  public trackByIdx(i: number, item: PeGridItem): string {
    return item.id;
  }

  private calcRowHeight(): void {
    if (this.viewportService.view === PeGridView.BigList) {
      if (
        this.virtualItem?.gridItemRef?.nativeElement?.offsetHeight
        && this.virtualItem?.imageRef?.nativeElement?.offsetHeight
      ) {
        this.rowHeight$.next(Math.ceil(this.virtualItem.gridItemRef.nativeElement.offsetHeight));
        this.imageHeight$.next(Math.ceil(this.virtualItem.imageRef.nativeElement.offsetHeight));
      } else {
        timer(100)
          .pipe(
            tap(() => {
              this.calcRowHeight();
            }),
            takeUntil(this.destroy$))
          .subscribe();
      }
    }
  }

  private initListeners(): void {
    const debounceCalc = this.utilsService.debounce((e) => {
      this.calcColumns();
      this.cdr.markForCheck();

      debounce(() => {
        this.calcRowHeight();
        this.cdr.markForCheck();
      }, 100)();
    });

    this.resizeObserver = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        debounceCalc(null);
      });
    });

    this.resizeObserver.observe(this.virtualScroll.nativeElement);
    this.sidenavService.toggleOpenStatus$
      .pipe(
        delay(500),
        tap(() => {
          debounceCalc(null);
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private calcColumns(): void {
    if (this.virtualScroll?.nativeElement?.offsetWidth > 0) {
      const minWidth = this.minItemWidth ?? this.viewportService.config.minItemWidth;
      const columns = window.innerWidth <= 720 && this.viewportService.view !== PeGridView.Table
        ? MOBILE_COLUMNS
        : Math.floor(this.virtualScroll.nativeElement.offsetWidth / minWidth);
      const maxColumns = this.viewportService.config.maxColumns;// ?? MAX_COLUMNS;
      this.columns$.next(columns < maxColumns ? columns : maxColumns);
    }
  }
}
