import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import omit from 'lodash/omit';
import { BehaviorSubject, forkJoin, merge, of } from 'rxjs';
import {
  filter,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import {
  createApplicationUrl,
  PeBuilderEditorRoutingPathsEnum,
  PeDestroyService,
  PePreloaderService,
} from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import {
  FolderItem,
  FolderOutputEvent,
  PeFolderEditorActionDataInterface,
  PeFolderEditorComponent,
  PeFoldersActionsEnum,
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
  PeGridStoreActions,
  PeGridView,
} from '@pe/grid';
import { PeOverlayConfig } from '@pe/overlay-widget';

import { BAD_REQUEST, REQUIRED_MESSAGE } from '../../constants';
import {
  PeAppointmentsCalendarApiService,
} from '../../services';
import { PeAppointmentsAppointmentEditorComponent } from '../appointment-editor';
import { PeGridWithFoldersCommonClass } from '../common-folders.class';
import {
  FOLDERS_SIDENAV_MENU,
  ITEM_CONTEXT_MENU,
  TOOLBAR_CONFIG,
  VIEWPORT_CONTEXT_MENU,
} from '../menu-constants';

const SIDENAV_NAME = 'app-appointments-calendar-sidenav';

@Component({
  selector: 'pe-appointments-calendar',
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    PePreloaderService,
  ],
})
export class PeAppointmentsCalendarComponent extends PeGridWithFoldersCommonClass implements OnInit, OnDestroy {
  protected readonly intro = this.translateService.translate('appointments-app.notify.appointment');

  public readonly foldersSidenavMenu = FOLDERS_SIDENAV_MENU;
  public readonly itemContextMenu = ITEM_CONTEXT_MENU;
  public readonly viewportContextMenu = VIEWPORT_CONTEXT_MENU;
  public readonly toolbar$ = new BehaviorSubject<any>(TOOLBAR_CONFIG);

  private readonly toggleSidenavStatus$ = this.peGridSidenavService.toggleOpenStatus$
    .pipe(
      tap((active: boolean) => {
        this.pePlatformHeaderService.toggleSidenavActive(SIDENAV_NAME, active);
      }));

  constructor(
    // Angular
    protected injector: Injector,
    // Pe Services
    private pebEnvService: PebEnvService,
    // Appointments Services
    private peAppointmentsCalendarApiService: PeAppointmentsCalendarApiService,
  ) {
    super(injector);

    this.rootFolder.name = this.translateService.translate('appointments-app.folders.all_appointments');
    this.pePreloaderService.startLoading(this.appType);
    this.pePreloaderService.initFinishObservers([
      this.isLoading$,
      this.isFoldersLoading$,
    ], this.appType);

    const view = this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.View)
      ?? this.peCommonItemService.lastGridView;
    this.peCommonItemService.lastGridView = <PeGridView>view;
    this.gridLayout = <PeGridView>view ?? PeGridView.List;
  }

  ngOnDestroy(): void {
    this.peFoldersApiService.applicationId$.next(null);
    this.store.dispatch(new PeGridStoreActions.Clear());
    this.peGridQueryParamsService.destroy();
    this.pePlatformHeaderService.removeSidenav(SIDENAV_NAME);
  }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params.appointmentId) {
      const appointment = this.activatedRoute.snapshot.data.appointment;
      const gridItem = this.peCommonItemService
        .appointmentItemToGridItemMapper([appointment], this.canvas)[0];
      this.openEditor$.next({ actionData: null, gridItem });
    }

    this.pePlatformHeaderService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('appointments-app.navigation.calendar'),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.peGridSidenavService.toggleViewSidebar();
        },
      },
    });

    const loadMore$ = this.loadMore$
      .pipe(
        tap(() => {
          this.setGridItems(this.selectedFolder);
        }));
    const openEditor$ = this.openEditor$
      .pipe(
        tap(({ actionData, gridItem }) => {
          this.openEditor(gridItem, actionData);
        }))
    const selectFolderListener$ = this.selectFolderListener$
      .pipe(tap(this.setGridItems));

    merge(
      loadMore$,
      openEditor$,
      selectFolderListener$,
      this.appointmentItemEditor$,
      this.toggleSidenavStatus$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  public filtersChange(filters: PeFilterChange[]): void {
    this.filterConfiguration = this.peGridService.filtersChange(filters);
    this.onSelectFolder$.next(this.selectedFolder);
  }

  private readonly setGridItems = (folder: FolderItem): void => {
    this.isLoading$.next(true);
    const folderId = folder._id;
    const isRootFolder = folderId === this.rootFolder._id;
    this.peFoldersApiService
      .getFolderItems(folderId, this.getSearchData, this.rootFolder._id)
      .pipe(
        tap((folderItems) => {
          const folderChildren = isRootFolder ? this.rootTree : folder.children;
          const { collection, pagination_data } = folderItems;
          const prevGridItems = pagination_data.page > 1
            ? this.gridItems
            : this.peGridService.foldersToGridItemMapper(folderChildren);
          const items = collection.length
            ? this.peCommonItemService.appointmentItemToGridItemMapper(collection, this.canvas)
            : [];
          const uniqItems = items.filter(item => !prevGridItems.some(gridItem => gridItem.id === item.id));
          const gridItems = [...prevGridItems, ...uniqItems];
          this.paginator.page = pagination_data.page;
          this.paginator.total = pagination_data.total + folderChildren.length;

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
    if (this.pebEnvService.applicationId !== BAD_REQUEST) {
      this.openEditor$.next({ actionData: null, gridItem: null });
    } else {
      this.snackbarService.toggle(true, {
        content: this.translateService.translate(REQUIRED_MESSAGE),
        duration: 15000,
        hideButtonTitle: this.translateService.translate('appointments-app.navigation.settings'),
        hideCallback: () => {
          const fullPath = createApplicationUrl(
            this.router,
            this.pebEnvService.applicationId,
            PeBuilderEditorRoutingPathsEnum.Settings,
          );
          this.router.navigate([fullPath]);
        },
        iconColor: '#E2BB0B',
      });
    }
  }

  private openEditor(gridItem?: PeGridItem, actionData?: PeFolderEditorActionDataInterface): void {
    const isFolder = !!actionData;
    const itemData = isFolder
      ? {
          ...actionData,
          item: gridItem,
          nextPosition: this.peFolderService.nextPosition,
        }
      : {
          applicationScopeElasticId: gridItem?.id,
          appointmentNetwork: this.pebEnvService.applicationId,
          id: gridItem?.serviceEntityId,
          targetFolderId: this.selectedFolder._id,
        };
    const formTitle = isFolder
      ? gridItem?.title ?? this.translateService.translate('folders.folder_editor.create_folder')
      : gridItem
        ? this.translateService.translate('appointments-app.appointment_editor.title.edit_appointment')
        : this.translateService.translate('appointments-app.appointment_editor.title.create_appointment');
    const component = isFolder
      ? PeFolderEditorComponent
      : PeAppointmentsAppointmentEditorComponent;
    const saveSubject$ = isFolder
      ? this.saveFolder$
      : this.saveAppointmentItem$;
    const backdropClick = () => {
      if (isFolder) {
        this.peFolderService.backdropClick();
      } else {
        this.peAppointmentsReferenceService.backdropClick();
      }
    };

    const config: PeOverlayConfig = {
      hasBackdrop: true,
      backdropClass: 'settings-backdrop',
      backdropClick: backdropClick,
      data: itemData,
      headerConfig: {
        backBtnTitle: this.translateService.translate('appointments-app.actions.cancel'),
        doneBtnTitle: this.translateService.translate('appointments-app.actions.save'),
        onSaveSubject$: saveSubject$,
        removeContentPadding: !isFolder,
        theme: this.theme,
        title: formTitle,
      },
      component: component,
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
        (this.peGridService.selectedItemsIds.length || this.peGridService.selectedFoldersIds.length) && this.delete();
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
      case PeGridContextMenuActionsEnum.AddFolder:
        this.createFolder();
        break;
    }
  }

  private edit(gridItem: PeGridItem): void {
    const isFolder = gridItem.type === PeGridItemType.Folder;
    const actionData: PeFolderEditorActionDataInterface = isFolder
      ? {
          actionType: PeFoldersActionsEnum.Update,
          activeItem: this.selectedFolder,
        }
      : null;
    this.openEditor$.next({ actionData, gridItem });
  }

  private copy(gridItem: PeGridItem): void {
    this.copiedItem = gridItem;
    this.changePasteMenuItemStatus([ITEM_CONTEXT_MENU, VIEWPORT_CONTEXT_MENU], PeGridContextMenuActionsEnum.Copy);
  }

  private paste(): void {
    const item: PeGridItem = this.copiedItem;
    switch (item.type) {
      case PeGridItemType.Folder:
        this.peFolderService.duplicateFolder$.next(item.id);
        break;
      case PeGridItemType.Item:
        this.peAppointmentsCalendarApiService
          .getAppointment(item.serviceEntityId)
          .pipe(
            switchMap((appointment) => {
              const appointmentToDuplicate: any = omit(
                appointment,
                [
                  '__v',
                  '_id',
                  'business',
                  'businessId',
                  'createdAt',
                  'id',
                  'isDefault',
                  'updatedAt',
                  '__typename',
                ],
              );

              appointmentToDuplicate.fields = appointmentToDuplicate.fields.map((field) => {
                delete field['__typename'];

                return field;
              })

              return forkJoin([
                of(appointmentToDuplicate),
              ]);
            }),
            switchMap(([appointmentToDuplicate]) => {
              return this.peAppointmentsCalendarApiService.createAppointment(appointmentToDuplicate);
            }),
            tap((appointment: any) => {
              const gridItem = this.peCommonItemService
                .appointmentItemToGridItemMapper([appointment], this.canvas)[0];
              this.paginator.total += 1;
              this.store.dispatch(new PeGridItemsActions.AddItem(gridItem));
              const condition = this.translateService.translate('appointments-app.notify.successfuly_duplicated');
              const notify = `${this.intro} "${appointment.date}" ${condition}`;
              this.showSnackbar(notify);
            }),
            takeUntil(this.destroy$))
          .subscribe();
        break;
    }
    this.changePasteMenuItemStatus([ITEM_CONTEXT_MENU, VIEWPORT_CONTEXT_MENU], PeGridContextMenuActionsEnum.Paste);
    this.copiedItem = null;
  }

  private duplicate(gridItem: PeGridItem): void {
    this.copy(gridItem);
    this.paste();
  }

  private delete(): void {
    const items = this.peGridService.selectedItems
      .filter(gridItem => gridItem.type === PeGridItemType.Item);
    const foldersIds = this.peGridService.selectedFoldersIds;
    const itemsToDelete$ = items.length
      ? items.map(appointment => this.peAppointmentsCalendarApiService
          .deleteAppointment(appointment.serviceEntityId)
          .pipe(
            tap(() => {
              this.store.dispatch(new PeGridItemsActions.DeleteItems([appointment.id]));
              this.paginator.total -= 1;
            })))
      : [of(null)];
    const foldersToDelete$ = foldersIds.length
      ? foldersIds.map((folderId) => {
          const { name, position } = this.peFolderService.getFolderFromTreeById(this.rootTree, folderId);
          const folder: FolderItem = { _id: folderId, name, position };
          const event: FolderOutputEvent = { data: folder };

          return this.peFoldersActionsService
            .folderAction(event, PeFoldersActionsEnum.Delete);
        })
      : [of(null)];

    this.peAppointmentsReferenceService.confirmation$
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => {
          this.deselectAllItems();

          return forkJoin([
            ...itemsToDelete$,
            ...foldersToDelete$,
          ]);
        }),
        tap(() => {
          const intro = this.translateService.translate(
            items.length && foldersIds.length
              ? 'appointments-app.notify.all_selected_items'
              : items.length
                ? 'appointments-app.notify.all_selected_appointments'
                : 'appointments-app.notify.all_selected_folders',
          );
          const condition = this.translateService.translate('appointments-app.notify.successfuly_deleted');
          const notify = `${intro} ${condition}`;
          this.showSnackbar(notify);
        }),
        takeUntil(this.destroy$))
      .subscribe();

    const deleteFolders = 'folders.confirm_dialog.delete.';
    const deleteAppointments = 'appointments-app.confirm_dialog.delete.';
    const itemsTitle = items.length
      ? items.length > 1
        ? `${deleteAppointments}appointments.title`
        : `${deleteAppointments}appointment.title`
      : null;
    const foldersTitle = foldersIds.length
      ? foldersIds.length > 1
        ? `${deleteFolders}folders.title`
        : `${deleteFolders}folder.title`
      : null;
    const title = itemsTitle && foldersTitle
      ? `${deleteAppointments}items.title`
      : !!itemsTitle
        ? itemsTitle
        : foldersTitle;
    const itemsSubtitle = items.length
      ? items.length > 1
        ? `${deleteAppointments}appointments.subtitle`
        : `${deleteAppointments}appointment.subtitle`
      : null;
    const foldersSubtitle = foldersIds.length
      ? foldersIds.length > 1
        ? `${deleteFolders}folders.subtitle`
        : `${deleteFolders}folder.subtitle`
      : null;
    const subtitle = itemsSubtitle && foldersSubtitle
      ? `${deleteAppointments}items.subtitle`
      : !!itemsSubtitle
        ? itemsSubtitle
        : foldersSubtitle;

    const headings: Headings = {
      title: this.translateService.translate(title),
      subtitle: this.translateService.translate(subtitle),
      confirmBtnText: this.deleteBtn,
      declineBtnText: this.cancelBtn,
    };

    this.peAppointmentsReferenceService.openConfirmDialog(headings);
  }
}
