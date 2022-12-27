import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import ResizeObserver from 'resize-observer-polyfill';
import { merge } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { AppType, APP_TYPE, PeDestroyService, PreloaderState } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { MAX_COLUMNS, MIN_ITEM_WIDTH } from '../constants';
import { FadeInAnimation } from '../grid.animations';
import { PeGridService } from '../grid.service';
import { PeGridListService } from '../list/list.service';
import { PeGridMenuService } from '../menu';
import { PeDataGridLayoutByActionIcon, PeGridMenuPosition, PeGridView } from '../misc/enums';
import {
  PeCustomMenuInterface,
  PeFilterChange,
  PeFilterKeyInterface,
  PeGridMenu,
  PeGridMenuConfig,
  PeGridMenuItem,
} from '../misc/interfaces';
import { PeGridQueryParamsService } from '../misc/services/query-params.service';
import { PeGridTableService } from '../table/table.service';
import { PeGridViewportService } from '../viewport/viewport.service';

import { PeGridToolbarService } from './toolbar.service';

@Component({
  selector: 'pe-grid-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  providers: [PeDestroyService],
  animations: [
    FadeInAnimation,
  ],
})
export class PeGridToolbarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @SelectSnapshot(PreloaderState.loading) loading: {};

  @HostBinding('class') get theme() {
    return this.peGridService.theme;
  }

  @Input() filterConfig: PeFilterKeyInterface[];
  @Input() searchItems: PeFilterChange[] = [];
  @Input() customMenus: PeCustomMenuInterface[] = [];
  @Input() viewAdd = true;
  @Input() viewMenu: PeGridMenu = {
    title: this.translateService.translate('grid.content.toolbar.layout'),
    items: [
      {
        defaultIcon: PeDataGridLayoutByActionIcon.ListLayout,
        label: this.translateService.translate('grid.content.toolbar.list'),
        value: PeGridView.Table,
      },
      {
        defaultIcon: PeDataGridLayoutByActionIcon.GridLayout,
        label: this.translateService.translate('grid.content.toolbar.grid'),
        value: PeGridView.List,
      },
    ],
  };

  @Input() sortMenu: PeGridMenu;
  @Input() optionsMenu: PeGridMenu;
  @Input() totalItems: number;
  @Input() hideLayoutSwitcher: boolean;

  @Output() filtersChange = new EventEmitter<PeFilterChange[]>();
  @Output() optionsChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() viewChange = new EventEmitter<PeGridView>();
  @Output() create = new EventEmitter<void>();


  @ViewChild('filterForm', { static: true }) filterFormRef: TemplateRef<any>;

  peGridView = PeGridView;
  peGridMenuPosition = PeGridMenuPosition;

  get layoutIcon(): PeDataGridLayoutByActionIcon {
    let icon = PeDataGridLayoutByActionIcon.GridLayout;
    if ([this.peGridView.Table, this.peGridView.TableWithScroll].includes(this.peGridViewportService.view)) {
      icon = PeDataGridLayoutByActionIcon.ListLayout;
    }

    return icon;
  }

  get sortIcon(): string {
    let icon = 'sort-icon';
    if (this.sortSelected?.defaultIcon) {
      icon = this.sortSelected.defaultIcon;
    }

    return icon;
  }

  get hasColumnsItems(): boolean {
    return this.tableService.columns?.some(a => !!a.selected$);
  }

  get columnsMenu(): PeGridMenu {
    const cols = [PeGridView.Table, PeGridView.TableWithScroll].includes(this.peGridViewportService.view)
      ? this.tableService.columns
      : this.listService.columns;

    return {
      title: this.translateService.translate('grid.content.toolbar.columns'),
      items: cols.filter(a => !!a.selected$).map(a => {
        return {
          label: a.title,
          value: a.name,
          checked$: a.selected$,
          checkbox: true,
          disabled: a?.disabled ?? false,
        };
      }),
    };
  }

  countItems = 0;
  countSelectedItems = 0;
  sortSelected = null;
  resizeObserver: ResizeObserver;
  isMobileView = false;

  constructor(
    public peGridViewportService: PeGridViewportService,
    private readonly destroy$: PeDestroyService,
    private peGridService: PeGridService,
    private peGridMenuService: PeGridMenuService,
    private toolbarService: PeGridToolbarService,
    private tableService: PeGridTableService,
    private listService: PeGridListService,
    private element: ElementRef,
    private cdr: ChangeDetectorRef,
    private gridQueryParamsService: PeGridQueryParamsService,
    private translateService: TranslateService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(['viewmode-24']);
  }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  ngOnInit(): void {
    merge(
      this.peGridService.items$.pipe(
        tap(items => { this.countItems = items.length; }),
      ),
      this.peGridService.selectedItems$.pipe(
        tap(selectedItems => { this.countSelectedItems = selectedItems.length; }),
      ),
      this.peGridViewportService.viewChange$.pipe(
        tap( (view) => {
          const viewItem = this.viewMenu.items.find(item => item.value === view);
          this.peGridViewportService.config = {
            minItemWidth: viewItem?.minItemWidth ?? MIN_ITEM_WIDTH,
            maxColumns: viewItem?.maxColumns ?? MAX_COLUMNS,
          };
        }),
      ),
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();

    this.registerResizeToolbar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { totalItems, customMenus } = changes;
    if (totalItems?.currentValue !== undefined) {
      this.totalItems = totalItems.currentValue;
      this.toolbarService.totalItems = totalItems.currentValue;
    }

    if (customMenus?.currentValue) {
      this.customMenus = customMenus.currentValue;
    }
  }

  ngAfterViewInit(): void {
    this.toolbarService.filterFormRef = this.filterFormRef;
  }

  addedFilter(filter: PeFilterChange): void {
    this.searchItems.push(filter);
    this.filtersChange.emit(this.searchItems);
    this.toolbarService.searchOverlay?.dispose();
  }

  openMobileSearch(): void {
    if (this.isMobileView || window.innerWidth <= 720) {
      this.toolbarService.openMobileSearch();
    }
  }

  getMenuConfig(offsetX = 0, offsetY = 0, position: PeGridMenuPosition, minWidth?: number): PeGridMenuConfig {
    const config: PeGridMenuConfig = {
      offsetX,
      offsetY,
      position,
    };

    return minWidth ? { minWidth, ...config } : config;
  }

  openOptionsMenu(e: Event): void {
    e?.preventDefault();
    e?.stopPropagation();
    const config = this.getMenuConfig(0, 12, this.peGridMenuPosition.RightBottom);

    this.peGridMenuService.open(<any>e.target, this.optionsMenu, config);

    this.peGridMenuService.overlayClosed$.pipe(
      take(1),
      filter(data => !!data),
      tap((data) => {
        this.optionsChange.emit(data.value);
      }),
    ).subscribe();
  }

  openCustomMenu(element: any, customMenu: PeCustomMenuInterface): void {
    const config = this.getMenuConfig(8, 16, PeGridMenuPosition.RightBottom);
    const menu: PeGridMenu = {
      title: customMenu.title,
      items: customMenu.items?.map(a => {
        return {
          label: a.label,
          onClick: () => a.onClick(),
          defaultIcon: a.icon,
        };
      }),
      templateRef: customMenu?.templateRef,
    };
    this.peGridMenuService.open(element, menu, config);
  }

  openSortMenu(element: any): void {
    const config = this.getMenuConfig(8, 16, PeGridMenuPosition.RightBottom);
    const sortMenu = this.sortMenu;
    if (this.sortSelected?.value) {
      sortMenu.items = this.activeItemsMapper(sortMenu.items, this.sortSelected.value);
    }

    this.peGridMenuService.open(element, sortMenu, config);

    this.peGridMenuService.overlayClosed$.pipe(
      take(1),
      filter(data => !!data),
      tap((data) => {
        this.sortSelected = data;
        this.sortChange.emit(data.value);
      }),
    ).subscribe();
  }

  openViewMenu(element: any): void {
    const config = this.getMenuConfig(12, 16, PeGridMenuPosition.RightBottom);
    const viewMenu = this.viewMenu;
    viewMenu.items = this.activeItemsMapper(viewMenu.items, this.peGridViewportService.view);

    this.peGridMenuService.open(element, viewMenu, config);

    this.peGridMenuService.overlayClosed$.pipe(
      take(1),
      filter(data => !!data),
      tap((data) => {
        this.peGridViewportService.view = data.value;
        this.gridQueryParamsService.viewToParams(data.value);
        this.gridQueryParamsService.scrollPositionToParams(0);
        this.viewChange.emit(data.value);
      }),
    ).subscribe();
  }

  openColumnSwitcher(element: any): void {
    const config = this.getMenuConfig(14, 16, PeGridMenuPosition.RightBottom);
    const columnsMenu = this.columnsMenu;

    this.peGridMenuService.open(element, columnsMenu, config);

  }

  removeFilter(i: number): void {
    this.searchItems.splice(i, 1);
    this.filtersChange.emit(this.searchItems);
  }

  removeAllFilters(): void {
    this.searchItems.splice(0);
    this.filtersChange.emit(this.searchItems);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private activeItemsMapper(items: PeGridMenuItem[], selected: string): PeGridMenuItem[] {
    return items.map(item => {
      return {
        ...item,
        active: item.value === selected,
      };
    });
  }

  private registerResizeToolbar(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        this.isMobileView = (entries[0].target as HTMLDivElement).offsetWidth <= 480;
        this.cdr.detectChanges();
      });
    });

    this.resizeObserver.observe(this.element.nativeElement);
  }
}
