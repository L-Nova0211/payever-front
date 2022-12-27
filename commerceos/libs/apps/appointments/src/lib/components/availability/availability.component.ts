import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, forkJoin, merge, of } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import {
  PeDestroyService,
  PePreloaderService,
} from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import {
  PeFolderEditorActionDataInterface,
} from '@pe/folders';
import {
  GridQueryParams,
  PeFilterChange,
  PeGridContextMenuActionsEnum,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridItemsActions,
  PeGridItemType,
  PeGridOptionsMenuActionsEnum,
  PeGridSortingDirectionEnum,
  PeGridSortingInterface, PeGridSortingOrderByEnum,
  PeGridStoreActions,
  PeGridView,
} from '@pe/grid';
import { PeOverlayConfig } from '@pe/overlay-widget';

import {
  PeAppointmentsAvailabilityApiService,
} from '../../services';
import { PeAppointmentsAvailabilityEditorComponent } from '../availability-editor';
import { PeGridCommonClassDirective } from '../common-grid.class';
import {
  TOOLBAR_AVAILABILITY_CONFIG,
} from '../menu-constants';
import { AVAILABILITY_ITEM_CONTEXT_MENU } from '../types/menu-constants';

@Component({
  selector: 'pe-appointments-calendar',
  templateUrl: './availability.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    PePreloaderService,
  ],
})
export class PeAppointmentsAvailabilityComponent extends PeGridCommonClassDirective
  implements OnInit, OnDestroy {

  public readonly itemContextMenu = AVAILABILITY_ITEM_CONTEXT_MENU;
  public readonly viewportContextMenu = { items: null };
  public readonly toolbar$ = new BehaviorSubject<any>(TOOLBAR_AVAILABILITY_CONFIG);

  protected readonly intro = this.translateService.translate('appointments-app.notify.appointment_availability');

  protected sortingOrder: PeGridSortingInterface = {
    direction: PeGridSortingDirectionEnum.Descending,
    orderBy: PeGridSortingOrderByEnum.CreationDate,
  };

  constructor(
    protected injector: Injector,
    private pebEnvService: PebEnvService,
    private peAppointmentsAvailabilityApiService: PeAppointmentsAvailabilityApiService,
  ) {
    super(injector);

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
    const loadMore$ = this.loadMore$
      .pipe(tap(this.setGridItems));
    const openEditor$ = this.openEditor$
      .pipe(
        tap(({ gridItem }) => {
          this.openEditor(gridItem);
        }))

    merge(
      loadMore$,
      openEditor$,
      this.appointmentItemEditor$,
    ).pipe(takeUntil(this.destroy$)).subscribe();

    this.setGridItems();
  }

  private setGridItems = (): void => {
    this.isLoading$.next(true);
    this.peAppointmentsAvailabilityApiService
      .getAppointmentAvailabilities(this.getSearchData)
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

  public createByHand(): void {
    this.openEditor$.next({ gridItem: null });
  }

  protected openEditor(gridItem?: PeGridItem, actionData?: PeFolderEditorActionDataInterface): void {
    const itemData = { id: gridItem?.id, numberOfSchedule: this.gridItems.length + 1 };
    const formTitle = gridItem
      ? this.translateService.translate('appointments-app.availability_editor.title.edit_availability')
      : this.translateService.translate('appointments-app.availability_editor.title.create_availability');

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
      component: PeAppointmentsAvailabilityEditorComponent,
    }
    this.peAppointmentsReferenceService.appointmentEditor = this.peOverlayWidgetService.open(config);
  }

  public itemContextSelect(event: PeGridItemContextSelect): void {
    const { gridItem, menuItem } = event;
    const action = menuItem.value;
    switch (action) {
      case PeGridContextMenuActionsEnum.Edit:
        this.edit(gridItem);
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

  public filtersChange(filters: PeFilterChange[]): void {
    this.filterConfiguration = this.peGridService.filtersChange(filters);
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
        (this.peGridService.selectedItemsIds.length || this.peGridService.selectedFoldersIds.length) && this.delete();
        break;
    }
  }

  protected edit(gridItem: PeGridItem): void {
    this.openEditor$.next({ gridItem });
  }

  protected copy(gridItem: PeGridItem): void {
    this.copiedItem = gridItem;
  }

  protected paste(): void {
    const item: PeGridItem = this.copiedItem;
    this.pasteItem(item);
    this.paginator.total += 1;
    this.copiedItem = null;
  }

  protected pasteItem(item) {
    this.peAppointmentsAvailabilityApiService
      .getAppointmentAvailability(item.id)
      .pipe(
        switchMap((availability) => {
          delete availability._id;
          delete availability['__typename'];
          availability.isDefault = false;
          availability.weekDayAvailability.forEach((dayItem) => {
            delete dayItem['__typename'];
            dayItem.ranges.forEach(range => delete range['__typename'])
          })

          return this.peAppointmentsAvailabilityApiService.createAppointmentAvailability(availability);
        }),
        switchMap((availability) => {
          const gridItem = this.peCommonItemService
            .appointmentItemToGridItemMapper([availability], this.canvas)[0];

          return this.store.dispatch(new PeGridItemsActions.AddItem(gridItem));
        }),
        tap(() => {
          this.copiedItem = null;
        }))
      .subscribe();
  }

  protected duplicate(gridItem: PeGridItem): void {
    this.copy(gridItem);
    this.paste();
  }

  protected delete(): void {
    const items = this.peGridService.selectedItems
      .filter(gridItem => gridItem.type === PeGridItemType.Item);

    const itemDefault = items.find(item => item.data.isDefault);
    if (itemDefault) {
      this.alertSnackbar(
        this.translateService.translate('appointments-app.notify.default_selected_availabilities_delete')
      );

      return;
    }

    const itemsToDelete$ = items.length
      ? items.map(appointmentAvailability => this.peAppointmentsAvailabilityApiService
        .deleteAppointmentAvailability(appointmentAvailability.id)
        .pipe(
          tap(() => {
            this.store.dispatch(new PeGridItemsActions.DeleteItems([appointmentAvailability.id]));
            this.paginator.total -= 1;
          })))
      : [of(null)];

    this.peAppointmentsReferenceService.confirmation$
      .pipe(
        filter(Boolean),
        take(1),
        switchMap(() => {
          this.deselectAllItems();

          return forkJoin(itemsToDelete$);
        }),
        tap(() => {
          const intro = items.length > 1
            ? this.translateService.translate('appointments-app.notify.all_selected_availabilities')
            : this.translateService.translate('appointments-app.notify.selected_availability') + ` ${items[0].title}`;
          const condition = this.translateService.translate('appointments-app.notify.successfuly_deleted');
          const notify = `${intro} ${condition}`;
          this.showSnackbar(notify);
        }),
      ).subscribe();

    const deleteAppointments = 'appointments-app.confirm_dialog.delete.';
    const itemsTitle = items.length
      ? items.length > 1
        ? `${deleteAppointments}appointments.title`
        : `${deleteAppointments}appointment.title`
      : null;
    const title = itemsTitle ?? `${deleteAppointments}items.title`;
    const itemsSubtitle = items.length
      ? items.length > 1
        ? `${deleteAppointments}appointments.subtitle`
        : `${deleteAppointments}appointment.subtitle`
      : null;
    const subtitle = itemsSubtitle
      ?? `${deleteAppointments}items.subtitle`;

    const headings: Headings = {
      title: this.translateService.translate(title),
      subtitle: this.translateService.translate(subtitle),
      confirmBtnText: this.deleteBtn,
      declineBtnText: this.cancelBtn,
    };

    this.peAppointmentsReferenceService.openConfirmDialog(headings);
  }
}
