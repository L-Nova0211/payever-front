import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, forkJoin, merge, of } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService, PePreloaderService } from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import {
  GridQueryParams,
  PeFilterChange,
  PeGridContextMenuActionsEnum,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridItemsActions,
  PeGridItemType,
  PeGridOptionsMenuActionsEnum,
  PeGridStoreActions,
  PeGridView,
} from '@pe/grid';
import { PeOverlayConfig } from '@pe/overlay-widget';

import {
  PeAppointmentsTypesApiService,
} from '../../services';
import { PeGridCommonClassDirective } from '../common-grid.class';
import { PeAppointmentsTypeEditorComponent } from '../type-editor';

import { ITEM_CONTEXT_MENU, TOOLBAR_CONFIG, VIEWPORT_CONTEXT_MENU } from './menu-constants';

@Component({
  selector: 'pe-appointments-types',
  templateUrl: './types.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    PePreloaderService,
  ],
})
export class PeAppointmentsTypesComponent extends PeGridCommonClassDirective implements OnInit, OnDestroy {
  protected readonly intro = this.translateService.translate('appointments-app.notify.appointment_type');

  public gridLayout = PeGridView.List;

  public readonly itemContextMenu = ITEM_CONTEXT_MENU;
  public readonly viewportContextMenu = VIEWPORT_CONTEXT_MENU;
  public readonly toolbar$ = new BehaviorSubject<any>(TOOLBAR_CONFIG);

  constructor(
    // Angular
    protected injector: Injector,
    // Appointments Services
    private peAppointmentsTypesApiService: PeAppointmentsTypesApiService,
  ) {
    super(injector);

    this.pePreloaderService.startLoading(this.appType);
    this.pePreloaderService.initFinishObservers([this.isLoading$], this.appType);
    this.viewportTitle = this.translateService.translate('appointments-app.folders.all_types');
    const view = this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.View)
      ?? this.peCommonItemService.lastGridView;
    this.peCommonItemService.lastGridView = <PeGridView>view;
    this.gridLayout = <PeGridView>view ?? PeGridView.List;
  }

  ngOnDestroy(): void {
    this.store.dispatch(new PeGridStoreActions.Clear());
    this.peGridQueryParamsService.destroy();
  }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params.appointmentTypeId) {
      const appointmentType = this.activatedRoute.snapshot.data.appointmentType;
      const gridItem = this.peCommonItemService
        .appointmentItemToGridItemMapper([appointmentType], this.canvas)[0];
      this.openEditor(gridItem);
    }

    const loadMore$ = this.loadMore$
      .pipe(tap(this.setGridItems));
    const onSelectFolder$ = this.onSelectFolder$
      .pipe(
        tap(() => {
          this.paginator.page = 1;
          this.paginator.total = 0;
          this.store.dispatch(new PeGridItemsActions.OpenFolder([]));
          this.deselectAllItems();
          this.setGridItems();
        }));
    const openEditor$ = this.openEditor$
      .pipe(
        tap(({ gridItem }) => {
          this.openEditor(gridItem);
        }))

    merge(
      loadMore$,
      onSelectFolder$,
      openEditor$,
      this.appointmentItemEditor$,
    ).pipe(takeUntil(this.destroy$)).subscribe();

    this.setGridItems();
  }

  private setGridItems = (): void => {
    this.isLoading$.next(true);
    this.peAppointmentsTypesApiService
      .getAppointmentTypes(this.getSearchData)
      .pipe(
        switchMap(({ collection, pagination_data }) => {
          const prevGridItems = this.paginator.page > 1 ? this.gridItems : [];
          const items = collection.length
            ? this.peCommonItemService.appointmentItemToGridItemMapper(collection, this.canvas)
            : [];
          const uniqItems = items.filter(item => !prevGridItems.some(gridItem => gridItem.id === item.id));
          const gridItems = [...prevGridItems, ...uniqItems];
          this.paginator.page = pagination_data.page;
          this.paginator.total = pagination_data.total;

          return gridItems.length
            ? this.store.dispatch(new PeGridItemsActions.OpenFolder(gridItems))
            : of(null);
        }),
        tap(() => {
          this.isLoading$.next(false);
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public filtersChange(filters: PeFilterChange[] = []): void {
    this.filterConfiguration = this.peGridService.filtersChange(filters);
    this.onSelectFolder$.next();
  }

  public createByHand(): void {
    this.openEditor$.next({ gridItem: null });
  }

  private openEditor(gridItem?: PeGridItem): void {
    const itemData = { id: gridItem?.id };
    const formTitle = gridItem
      ? this.translateService.translate('appointments-app.type_editor.title.edit_type')
      : this.translateService.translate('appointments-app.type_editor.title.create_type');
    const backdropClick = () => {
      this.peAppointmentsReferenceService.backdropClick();
    };

    const config: PeOverlayConfig = {
      hasBackdrop: true,
      backdropClass: 'settings-backdrop',
      backdropClick: backdropClick,
      data: itemData,
      headerConfig: {
        backBtnTitle: this.translateService.translate('appointments-app.actions.cancel'),
        doneBtnTitle: this.translateService.translate('appointments-app.actions.save'),
        onSaveSubject$: this.saveAppointmentItem$,
        removeContentPadding: true,
        theme: this.theme,
        title: formTitle,
      },
      component: PeAppointmentsTypeEditorComponent,
    }
    this.peAppointmentsReferenceService.appointmentEditor = this.peOverlayWidgetService.open(config);
  }

  public optionsChange(option: PeGridOptionsMenuActionsEnum): void {
    switch (option) {
      case PeGridOptionsMenuActionsEnum.SelectAll:
        this.peGridService.selectedItems = this.gridItems;
        break;
      case PeGridOptionsMenuActionsEnum.DeselectAll:
        this.deselectAllItems();
        break;
      case PeGridOptionsMenuActionsEnum.Delete:
        this.peGridService.selectedItemsIds.length && this.delete();
        break;
    }
  }

  public itemContextSelect(event: PeGridItemContextSelect): void {
    const { gridItem, menuItem } = event;
    const action = menuItem.value;
    switch (action) {
      case PeGridContextMenuActionsEnum.Edit:
        this.edit(gridItem);
        break;
      case PeGridContextMenuActionsEnum.Copy:
        this.copy(gridItem);
        break;
      case PeGridContextMenuActionsEnum.Paste:
        this.paste();
        break;
      case PeGridContextMenuActionsEnum.Duplicate:
        this.duplicate(gridItem);
        break;
      case PeGridContextMenuActionsEnum.Delete:
        this.peGridService.selectedItems = [gridItem];
        this.delete();
        break;
    }
  }

  private edit(gridItem: PeGridItem): void {
    this.openEditor$.next({ gridItem });
  }

  private copy(gridItem: PeGridItem): void {
    this.copiedItem = gridItem;
    this.changePasteMenuItemStatus([ITEM_CONTEXT_MENU, VIEWPORT_CONTEXT_MENU], PeGridContextMenuActionsEnum.Copy);
  }

  private paste(): void {
    const item: PeGridItem = this.copiedItem;
    this.peAppointmentsTypesApiService
      .getAppointmentType(item.id)
      .pipe(
        switchMap((appointmentType) => {
          delete appointmentType._id;
          delete appointmentType['__typename'];
          appointmentType.name += ' copy';

          return this.peAppointmentsTypesApiService.createAppointmentType(appointmentType);
        }),
        switchMap((appointmentType) => {
          const gridItem = this.peCommonItemService.appointmentItemToGridItemMapper(
            [appointmentType], this.canvas
          )[0];

          return this.store.dispatch(new PeGridItemsActions.AddItem(gridItem));
        }),
        tap(() => {
          this.changePasteMenuItemStatus(
            [ITEM_CONTEXT_MENU, VIEWPORT_CONTEXT_MENU], PeGridContextMenuActionsEnum.Paste
          );
          this.copiedItem = null;
        }))
      .subscribe();
  }

  private duplicate(gridItem: PeGridItem): void {
    this.copy(gridItem);
    this.paste();
  }

  private delete(): void {
    const items = this.peGridService.selectedItems
      .filter(gridItem => gridItem.type === PeGridItemType.Item);
    const itemsToDelete$ = items.length
      ? items.map(appointmentType => this.peAppointmentsTypesApiService
          .deleteAppointmentType(appointmentType.id)
          .pipe(
            tap(() => {
              this.store.dispatch(new PeGridItemsActions.DeleteItems([appointmentType.id]));
              this.paginator.total -= 1;
            })))
      : [of(null)];

    this.peAppointmentsReferenceService.confirmation$
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => {
          this.deselectAllItems();

          return forkJoin(itemsToDelete$);
        }),
        tap(() => {
          const intro = this.translateService.translate('appointments-app.notify.all_selected_appointments');
          const condition = this.translateService.translate('appointments-app.notify.successfuly_deleted');
          const notify = `${intro} ${condition}`;
          this.showSnackbar(notify);
        }),
        takeUntil(this.destroy$))
      .subscribe();

    const deleteAppointments = 'appointments-app.confirm_dialog.delete.';
    const title = items.length
      ? items.length > 1
        ? `${deleteAppointments}appointment_types.title`
        : `${deleteAppointments}appointment_type.title`
      : null;
    const subtitle = items.length
      ? items.length > 1
        ? `${deleteAppointments}appointment_types.subtitle`
        : `${deleteAppointments}appointment_type.subtitle`
      : null;

    const headings: Headings = {
      title: this.translateService.translate(title),
      subtitle: this.translateService.translate(subtitle),
      confirmBtnText: this.deleteBtn,
      declineBtnText: this.cancelBtn,
    };

    this.peAppointmentsReferenceService.openConfirmDialog(headings);
  }
}
