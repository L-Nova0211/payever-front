import { Overlay } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Inject,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, EMPTY, merge } from 'rxjs';
import { catchError, delay, map, take, takeUntil, tap } from 'rxjs/operators';

import {
  AppThemeEnum,
  MessageBus,
  PE_ENV,
  PeDataGridPaginator,
  PeDestroyService,
} from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import {
  FolderItem,
  MoveIntoFolderEvent,
  PeMoveToFolderItem,
  RootFolderItem,
} from '@pe/folders';
import {
  getPaginationResult,
  PeFilterChange,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridMenu,
  PeGridMenuItem,
  PeGridService,
  PeGridSidenavService,
  PeGridTableDisplayedColumns,
  PeGridView,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { PePlatformHeaderService } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';

import {
  GridExpandAnimation,
  MobileSidebarAnimation,
  SidebarAnimation,
} from '../../misc/constants';
import { PositionsEnum } from '../../misc/enum';
import { EmployeeStatusEnum } from '../../misc/interfaces';
import { ApiService, BusinessEnvService } from '../../services';

import {
  DISPLAYED_COLUMNS,
  LSFolder,
  LSView,
  positionQueryParam,
  SIDENAV_MENU,
  TOOLBAR_CONFIG,
  VIEW_MENU,
} from './constants';
import { FolderEnum } from './enums';
import { GridSortingFieldsEnum } from './enums/grid-sorting-fields.enum';
import { ContextEnum, EmployeesIcons, OptionsMenu } from './enums/navbar-filter-keys.enum';
import { IGroupItemInterface } from './interfaces/employee-group.interface';
import { EmployeesGridItemInterface } from './interfaces/employees-grid-item.interface';
import {
  PebBusinessEmployeesStorageService,
  PebBusinessEmployeesService,
  PebEmployeeDialogOpenerService,
  PebEmployeeSidebarService,
} from './services';

const SIDENAV_NAME = 'app-settings-employees-sidenav';

@Component({
  selector: 'peb-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
  animations: [SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class EmployeesComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'pe-employess-component';

  defaultFolderIcon = `${this.env.custom.cdn}/icons-transactions/folder.svg`;

  rootFolderData: RootFolderItem = {
    _id: null,
    name: this.translationService.translate('pages.employees.sidebar.title'),
    image: this.defaultFolderIcon,
  };

  gridLayout = localStorage.getItem(LSView) ?? PeGridView.List;

  selectedFolder: FolderItem;
  gridItems: PeGridItem[];
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  paginator: PeDataGridPaginator = {
    page: 0,
    perPage: getPaginationResult(),
    total: 10,
  };

  mobileTitle$ = new BehaviorSubject<string>('');

  sidenavMenu = SIDENAV_MENU;
  toolbar = TOOLBAR_CONFIG;
  viewMenu: PeGridMenu = VIEW_MENU;
  displayedColumns: PeGridTableDisplayedColumns[] = DISPLAYED_COLUMNS;

  filters: PeFilterChange[] = [];
  optionsMenu$ = combineLatest([
    this.route.queryParams.pipe(
      map(params => params.position),
    ),
    this.gridService.selectedItems$,
  ]).pipe(
    map(([position, selectedItems]) => {
      const items = this.toolbar.optionsMenu.items.reduce((acc, item) => {
        switch (item.value) {
          case OptionsMenu.Resend:
            if (!selectedItems.find(item => item.data.status === EmployeeStatusEnum.active)) {
              acc.push(item);
            }
            break;
          case OptionsMenu.DeleteFromGroup:
            if (position) {
              acc.push(item);
            }
            break;
          default:
            acc.push(item);
        }

        return acc;
      }, []);

      return Object.assign({ ...this.toolbar.optionsMenu }, { items });
    }),
  );


  uploadingInProgress = false;
  albumId: string;
  currentThemeStyle: any;

  initialized = false;
  isLoading = true;

  theme = this.businessEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.businessEnvService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  contextActions = [];
  sidebarContextActions = [];
  contextMenuClickedItem: any;
  currentSidebarItemSelected = '';
  isPositionSelected = null;

  groupCategories: FolderItem[] = [];

  // grid items
  items: EmployeesGridItemInterface[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sidebarService: PebEmployeeSidebarService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private employeesService: PebBusinessEmployeesService,
    private businessEnvService: BusinessEnvService,
    private translationService: TranslateService,
    private messageBus: MessageBus,
    private gridService: PeGridService,
    private destroyed$: PeDestroyService,
    private snackbarService: SnackbarService,
    private confirmScreenService: ConfirmScreenService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private headerService: PePlatformHeaderService,
    private peGridSidenavService: PeGridSidenavService,
    protected viewContainerRef: ViewContainerRef,
    protected overlay: Overlay,
    protected employeeDialogService: PebEmployeeDialogOpenerService,
    protected employeesStorage: PebBusinessEmployeesStorageService,
    @Inject(PE_ENV) private env,
  ) {
    Object.values(EmployeesIcons).forEach((icon) => {
      this.matIconRegistry.addSvgIcon(
        icon,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`)
      );
    });
    this.route.queryParams.pipe(
      tap((params) => {
        const position = params[positionQueryParam];
        this.currentSidebarItemSelected = this.currentSidebarItemSelected !== position ? position : '';

        this.isPositionSelected =
          Object.values(PositionsEnum).find(value => value === this.currentSidebarItemSelected)
          || !this.currentSidebarItemSelected;

        this.employeesService.loadEmployees(position, this.isPositionSelected);
      }),
    ).subscribe();
  }

  ngOnInit() {
    this.employeeDialogService.theme = this.theme;
    this.addSidenavItem();
    merge(
      this.peGridSidenavService.toggleOpenStatus$.pipe(
        tap((active: boolean) => {
          this.headerService.toggleSidenavActive(SIDENAV_NAME, active);
        })
      ),
      this.apiService.getBusinessEmployeeGroupList(this.businessEnvService.businessUuid).pipe(
        tap((res) => {
          this.employeesStorage.groups = res;
          this.groupCategories = [
            this.sidebarService.getEmployeeGroupsTree(res?.data),
            this.sidebarService.getEmployeePositionsTree(),
          ];
          if (this.route.snapshot.queryParams[positionQueryParam]) {
            const folderIdStorage = localStorage.getItem(LSFolder);
            this.selectedFolder = this.findCategory(this.groupCategories, folderIdStorage);
          }

          this.cdr.markForCheck();
        }),
      ).pipe(
        //need wait until folder emit selectedRootFolder during initialization
        delay(1000),
        tap(() => {
          this.initialized = true;
        }),
      ),
      this.employeesService.getEmployeesObservable$().pipe(
        tap((items) => {
          this.paginator.total = items.length;
          this.items = [...items];
          this.cdr.markForCheck();
        }),
      ),
      this.messageBus.listen('settings.resend.employee.invitation').pipe(
        tap((id: string) => {
          this.employeesService.inviteEmployeeToGroups(id);
        }),
      ),
      this.messageBus.listen('settings.edit.employee').pipe(
        tap((id: string) => {
          this.employeesService.editEmployee(id);
        }),
      ),
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();


  }

  findCategory(categories, folderIdStorage) {
    let category = categories.find(item => item._id === folderIdStorage);

    if (!category) {
      let i = 0;
      while (!category && categories[i]?.children?.length > 0) {
        category = this.findCategory(categories[i].children, folderIdStorage);
        i += 1;
      }
    }

    return category;
  }

  openNewUserDialog() {
    this.employeesService.createEmployee(this.isPositionSelected
      ? null
      : this.employeesStorage.groups?.data.find(group => group.name === this.currentSidebarItemSelected)?._id,
    );
  }

  openEditUserDialog(id) {
    this.employeesService.editEmployee(id);
  }

  onEmployeesPositionSelect(node = null) {
    const nodeData = node;
    if (!nodeData) {
      this.router.navigate([]);

      return;
    }

    const queryParams = {};
    queryParams[positionQueryParam] = this.currentSidebarItemSelected !== nodeData?.data?.category
      ? nodeData?.data?.category
      : '';

    this.router.navigate([], { queryParams });
  }

  onEditItem = (gridItem) => {
    this.openEditUserDialog(gridItem.id);
  }

  openAddEmployeeGroup(id: string = null, group = null) {
    if (id) {
      const storageGroup = this.employeesStorage.groups.data.find(group => group._id === id);
      const editGroup = group ?? storageGroup;
      this.sidebarService.editEmployeeGroup(id, editGroup)
        .pipe(
          takeUntil(this.destroyed$),
        ).subscribe();
    } else {
      this.sidebarService.createEmployeeGroup().pipe(
        takeUntil(this.destroyed$),
        tap((createdGroup) => {
          if (createdGroup) {
            this.employeesStorage.groups.data.push(createdGroup);
            this.groupCategories = [
              this.sidebarService.getEmployeeGroupsTree(this.employeesStorage.groups?.data),
              this.sidebarService.getEmployeePositionsTree(),
            ];
            this.cdr.detectChanges();
          }
        }),
      ).subscribe();
    }
  }

  onDeleteEmployeeGroup = (e) => {
    this.removeGroup(e.data._id);
  }

  getMessage(name): string {
    return this.translationService.translate('pages.employees.sidebar.groups.duplicate_message_1')
    + name
    + this.translationService.translate('pages.employees.sidebar.groups.duplicate_message_2');
  }

  checkUniqueFolderName(event) {
    const exisitingGroup = this.employeesStorage.groups.data.find(
      group => group.name === event.data.name &&
      event.data._id !== group._id
    );
    if (exisitingGroup) {
      const message = this.getMessage(exisitingGroup.name);
      this.snackbarService.toggle(true, {
        content: message,
        duration: 2500,
        iconId: 'icon-alert-24',
        iconSize: 24,
      });

      return false;
    }

    return true;
  }

  onOpenEmployeeGroup(event) {
    this.openAddEmployeeGroup(event.data._id, event.data);
  }

  onCreateEmployeeGroup(event) {
    const nameCheck = event.data?.name && /\S+/.test(event.data?.name);
    if (this.checkUniqueFolderName(event) && nameCheck) {
      this.sidebarService.createEmployeeGroupFromTree(event.data).pipe(
        tap(result=> event.apply(result)),
        takeUntil(this.destroyed$),
        catchError((error) => {
          this.cdr.detectChanges();

          return EMPTY;
        }),
        ).subscribe()
      } else {
        event.apply();
      }
    }

  onEditEmployeeGroup(event) {
    if (this.checkUniqueFolderName(event)) {
      this.sidebarService.updateEmployeeGroupFromTree(event.data).pipe(
        tap(result=> event.apply(result)),
        takeUntil(this.destroyed$),
        catchError((error) => {
          this.cdr.detectChanges();

          return EMPTY;
        }),
      ).subscribe()
    }
    this.cdr.detectChanges();
  }

  showConfirmationDeleteDialog(action, ids) {
    const headings: Headings = {
      title: this.translationService.translate('dialogs.item_delete.title'),
      subtitle: this.translationService.translate('dialogs.item_delete.label'),
      declineBtnText: this.translationService.translate('dialogs.item_delete.decline'),
      confirmBtnText: this.translationService.translate('dialogs.item_delete.confirm'),
    }
    this.confirmScreenService.show(headings, true).pipe(
      tap((dismiss) => {
        if (dismiss === true) {
          action(ids);
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  removeEmployees = (ids) => {
    this.employeesService.deleteSelectedEmployees(ids);
    this.cdr.detectChanges();
  }

  onDeleteFromGroup = (id) => {
    this.showConfirmationDeleteDialog(this.removeEmployeesFromGroup, [id]);
  }

  removeEmployeesFromGroup = (employeesIds) => {
    const group = this.employeesStorage.groups?.data.find(res => res.name === this.currentSidebarItemSelected);
    this.apiService.deleteEmployeeFromGroup(
      this.businessEnvService.businessUuid,
      group._id,
      employeesIds
    ).pipe(
      take(1),
      tap((res) => {
        const employees = this.employeesStorage.groups.data.find(gr => gr._id === group._id).employees;
        const newEmployees = employees.filter(employee => !employeesIds.includes(employee));
        this.employeesStorage.groups.data.find(item => item._id === group._id).employees = newEmployees;
        this.employeesService.refreshExistEmployees();

        this.cdr.markForCheck();
      }),
    ).subscribe();
  }

  removeGroup = (id) => {
    this.apiService.deleteEmployeeGroup(this.businessEnvService.businessUuid, id).subscribe(
      (res) => {
        this.employeesStorage.groups.data.splice(
          this.employeesStorage.groups.data.indexOf(
            this.employeesStorage.groups.data.find(group => group.name === res.name)
          ),
          1
        );
        this.groupCategories = [
          this.sidebarService.getEmployeeGroupsTree(this.employeesStorage.groups.data),
          this.sidebarService.getEmployeePositionsTree(),
        ];
        this.cdr.detectChanges();
      });
  }

  selectSideNavMenu(menuItem: PeGridMenuItem) {
    switch (menuItem.value) {
      case FolderEnum.NewGroup:
        this.openAddEmployeeGroup();
        break;
    }
  }

  optionsChange(event: OptionsMenu) {
    switch (event) {
      case OptionsMenu.SelectAll:
        this.employeesService.selectAllEmployees();
        this.gridService.selectedItems = this.employeesService.getEmployees() as PeGridItem[];
        break;
      case OptionsMenu.Delete:
        this.deleteSelectedItems();
        this.gridService.selectedItems = [];
        break;
      case OptionsMenu.DeleteFromGroup:
        this.removeEmployeesFromGroup(this.gridService.selectedItems.map(item => item.id));
        break;
      case OptionsMenu.Resend:
        this.gridService.selectedItems.forEach((item) => {
          if (item.data.status !== EmployeeStatusEnum.active) {
            this.employeesService.inviteEmployeeToGroups(item.id);
          }
        });
        break;
      case OptionsMenu.DeselectAll:
      default:
        this.employeesService.deselectEmployee();
        this.gridService.selectedItems = [];
        break;
    }

    this.cdr.detectChanges();
  }

  onItemContentContextMenu({ gridItem, menuItem }: PeGridItemContextSelect) {
    switch (menuItem?.value) {
      case ContextEnum.Resend:
        this.messageBus.emit('settings.resend.employee.invitation', gridItem?.id);
        break;
      case ContextEnum.Delete:
        if (gridItem?.data?.isFolder) {
        } else {
          this.showConfirmationDeleteDialog(this.removeEmployees, [gridItem?.id]);
        }
        break;
      case ContextEnum.DeleteFrom:
        this.onDeleteFromGroup(gridItem?.id);
        break;
    }
  }

  itemsToMove(item: PeGridItem): PeMoveToFolderItem[] {
    return [...new Set([...this.gridService.selectedItems, item])];
  }

  moveToFolder(event: MoveIntoFolderEvent): void {
    const { folder, moveItems } = event;
    if (moveItems?.length) {
      this.isLoading = true;
      const ids = moveItems.map((item) => {
        return item.id;
      });
      this.apiService.createBusinessEmployeeInGroup(
        this.businessEnvService.businessUuid,
        folder._id,
        ids
      ).pipe(
        tap((result: IGroupItemInterface) => {
          this.employeesStorage.groups.data.find(group => group._id === result._id).employees = result.employees;
        }),
      ).subscribe();
    }
  }

  onSelectRootFolder(): void {
    if (this.initialized) {
      localStorage.removeItem(LSFolder);
      this.onEmployeesPositionSelect();
    }
    this.mobileTitle$.next(this.rootFolderData.name);
  }

  selectFolder(folder): void {
    localStorage.setItem(LSFolder, folder._id);
    this.mobileTitle$.next(folder.name);
    this.onEmployeesPositionSelect(folder);
  }

  deleteSelectedItems() {
    const selectedItems = this.gridService.selectedItems;
    this.showConfirmationDeleteDialog(this.removeEmployees, selectedItems.map(item => item.id));
  }

  sortChange(sort: GridSortingFieldsEnum): void {
    switch (sort) {
      case GridSortingFieldsEnum.Name:
        this.employeesService.sortEmployees(sort);
        break;
      case GridSortingFieldsEnum.Position:
        this.employeesService.sortEmployees(sort);
        break;
      case GridSortingFieldsEnum.Email:
        this.employeesService.sortEmployees(sort);
        break;
      case GridSortingFieldsEnum.Status:
        this.employeesService.sortEmployees(sort);
        break;
    }
  }

  filtersChange(filters: PeFilterChange[]) {
    this.filters = filters;
    const position = this.route.snapshot.queryParams[positionQueryParam];
    this.employeesService.loadEmployees(position, this.isPositionSelected);
    this.implementFilters(filters);
  }

  implementFilters(filters: PeFilterChange[]) {
    filters.forEach((filter) => {
      this.items = this.items.filter((item) => {
        const isFound = (new RegExp(filter.search as string)).test(item.title as string);

        return filter.contain === 'contains' ? isFound : !isFound;
      });
    });
  }

  viewChange(event: PeGridView): void {
    localStorage.setItem(LSView, event);
  }

  actionClick(event) {
    this.openEditUserDialog(event.id);
  }

  itemContextMenu(item: EmployeesGridItemInterface): PeGridMenu {
    const menu = {
      title: this.translationService.translate('form.create_form.employee.context_menu.title'),
      items: [
        {
          label: this.translationService.translate('dialogs.item_delete.confirm'),
          value: ContextEnum.Delete,
        },
      ],
    };

    if (item.data.status === EmployeeStatusEnum.invited || item.data.status === EmployeeStatusEnum.inactive) {
      menu.items.unshift({
        label: this.translationService.translate('pages.employees.datagrid.list.resend'),
        value: ContextEnum.Resend,
      });
    }

    if (!this.isPositionSelected) {
      menu.items.push({
        value: ContextEnum.DeleteFrom,
        label: this.translationService.translate('actions.delete_from_group'),
      });
    }

    return menu;
  }

  ngOnDestroy() {
    this.employeesStorage.isEmployeesLoaded = false;
    this.headerService.removeSidenav(SIDENAV_NAME);
  }

  toggleSidebar(): void {
    this.peGridSidenavService.toggleViewSidebar();
    this.cdr.detectChanges();
  }

  private addSidenavItem(): void {
    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translationService.translate('sidebar.sections.navigation.panels.employees'),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.toggleSidebar();
        },
      },
    });
  }
}
