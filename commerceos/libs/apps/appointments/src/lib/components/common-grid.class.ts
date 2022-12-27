import { ChangeDetectorRef, Directive, ElementRef, Injector, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, map, skip, startWith, takeUntil, tap } from 'rxjs/operators';

import {
  AppThemeEnum,
  APP_TYPE,
  EnvService,
  PeDataGridPaginator,
  PeDestroyService,
  PePreloaderService,
} from '@pe/common';
import {
  FolderItem,
  PeFolderEditorActionDataInterface,
} from '@pe/folders';
import {
  MIN_ITEM_WIDTH,
  PeGridContextMenuActionsEnum,
  PeGridItem, PeGridItemsActions,
  PeGridItemType,
  PeGridMenu,
  PeGridQueryParamsService,
  PeGridSearchDataInterface,
  PeGridSearchFiltersInterface,
  PeGridService,
  PeGridSortingDirectionEnum,
  PeGridSortingInterface,
  PeGridSortingOrderByEnum,
  PeGridState, PeGridView,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import {
  PeAppointmentsReferenceService,
} from '../services';

import { TABLE_DISPLAYED_COLUMNS } from './menu-constants';
import { PeCommonItemService } from '../classes';

@Directive()
export class PeGridCommonClassDirective {

  @ViewChild('canvas', { static: false }) canvas: ElementRef;

  // Angular
  protected activatedRoute = this.injector.get(ActivatedRoute);
  protected cdr = this.injector.get(ChangeDetectorRef);
  protected router = this.injector.get(Router);
  protected store = this.injector.get(Store);
  // Pe Services
  protected appType = this.injector.get(APP_TYPE);
  private envService = this.injector.get(EnvService);
  protected peGridQueryParamsService = this.injector.get(PeGridQueryParamsService);
  protected peAppointmentsReferenceService = this.injector.get(PeAppointmentsReferenceService);
  protected peCommonItemService = this.injector.get(PeCommonItemService);
  protected peGridService = this.injector.get(PeGridService);
  protected peOverlayWidgetService = this.injector.get(PeOverlayWidgetService);
  protected pePreloaderService = this.injector.get(PePreloaderService);
  protected snackbarService = this.injector.get(SnackbarService);
  protected translateService = this.injector.get(TranslateService);
  protected readonly destroy$ = this.injector.get(PeDestroyService);

  // Buttons
  protected readonly cancelBtn = this.translateService.translate('folders.actions.cancel');
  protected readonly deleteBtn = this.translateService.translate('folders.actions.delete');

  // Vars
  protected copiedItem: PeGridItem;
  protected filterConfiguration: PeGridSearchFiltersInterface;
  protected sortingOrder: PeGridSortingInterface = {
    direction: PeGridSortingDirectionEnum.Ascending,
    orderBy: PeGridSortingOrderByEnum.CreationDate,
  };

  public gridLayout = PeGridView.List;
  public gridItems: PeGridItem[] = [];
  public paginator: PeDataGridPaginator = { page: 1, perPage: this.perPageCount(), total: 0 };
  public showAddNewItem = true;
  public viewportTitle: string;

  public readonly tableDisplayedColumns = TABLE_DISPLAYED_COLUMNS;

  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  public readonly rootFolder: FolderItem = {
    _id: null,
    children: [],
    image: 'assets/icons/folder.svg',
    name: 'Root folder',
    position: null,
  };

  public selectedFolder = this.rootFolder;

  public readonly theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  protected readonly intro = this.translateService.translate('appointments-app.notify.appointment');
  protected readonly onSelectFolder$ = new Subject<FolderItem>();
  protected readonly openEditor$ = new Subject<{
    actionData?: PeFolderEditorActionDataInterface,
    gridItem?: PeGridItem,
  }>();

  protected readonly scrolledToEnd$ = new Subject<void>();

  public readonly gridItems$ = this.store.select(PeGridState.gridItems())
    .pipe(
      skip(1),
      startWith([]),
      tap((gridItems) => {
        this.gridItems = gridItems;
      }));

  protected readonly loadMore$ = this.scrolledToEnd$
    .pipe(
      map(() => {
        const { page, perPage, total } = this.paginator;

        return total / perPage > page;
      }),
      filter(Boolean),
      tap(() => {
        this.paginator.page += 1;
      }));

  protected readonly saveAppointmentItem$ = new BehaviorSubject<any>(null);
  protected readonly appointmentItemEditor$ = this.saveAppointmentItem$
    .pipe(
      skip(1),
      tap(({ appointmentData, isUpdate }) => {
        if (appointmentData.isDefault) {
          this.gridItems.forEach((item) => {
            if (item.badge.label) {
              const editedItem = cloneDeep(item);
              editedItem.badge.label = null;
              editedItem.data.isDefault = false;
              this.store.dispatch(new PeGridItemsActions.EditItem(editedItem));
            }
          });
        }

        const gridItem = this.peCommonItemService
          .appointmentItemToGridItemMapper([appointmentData], this.canvas)[0];
        const storeAction = isUpdate
          ? new PeGridItemsActions.EditItem(gridItem)
          : new PeGridItemsActions.AddItem(gridItem);
        const condition = this.translateService.translate(
          isUpdate
            ? 'appointments-app.notify.successfuly_updated'
            : 'appointments-app.notify.successfuly_created',
        );
        const notify = `${this.intro} "${appointmentData.date ?? appointmentData.name ?? appointmentData.timeZone}" ${condition}`;

        this.store.dispatch(storeAction);
        this.paginator.total += isUpdate ? 0 : 1;
        this.peAppointmentsReferenceService.appointmentEditor.close();
        this.showSnackbar(notify);
      }));

  constructor(protected injector: Injector) {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        tap(this.loadItemsAfterAction),
        takeUntil(this.destroy$))
      .subscribe();
  }

  protected get getSearchData(): PeGridSearchDataInterface {
    const { page, perPage } = this.paginator;
    const { direction, orderBy } = this.sortingOrder;

    return {
      configuration: this.filterConfiguration,
      direction: direction,
      orderBy: orderBy,
      page: page,
      perPage: perPage,
    };
  }

  public actionClick(gridItem: PeGridItem): void {
    if (gridItem.type === PeGridItemType.Folder) {
      const { children, isProtected, position } = gridItem.data;
      this.selectedFolder = {
        _id: gridItem.id,
        children: children,
        isProtected: isProtected,
        name: gridItem.title ,
        position: position,
      };
      this.onSelectFolder$.next(this.selectedFolder);
    } else {
      this.openEditor$.next({ actionData: null, gridItem });
    }
  }

  private readonly loadItemsAfterAction = () => {
    const numberOfgridItems = this.gridItems.filter(gridItem => gridItem.type === PeGridItemType.Item).length;
    const perPage = this.perPageCount();
    const currentPage = Math.floor(numberOfgridItems/perPage);
    this.paginator.perPage = perPage;
    this.paginator.page = currentPage;
    numberOfgridItems <= perPage && this.scrolledToEnd$.next();
  }

  private perPageCount(): number {
    const items = Math.ceil(window.innerWidth / MIN_ITEM_WIDTH * window.innerHeight / MIN_ITEM_WIDTH);

    return Math.ceil(items + items / 4);
  }

  public scrolledToEnd(): void {
    this.scrolledToEnd$.next();
  }

  public viewChange(view: PeGridView): void {
    this.peCommonItemService.lastGridView = view;
  }

  public sortChange(sortingOrder: PeGridSortingInterface): void {
    this.sortingOrder = sortingOrder;
    this.paginator.page = 1;
    this.onSelectFolder$.next(this.selectedFolder);
  }

  protected changePasteMenuItemStatus(
    menus: PeGridMenu[],
    action: PeGridContextMenuActionsEnum.Copy | PeGridContextMenuActionsEnum.Paste,
  ): void {
    menus.forEach((menu) => {
      const { items } = menu;
      if (items.length) {
        const pasteItem = items.find(menuItem => menuItem.value === PeGridContextMenuActionsEnum.Paste);
        pasteItem.disabled = action === PeGridContextMenuActionsEnum.Paste;
      }
    });
  }

  protected deselectAllItems(): void {
    this.peGridService.selectedItems = [];
  }

  protected showSnackbar(notify: string): void {
    this.snackbarService.toggle(true, {
      content: notify,
      duration: 5000,
      iconColor: '#00B640',
      iconId: 'icon-commerceos-success',
      iconSize: 24,
    });
  }

  protected alertSnackbar(notify: string): void {
    this.snackbarService.toggle(true, {
      content: notify,
      duration: 5000,
      iconColor: '#E2BB0B',
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }
}
