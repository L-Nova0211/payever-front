import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, EMPTY, merge, Observable, Subject } from 'rxjs';
import { catchError, debounceTime, delay, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  AppThemeEnum,
  EnvService, MessageBus,
  PE_ENV, PebDeviceService,
  PeDataGridSingleSelectedAction,
  PeDestroyService,
  TreeFilterNode,
  PePreloaderService,
  AppType,
  APP_TYPE,
} from '@pe/common';
import { PeDataGridSortByActionIcon } from '@pe/common';
import { PeUtilsService } from '@pe/common';
import { FolderItem } from '@pe/folders';
import {
  GridSkeletonColumnType,
  PeDataGridLayoutByActionIcon,
  PeFilterChange,
  PeFilterConditions,
  PeFilterType,
  PeGridItem, PeGridMenu, PeGridSidenavService,
  PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns, PeGridTableTextInfoCellComponent,
  PeGridTableTitleCellComponent,
  PeGridView,
  PeListImagesService,
  PeGridViewportService,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import {
  connectFolder,
  connectView,
  ConnectWelcomeComponent,
  DataGridService,
  IntegrationInfoWithStatusInterface,
  IntegrationsApiService,
  IntegrationsStateService,
  PaymentsStateService, PeContextMenu, PeFilters,
  PeModalType,
  SharedModule,
} from '../../../shared';
import { MainTreeFilters } from '../../../shared/enum/list-common';
import {
  ValuesInterface,
  ValuesInterfaceFilters,
} from '../../../shared/interfaces/connect-list.interface';
import { ConnectListService } from '../../../shared/services/connect-list.service';
import { InstallIntegrationComponent } from '../install-integration/install-integration.component';
import { IntegrationAllReviewsComponent } from '../integration-all-reviews/integration-all-reviews.component';
import { IntegrationFullPageComponent } from '../integration-full-page/integration-full-page.component';
import { IntegrationInstalledComponent } from '../integration-installed/integration-installed.component';
import {
  IntegrationVersionHistoryComponent,
} from '../integration-version-history/integration-version-history.component';
import { IntegrationWriteReviewComponent } from '../integration-write-review/integration-write-review.component';
import { modalComponents, modalModules } from '../modals/configure/constants';

@Component({
  selector: 'connect-list-common',
  templateUrl: './list-common.component.html',
  styleUrls: ['./list-common.component.scss'],
  providers: [ConnectListService, PeDestroyService, PeUtilsService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ListCommonComponent implements OnInit, OnDestroy {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  defaultFolderIcon = `${this.env.custom.cdn}/icons-transactions/folder.svg`;

  rootFolderData: any = {
    _id: null,
    name: this.translateService.translate(`connect-app.filters.tree.my_apps_c`),
    data: {
      category: MainTreeFilters.my_apps,
      myApp: true,
    },
    image: `/assets/icons/all-icon-filter.svg`,
  };

  gridLayout = localStorage.getItem(connectView) ?? PeGridView.BigList;

  selectedFolder: FolderItem;
  gridItems: PeGridItem[];
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  toolbar = {
    filterConfig: [
      {
        fieldName: PeFilters.Name,
        filterConditions: [PeFilterConditions.Contains, PeFilterConditions.DoesNotContain],
        label: this.translateService.translate('connect-app.filters.name'),
        type: PeFilterType.String,
      },
      {
        fieldName: PeFilters.Category,
        filterConditions: [PeFilterConditions.Contains],
        label: this.translateService.translate('connect-app.installation.labels.category'),
        type: PeFilterType.String,
      },
      {
        fieldName: PeFilters.Developer,
        filterConditions: [PeFilterConditions.Contains],
        label: this.translateService.translate('connect-app.installation.labels.developer'),
        type: PeFilterType.String,
      },
    ] as ValuesInterfaceFilters[],
    sortMenu: {
      title: this.translateService.translate('connect-app.sort_by.title'),
      activeValue: 'desc',
      items: [
        {
          label: this.translateService.translate('connect-app.sort_by.sort_name_a_z'),
          value: 'asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: this.translateService.translate('connect-app.sort_by.sort_name_z_a'),
          value: 'desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
        {
          label: this.translateService.translate('connect-app.sort_by.sort_created_newest'),
          value: 'desc,createdAt',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: this.translateService.translate('connect-app.sort_by.sort_created_oldest'),
          value: 'asc,createdAt',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
      ],
    },
  };

  displayedColumns: PeGridTableDisplayedColumns[] = [
    {
      name: 'name',
      title: this.translateService.translate('connect-app.columns.name'),
      cellComponent: PeGridTableTitleCellComponent,
    },
    {
      name: 'category',
      title: this.translateService.translate('connect-app.installation.labels.category'),
      cellComponent: PeGridTableTextInfoCellComponent,
    },
    {
      name: 'developer',
      title: this.translateService.translate('connect-app.installation.labels.developer'),
      cellComponent: PeGridTableTextInfoCellComponent,
    },
    {
      name: 'languages',
      title: this.translateService.translate('connect-app.installation.labels.languages'),
      cellComponent: PeGridTableTextInfoCellComponent,
    },
    {
      name: 'action',
      title: '',
      cellComponent: PeGridTableActionCellComponent,
      skeletonColumnType: GridSkeletonColumnType.Rectangle,
    },
  ];

  viewMenu: PeGridMenu = {
    title: this.translateService.translate('grid.content.toolbar.layout'),
    items: [
      {
        label: this.translateService.translate('grid.content.toolbar.list'),
        value: PeGridView.Table,
        defaultIcon: PeDataGridLayoutByActionIcon.ListLayout,
      },
      {
        label: this.translateService.translate('grid.content.toolbar.grid'),
        value: PeGridView.BigList,
        defaultIcon: PeDataGridLayoutByActionIcon.GridLayout,
        minItemWidth: 290,
        maxColumns: 5,
      },
    ],
  };

  private itemContextMenu = {
    items: [
      {
        label: this.translateService.translate('connect-app.actions.uninstall'),
        value: PeContextMenu.Uninstall,
      },
    ],
  };

  initialized = false;

  dialogRef: PeOverlayRef;
  onActionSubject$ = new Subject<number>();
  onDataLoadSubject$ = new Subject<number>();
  gridItems$ = this.dataGridService.gridItems$.asObservable();

  mainTreeFilters = MainTreeFilters;
  categoriesTreeData: TreeFilterNode[] = [];
  categoriesNameAndId: {_id: string, name: string}[] = [];

  activeTreeFilter$: BehaviorSubject<MainTreeFilters> = new BehaviorSubject(null);
  mobileTitle$ = new BehaviorSubject<string>('');

  showOnlyInstalledIntegrations = false;
  allowUninstallAction = false;
  isLoadingFolders$ = new BehaviorSubject<boolean>(false);

  @HostListener('window:resize', ['$event'])
  onResize = this.utilsService.debounce(() => {
    this.initSubscriptionsLimit();
    this.onSearchUpdate();
  }, 500);

  constructor(
    public connectListService: ConnectListService,
    private overlayService: PeOverlayWidgetService,
    private envService: EnvService,
    private dataGridService: DataGridService,
    private translateService: TranslateService,
    private integrationsStateService: IntegrationsStateService,
    private paymentsStateService: PaymentsStateService,
    private route: ActivatedRoute,
    private router: Router,
    private apmService: ApmService,
    private integrationsApiService: IntegrationsApiService,
    private gridSidenavService: PeGridSidenavService,
    private messageBus: MessageBus,
    private utilsService: PeUtilsService,
    private deviceService: PebDeviceService,
    private destroyed$: PeDestroyService,
    private cdr: ChangeDetectorRef,
    @Inject(PE_ENV) private env,
    @Inject(APP_TYPE) private appType: AppType,
    @Optional() private platformHeader: PePlatformHeaderService,
    private pePreloaderService: PePreloaderService,
    private peListImagesService: PeListImagesService,
    private peGridViewportService: PeGridViewportService,
  ) {
    this.pePreloaderService.startLoading(this.appType);
    this.pePreloaderService.initFinishObservers([
      this.connectListService.isLoading$,
      this.peListImagesService.allImagesLoad$,
      this.isLoadingFolders$,
    ], this.appType);
  }

  ngOnInit(): void {
    this.platformHeader.setFullHeader();
    this.platformHeader.assignConfig({
      ...this.platformHeader.config,
      mainItem: {
        title: this.translateService.translate('connect-app.list_common.title'),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.gridSidenavService.toggleViewSidebar();
        },
      },
    } as PePlatformHeaderConfig);

    merge(
      this.pePreloaderService.changeState$.pipe(
        tap(() => {
          this.cdr.markForCheck();
        })
      ),
      this.peGridViewportService.deviceTypeChange$.pipe(
        tap(({ isMobile }) => {
          this.platformHeader.assignConfig({
            isShowDataGridToggleComponent: !isMobile,
            isShowMainItem: isMobile,
            isShowSubheader: isMobile,
          } as PePlatformHeaderConfig);

          if (isMobile || this.deviceService.isMobile) {
            this.gridSidenavService.toggleOpenStatus$.next(false);
          }
        })
      ),
      this.gridSidenavService.toggleOpenStatus$.pipe(
        tap((open: boolean) => {
          this.platformHeader.assignConfig({
            isShowMainItem: this.peGridViewportService.isMobile && !open,
          } as PePlatformHeaderConfig);
        }),
      ),
      this.integrationsApiService.getValues().pipe(
        tap((values: ValuesInterface) => {
          this.toolbar.filterConfig = values.filters;
        })
      ),
      this.messageBus.listen('connect.toggle.sidebar').pipe(
        tap(() => {
          this.gridSidenavService.toggleViewSidebar();
        }),
      ),
      this.routeQueryParams(),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private routeQueryParams() {
    return this.route.queryParams.pipe(
      switchMap((queryParams) => {
        if (this.categoriesTreeData.length === 0) {
          return this.initTreeFilters().pipe(
            switchMap(() => {
              if (queryParams?.modalType
                || (queryParams?.integration || queryParams?.integrationCategory)
              ) {
                return this.gridItems$.pipe(
                  filter(d => !!d?.length),
                  take(1),
                  switchMap(() => this.initQueryParams()),
                );
              }

              return EMPTY;
            }),
          );
        }
        if (
          queryParams?.modalType && this.categoriesTreeData.length > 0
          || (
            queryParams?.integration
            && queryParams?.integrationCategory
            && this.categoriesTreeData.length > 0
          )
        ) {
          return this.gridItems$.pipe(
            filter(d => !!d?.length),
            take(1),
            switchMap(() => this.initQueryParams()),
          );
        }

        return EMPTY;
      }),
    );
  }

  private initTreeFilters(): Observable<any> {
    this.isLoadingFolders$.next(true);

    return this.integrationsStateService.getMyAppsFolders().pipe(
      filter(a => !!a),
      take(1),
      tap((folders: FolderItem[]) => {
        this.categoriesNameAndId.push({
          _id: `${MainTreeFilters.categories}`,
          name: this.translateService.translate(`connect-app.categories.all.title_full`),
        });
        this.categoriesTreeData = folders.map((folderRaw) => {
          const folder = cloneDeep(folderRaw);
          this.categoriesNameAndId.push({
            _id: folder._id,
            name: folder.name.replace(/integrations\.categories\./, ''),
          });

          folder.name = this.translateService.translate(`connect-app.${folder.name}`);
          folder.isHideMenu = true;
          folder.image = `/assets/icons/${folder.image}`;

          return folder;
        });

        const selectedFolder = localStorage.getItem(connectFolder);
        this.selectedFolder = selectedFolder === MainTreeFilters.categories
          ? this.categoriesTreeData[0] as FolderItem
          : folders.find(folder => folder._id === selectedFolder);

        if (this.route.snapshot.queryParams?.integrationName) {
          const id = this.categoriesNameAndId
            .find(item => item.name === this.route.snapshot.queryParams?.integrationName)?._id;
          localStorage.setItem(connectFolder, id);
          this.selectedFolder = this.findCategory(this.categoriesTreeData, id);
        }

        this.selectedFolder
          ? this.mobileTitle$.next(this.selectedFolder.name)
          : this.onSelectRootFolder();

        this.initSubscriptionsLimit();
        this.onSearchUpdate();
        this.isLoadingFolders$.next(false);
      }),
      delay(1000),
      tap(() => {
        this.initialized = true;
      }),
    );
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

  handleOpen(integration: IntegrationInfoWithStatusInterface, isLoading: BehaviorSubject<boolean>): void {
    const data = {
      integrationName: integration.name,
      integrationCategory: integration.category,
      integrationParentFolderId: integration.parentFolderId,
      isLoading,
    };
    const title = this.translateService.translate(integration?.displayOptions?.title);
    const customConfig = {
      headerConfig: {
        title: title || integration?.displayOptions?.title,
        hideHeader: false,
      },
    };
    if (integration.status
      && integration.status.installed
      && modalComponents[integration.category]
      && modalComponents[integration.category][integration.name]) {
      this.initModal(
        modalComponents[integration.category][integration.name],
        modalModules[integration.category],
        data,
        customConfig,
        isLoading);
    } else if (modalComponents[integration.category] && !modalComponents[integration.category][integration.name]) {
      this.initModal(
        modalComponents[integration.category].default,
        modalModules[integration.category],
        data,
        customConfig,
        isLoading);
    } else if (!modalComponents[integration.category]) {
      this.initModal(
        modalComponents.default,
        modalModules.default,
        data,
        customConfig,
        isLoading);
    }
  }

  private initQueryParams() {
    const modalType = this.route.snapshot.queryParams.modalType;
    const integrationName = this.route.snapshot.queryParams.integration;
    const integrationCategory = this.route.snapshot.queryParams.integrationCategory;
    if (integrationCategory && !modalType) {
      const id = this.categoriesNameAndId
        .find(item => item.name === integrationCategory)?._id;
      const folder = this.findCategory(this.categoriesTreeData, id);
      this.selectFolder(folder);
    }

    return this.integrationsStateService.getIntegration(integrationName).pipe(
      filter(d => !!d),
      take(1),
      tap((integration) => {

        const title = integration?.displayOptions?.title
          ? this.translateService.translate(integration.displayOptions.title)
          : integrationName;

        let module;
        let modalComponent;
        const customConfig = {
          headerConfig: {
            title: title,
            hideHeader: false,
          },
          backdropClick: null,
          backdropClass: null,
        };

        const gridIntegration = this.dataGridService.gridItems$?.value.find(int =>
          int.cardItem.name === integration.name);
        if (gridIntegration && this.selectedFolder) {
          // To update actions for item in list when uninstalled from TPM
          gridIntegration.cardItem.status.installed = integration.status.installed;
          gridIntegration.cardItem.installed = integration.status.installed;
          gridIntegration.action = this.getItemActions(gridIntegration.cardItem);
          gridIntegration.badge = {
            label: integration.status.installed
              ? this.translateService.translate('connect-app.installation.installed.title') : null,
            backgroundColor: '#65646d',
            color: '#d4d3d9',
          }
        } else if (!this.selectedFolder && gridIntegration?.cardItem.installed && modalType === PeModalType.Done) {
          this.dataGridService.gridItems$.next(this.dataGridService.gridItems$.value.filter(int =>
            int.cardItem.name !== integration.name));
        }

        switch (modalType) {
          case PeModalType.Welcome:
            modalComponent = ConnectWelcomeComponent;
            customConfig.headerConfig.hideHeader = true;
            customConfig.backdropClick = () => null;
            module = SharedModule;
            break;
          case PeModalType.Install:
            modalComponent = InstallIntegrationComponent;
            module = SharedModule;
            break;
          case PeModalType.Done:
            modalComponent = IntegrationInstalledComponent;
            customConfig.headerConfig.hideHeader = true;
            customConfig.backdropClass = 'connect-short-modal';
            module = SharedModule;
            this.displayedColumns = [...this.displayedColumns];
            break;
          case PeModalType.Fullpage:
            modalComponent = IntegrationFullPageComponent;
            module = SharedModule;
            break;
          case PeModalType.Reviews:
            modalComponent = IntegrationAllReviewsComponent;
            module = SharedModule;
            break;
          case PeModalType.WriteReview:
            modalComponent = IntegrationWriteReviewComponent;
            module = SharedModule;
            break;
          case PeModalType.VersionHistory:
            modalComponent = IntegrationVersionHistoryComponent;
            module = SharedModule;
            break;
          default:
            if (!modalComponents[integrationCategory]) {
              modalComponent = modalComponents.default;
            } else {
              modalComponent = modalComponents[integrationCategory][integrationName]
                ? modalComponents[integrationCategory][integrationName]
                : modalComponents[integrationCategory].default;
            }
            module = modalModules[integrationCategory] || modalModules.default;
            break;
        }

        this.dialogRef?.close();

        this.initModal(
          modalComponent,
          module,
          {
            integrationName,
            integrationCategory,
            integrationParentFolderId: gridIntegration?.cardItem?.parentFolderId,
            isLoading: gridIntegration?.isLoading$,
          },
          customConfig,
          gridIntegration?.isLoading$);
      }),
    );
  }

  private initModal(
    component,
    module,
    data = {},
    customConfig: PeOverlayConfig = {},
    isLoading: BehaviorSubject<boolean> = null
  ) {
    const title = customConfig.headerConfig.title ?? '';
    this.onActionSubject$ = new Subject<number>();
    const config: PeOverlayConfig = {
      data: {
        theme: this.theme,
        onAction: this.onActionSubject$,
        onDataLoad: this.onDataLoadSubject$,
        ...data,
      },
      hasBackdrop: true,
      backdropClass: customConfig.backdropClass || 'connect-modal',
      backdropClick: customConfig.backdropClick ? customConfig.backdropClick : null,
      headerConfig: {
        title,
        backBtnTitle: this.translateService.translate('connect-app.actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate('connect-app.actions.done'),
        doneBtnCallback: () => {
          this.overlayService.close();
        },
        theme: this.theme,
        hideHeader: customConfig.headerConfig.hideHeader,
        removeContentPadding: true,
      },
      component: component,
      lazyLoadedModule: module,
    };

    this.dialogRef = this.overlayService.open(config);

    merge(
      this.dialogRef.afterClosed.pipe(
        tap(() => {
          if (isLoading && isLoading.value) {
            isLoading.next(false);
          }
          this.router.navigate([], { queryParams: {} });
        }),
      ),
      this.onActionSubject$.pipe(
        tap(() => {
          this.dialogRef.close();
        }),
      ),
      this.onDataLoadSubject$.pipe(
        filter(d => !!d),
        debounceTime(300),
        tap(() => {
          this.showModal();
        }),
      ),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();

    this.hideModal();
  }

  private backdropChangeBackground(element: HTMLElement, backgroundColor: string):void {
    if (element) {
      element.style.backgroundColor = backgroundColor;
    }
  }

  private hideModal() {
    this.dialogRef.addPanelClass('hidden');
    this.backdropChangeBackground(this.dialogRef.getBackdropElement(), 'transparent');
  }

  private showModal() {
    this.dialogRef.removePanelClass('hidden');
    this.backdropChangeBackground(this.dialogRef.getBackdropElement(), 'rgba(0, 0, 0, 0.5)');
  }

  onItemContentContextMenu({ gridItem, menuItem }) {
    switch (menuItem?.value) {
      case PeContextMenu.Uninstall:
        gridItem.isLoading$?.next(true);
        this.paymentsStateService.installIntegrationAndGoToDone(false, gridItem.cardItem).pipe(
          take(1),
          tap((data) => {
            gridItem.isLoading$?.next(false);
            this.router.navigate(
              [`${gridItem.cardItem.category}/integrations/${gridItem.cardItem.name}/done`],
              { relativeTo: this.route }
              );
          })
        ).subscribe();
        break;
    }
  }

  onSelectRootFolder(): void {
    if (this.initialized) {
      this.mobileTitle$.next(this.rootFolderData.name);
      localStorage.removeItem(connectFolder);
      this.selectedFolder = null;
      this.initSubscriptionsLimit();
      this.onSearchUpdate();
    }
  }

  selectFolder(folder): void {
    localStorage.setItem(connectFolder, folder?._id);
    this.selectedFolder = folder;
    this.initSubscriptionsLimit();
    this.mobileTitle$.next(folder.name);
    this.onSearchUpdate();
  }

  filtersChange(filters: PeFilterChange[]) {
    this.connectListService.searchItems = filters;
    this.initSubscriptionsLimit();
    this.onSearchUpdate();
  }

  sortChange(param: string): void {
    const [order, field] = param.split(',');
    this.connectListService.sort = { order, field: field ?? 'name' };
    this.onSearchUpdate();
  }

  viewChange(event: PeGridView): void {
    localStorage.setItem(connectView, event);
    this.initSubscriptionsLimit();
    this.onSearchUpdate();
  }

  actionClick(event) {
    if (event.cardItem.status.installed) {
      this.onOpenCallback(event.id, event.isLoading$);
    } else {
      this.onInstallCallback(event.id, event.isLoading$);
    }
  }

  itemClick(item: PeGridItem) {
    if ((item as any).cardItem?.status?.installed) {
      this.onOpenCallback(item.id, item.isLoading$);
    }
  }

  scrollBottom() {
    this.connectListService.paginator.page += 1;
    if (this.dataGridService.gridItems$.value?.length < this.connectListService.paginator.total) {
      this.onSearchUpdate();
    }
  }

  initSubscriptionsLimit() {
    this.dataGridService.gridItems$.next([]);
    this.connectListService.paginator.page = 1;
    this.connectListService.setSubscriptionsLimit();
  }

  selectMainTreeFilter(mainTreeFilter: MainTreeFilters): void {

    this.initSubscriptionsLimit();

    if (this.activeTreeFilter$.value === mainTreeFilter) {
      return;
    }
    this.activeTreeFilter$.next(mainTreeFilter);

    this.showOnlyInstalledIntegrations = mainTreeFilter === MainTreeFilters.my_apps;
  }

  protected onOpenCallback(selectedId: string, isLoading: BehaviorSubject<boolean>) {
    isLoading.next(true);
    const integration = this.dataGridService.gridItems$?.value.find(int => int.id === selectedId)?.cardItem;
    if (integration) {
      this.handleOpen(integration, isLoading);
    }
  }

  getItemActions(item: IntegrationInfoWithStatusInterface): PeDataGridSingleSelectedAction {
    return {
      label: this.translateService.translate(item.status.installed
        ? 'connect-app.actions.edit'
        : 'connect-app.actions.install'),
      more: item.status.installed,
    };
  }

  protected onInstallCallback(selectedId: string, isLoading: BehaviorSubject<boolean>) {
    isLoading.next(true);
    const integration = this.dataGridService.gridItems$?.value.find(int => int.id === selectedId);
    if (integration) {
      this.integrationAction(integration, isLoading, true, 'Can\'t install');
    }
  }

  protected onUninstallCallback(selectedId: string, isLoading: BehaviorSubject<boolean>) {
    isLoading.next(true);
    const integration = this.dataGridService.gridItems$?.value.find(int => int.id === selectedId);
    if (integration) {
      this.integrationAction(integration, isLoading, false, 'Can\'t uninstall');
    }
  }

  integrationAction(integration, isLoading, install, messageErr) {
    this.paymentsStateService.installIntegrationAndGoToDone(install, integration.cardItem).pipe(
      take(1),
      tap((data) => {
        this.router.navigate(
          [`${integration.cardItem.category}/integrations/${integration.cardItem.name}/done`],
          { relativeTo: this.route }
          ).then(() => {
          integration.cardItem.status.installed = data.installed;
          integration.action = this.getItemActions(integration.cardItem);
          isLoading.next(false);
        });
      }),
      catchError((error) => {
        isLoading.next(false);
        this.paymentsStateService.handleError(error, true);
        this.apmService.apm.captureError(
          `${messageErr} ERROR ms:\n ${JSON.stringify(error)}`
        );

        return EMPTY;
      }),
    ).subscribe();
  }

  onSearchUpdate() {
    const folder = this.selectedFolder;
    if (this.selectedFolder) {
      const id = folder._id !== MainTreeFilters.categories ? folder._id : null;
      this.connectListService.loadCategoryList(id);
    } else {
      this.connectListService.loadMyAppsList();
    }
  }

  ngOnDestroy() {
    this.dataGridService.gridItems$.next([]);
  }
}
