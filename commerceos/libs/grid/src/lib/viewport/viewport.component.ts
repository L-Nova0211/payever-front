import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { fromEvent } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';

import { AppThemeEnum, AppType, APP_TYPE, EnvService, PeDestroyService, PreloaderState } from '@pe/common';

import { GRID_LIST_ITEMS_TYPES, GRID_TABLE_ITEMS_TYPES } from '../constants';
import { FadeInAnimation, FadeOutAnimation } from '../grid.animations';
import { PeGridMenuService } from '../menu/menu.service';
import { PeGridView } from '../misc/enums';
import { PeGridMenu, PeGridViewportContextSelect } from '../misc/interfaces';
import { PeGridQueryParamsService } from '../misc/services/query-params.service';
import { PeGridSidenavService } from '../sidenav';

import { PeGridViewportService } from './viewport.service';

@Component({
  selector: 'pe-grid-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss'],
  providers: [PeDestroyService],
  animations: [
    FadeInAnimation,
    FadeOutAnimation,
  ],
})
export class PeGridViewportComponent implements OnChanges, OnDestroy {
  @SelectSnapshot(PreloaderState.loading) loading: {};

  @Input() totalValue: string;
  @Input() viewportTitle: string;
  @Input() contextMenu: PeGridMenu;
  @Input() defaultLayout: PeGridView ;
  @Input() set allowSetQueryPArams(allow: boolean) {
    this.gridQueryParamsService.allowUseQueryParams = allow;
  }

  @Input() set canDestroyStorage(allow: boolean) {
    this.gridQueryParamsService.canDestroyStorage = allow;
  }

  @Input() set selectable(value: boolean) {
    this.peGridViewportService.selectable = value;
  }

  @Output() itemContextSelect = new EventEmitter<PeGridViewportContextSelect>();

  @Input() openSidebarFunc = () => {
    this.peGridSidenavService.toggleOpenStatus$.next(true);
  };

  @HostBinding('class') get getTheme(): string {
    return this.envService?.businessData?.themeSettings?.theme
      ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
      : AppThemeEnum.default;
  }

  @HostListener('contextmenu', ['$event']) onContextMenu(e: PointerEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this.contextMenu?.items || !this.contextMenu?.items.length) { return; }

    const contextMenu$ = this.menuService.openContextMenu(
      e,
      this.contextMenu,
    );

    contextMenu$?.pipe(
      tap((item) => {
        item && this.itemContextSelect.emit({
          menuItem: item,
        });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  constructor(
    private envService: EnvService,
    private gridQueryParamsService: PeGridQueryParamsService,
    private menuService: PeGridMenuService,
    private peGridSidenavService: PeGridSidenavService,
    private peGridViewportService: PeGridViewportService,
    private readonly destroy$: PeDestroyService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
    fromEvent(window, 'resize').pipe(
      tap(() => {
        const isMobile = window.innerWidth <= 720;

        if (isMobile !== this.peGridViewportService.isMobile) {
          this.peGridViewportService.isMobile = isMobile;
          this.peGridViewportService.deviceTypeChange$.next({ isMobile });
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  get isMobile(): boolean {
    return this.peGridViewportService.isMobile;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { defaultLayout } = changes;
    if (defaultLayout?.currentValue) {
      this.peGridViewportService.view = defaultLayout.currentValue;
    }
  }

  ngOnDestroy(): void {
    this.gridQueryParamsService.destroy();
  }

  public get isListView(): boolean {
    return GRID_LIST_ITEMS_TYPES.includes(this.peGridViewportService.view);
  }

  public get isTableView(): boolean {
    return GRID_TABLE_ITEMS_TYPES.includes(this.peGridViewportService.view);
  }
}
