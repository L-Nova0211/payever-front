import {
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
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import ResizeObserver from 'resize-observer-polyfill';
import { fromEvent, merge, timer } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise, skip, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AppType, APP_TYPE, PeDestroyService, PeHelpfulService, PreloaderState } from '@pe/common';

import { GRID_TABLE_ITEMS_TYPES } from '../constants';
import { ShowHideAnimation, FadeOutAnimation } from '../grid.animations';
import { PeGridService } from '../grid.service';
import { PeGridView } from '../misc/enums';
import { PeGridItem, PeGridTableDisplayedColumns } from '../misc/interfaces';
import { PeGridViewportService } from '../viewport';

import { PeGridTableRowComponent } from './row/row.component';
import { CHECKBOX_WIDTH, PeGridTableService } from './table.service';

@Component({
  selector: 'pe-grid-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [PeDestroyService],
  animations: [
    ShowHideAnimation,
    FadeOutAnimation,
  ],
})
export class PeGridTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @SelectSnapshot(PreloaderState.loading) loading: {};

  @Input() set displayedColumns(columns: PeGridTableDisplayedColumns[]) {
    this.tableService.columns = columns;
  }

  @Input() isLoading = false;

  @Input('showHeadInMobile') set setShowHeadInMobile(val: boolean) {
    this.showHeadInMobile = val;
    this.tableService.showHeadInMobile = val;
  }

  @Input() scrollBottomOffset = 10;
  @Input() noItemsPlaceholder = 'items';

  @Output() scrolledToEnd = new EventEmitter<void>();

  @ViewChild('virtualScrollTable', { static: false }) virtualScrollTable: ElementRef;
  @ViewChild('virtualScrollTableWrapper', { static: false }) virtualScrollTableWrapper: ElementRef;
  @ViewChild('scrollWrapper', { static: false }) scrollWrapper: ElementRef;

  @ContentChild(TemplateRef, { static: false }) rowTemplate: TemplateRef<PeGridTableRowComponent>;

  itemsInitialized$ = this.peGridService.items$.pipe(
    skip(1),
    filter(value => !!value),
    map(value => value.length ? false : true),
  );

  items: PeGridItem[];
  virtualScrollTableWrapperHeight = 0;
  showHeadInMobile = false;
  scheduledAnimationFrame = false;
  scrollWrapperHeight = 1000;

  isScrollToEnd = false;
  isTableActive = false;
  isScrollActive = false;
  isMobile = this.viewportService.isMobile || this.tableService.isMobile;

  get buttonsCount(): number {
    let count = 0;
    if (this.tableService.hasActionButton) { count++; }
    if (this.tableService.hasPreviewButton) { count++; }
    if (this.tableService.hasBadgeButton) { count++; }

    return count;
  }

  get checkboxWidth() {
    return CHECKBOX_WIDTH;
  }

  get isTableView() {
    return this.viewportService.view === PeGridView.Table;
  }

  mobileRowHeight: number;
  resizeObserver: ResizeObserver;
  resizeObserverWrapper: ResizeObserver;
  displayColumnsData: PeGridTableDisplayedColumns[] = [];

  @HostBinding('class') get theme() {
    return this.peGridService.theme;
  }

  constructor(
    public peGridViewportService: PeGridViewportService,
    public tableService: PeGridTableService,
    private readonly destroy$: PeDestroyService,
    private peGridService: PeGridService,
    private gridHelpfulService: PeHelpfulService,
    private viewportService: PeGridViewportService,
    private cdr: ChangeDetectorRef,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
    merge(
      this.viewportService.isMobile$.pipe(
        tap(isMobile => {
          this.isMobile = isMobile;
          this.cdr.markForCheck();
        }),
      ),
      this.viewportService.viewChange$.pipe(
        pairwise(),
        filter(([, current]: PeGridView[]) => {
          return GRID_TABLE_ITEMS_TYPES.includes(current) && current === this.viewportService.view;
        }),
        switchMap(() => timer(1).pipe(
          tap(() => {
            this.initWrapperSize();
            this.cdr.markForCheck();
          }),
        ))
      ),
      this.tableService.mobileRowHeight$.pipe(
        distinctUntilChanged(),
        switchMap((rowHeight) => {
          this.mobileRowHeight = rowHeight;

          return timer(1).pipe(
            tap(() => {
              this.cdr.markForCheck();
            }),
          );
        })
      ),
      this.tableService.displayedColumns$.pipe(
        tap((columns) => {
          this.displayColumnsData = columns;
          this.cdr.markForCheck();
        })
      )
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  ngOnInit(): void {
    this.checkWidth();
  }

  get isTableWidthScroll(): boolean {
    return this.viewportService.view === PeGridView.TableWithScroll;
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        this.checkWidth();
      });
    });
    if (this.virtualScrollTable?.nativeElement) {
      this.resizeObserver.observe(this.virtualScrollTable?.nativeElement);
    }

    merge(
      this.peGridService.items$.pipe(
        distinctUntilChanged(),
        tap((items: PeGridItem[]) => {
          this.tableService.transformColumns = {};
          this.items = items.map(item => {
            if (item?.image) {
              this.gridHelpfulService.isValidImgUrl(item.image).then((res) => {
                if (res.status !== 200) {
                  this.cdr.markForCheck();
                }
              });
            }

            this.tableService.transformByNameColumns(item);

            return item;
          });
          this.tableService.firstRow = this.items[0];
          this.tableService.lastRow = this.items[this.items.length - 1];
        })
      )
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();

    this.initScroll();
  }

  initScroll() {
    if (this.virtualScrollTable && this.scrollWrapper) {
      merge(
        fromEvent(this.virtualScrollTable.nativeElement, 'scroll').pipe(
          filter(() => this.isTableActive),
          tap((e: Event) => {
            this.onScroll(e, this.scrollWrapper);
          })
        ),
        fromEvent(this.scrollWrapper.nativeElement, 'scroll').pipe(
          filter(() => this.isScrollActive),
          tap((e: Event) => {
            this.onScroll(e, this.virtualScrollTable);
          })
        ),
      ).pipe(
        takeUntil(this.destroy$)
      ).subscribe();
    }
  }

  onScroll(e, wrapper: ElementRef) {
    if (wrapper?.nativeElement) {
      wrapper.nativeElement.scrollTop = e.target.scrollTop;
    }
    if (this.scheduledAnimationFrame) {
      return;
    }

    this.scheduledAnimationFrame = true;

    requestAnimationFrame(() => {
      this.scheduledAnimationFrame = false;
    });
  }

  initWrapperSize() {
    this.resizeObserverWrapper = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }

        this.scrollWrapperHeight = entries[0].contentRect.height + entries[0].contentRect.y * 2;
      });
    });
    if (this.virtualScrollTableWrapper) {
      this.resizeObserverWrapper.observe(this.virtualScrollTableWrapper.nativeElement);
    }
  }

  isShowSkeleton(): boolean {
    return (this.items?.length === 0 && this.isLoading) || this.isGlobalLoading;
  }

  trackByIdx(i: number, item: PeGridItem): string {
    return item.id;
  }

  ngOnDestroy(): void {
    this.tableService.destroy();
    this.resizeObserver?.disconnect();
    this.resizeObserverWrapper?.disconnect();
  }

  private checkWidth() {
    timer(1).pipe(
      tap(() => {
        this.tableService.isMobile = document.body.clientWidth <= 720;
        this.cdr.markForCheck();
      }),
    ).subscribe();
  }
}
