import { Overlay } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  HostListener,
  OnDestroy,
  OnInit, ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  AppThemeEnum,
  EnvService,
  MessageBus,
  PeDataGridPaginator,
  PeDataGridSortByActionIcon,
  PeDestroyService,
} from '@pe/common';
import { SnackBarService } from '@pe/forms-core';
import {
  GridQueryParams, GridSkeletonColumnType, PeDataGridLayoutByActionIcon,
  PeDataToolbarOptionIcon,
  PeFilterConditions,
  PeFilterType,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridMenu,
  PeGridQueryParamsService,
  PeGridService,
  PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns,
  PeGridTableTitleCellComponent,
  PeGridView,
  PeGridViewportContextSelect,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { ProductsService } from '@pe/shared/products';

import { ContextMenu, OptionsMenu } from '../../enums/grid-enums';
import { ShippingSettingInterface } from '../../interfaces';
import { BaseComponent } from '../../misc/base.component';
import { CountriesPipe } from '../../pipes/countries.pipe';
import { PebShippingBusinessService } from '../../services/business-shipping.service';
import { PebShippingSettingsService } from '../../services/shipping-settings.service';
import { filterDataGrid, sortItems } from '../../shared';
import { AddItems, ClearStore, OpenFolder } from '../../store/shipping.action';
import { ShippingAppState } from '../../store/shipping.state';
import { PebShippingConnectService } from '../connect/connect.service';

import { ConfirmDialogService } from './browse-products/dialogs/dialog-data.service';
import { ProductsDialogService } from './browse-products/products/products-dialog.service';
import { ProductsApiService } from './browse-products/services/api.service';
import { ProductsListService } from './browse-products/services/products-list.service';
import { PebShippingProfileFormComponent } from './profiles-dialog/profiles-dialog.component';

@Component({
  selector: 'peb-shipping-profiles',
  templateUrl: './shipping-profiles.component.html',
  styleUrls: ['./shipping-profiles.component.scss'],
  providers: [ProductsListService, ProductsApiService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PebShippingProfilesComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  isMobile = window.innerWidth <= 720;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  @Select(ShippingAppState.profileGridItems) gridItems$: Observable<PeGridItem[]>;

  dialogRef: PeOverlayRef;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  order = 'desc';
  connections = [];
  settings = {};
  products = [];
  zones = [];
  currency;
  contextActions = [];
  isAllSelectable = false;
  paginator: PeDataGridPaginator = {
    page: 0,
    perPage: 40,
    total: 10,
  };

  totalItems$ = new BehaviorSubject<number>(0);

  copiedItem = null;

  viewportContextMenu: PeGridMenu = {
    title: this.translateService.translate('shipping-app.grid.options'),
    items: [{
      label: this.translateService.translate('shipping-app.grid.paste'),
      value: ContextMenu.Paste,
      disabled: true,
    }],
  }

  itemContextMenu: PeGridMenu = {
    title: this.translateService.translate('shipping-app.grid.options'),
    items: [
      {
        label: this.translateService.translate('shipping-app.grid.copy'),
        value: ContextMenu.Copy,
      },
      {
        label: this.translateService.translate('shipping-app.grid.paste'),
        value: ContextMenu.Paste,
        disabled: true,
      },
      {
        label: this.translateService.translate('shipping-app.grid.delete'),
        value: ContextMenu.Delete,
      }],
  }

  viewportContextMenu$ = new BehaviorSubject<PeGridMenu>(this.viewportContextMenu);
  itemContextMenu$ = new BehaviorSubject<PeGridMenu>(this.itemContextMenu);

  viewportTitle = this.translateService.translate('shipping-app.main_nav.profiles');
  gridLayout$ = new BehaviorSubject<string>(PeGridView.BigListCover);

  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();
  displayedColumns: PeGridTableDisplayedColumns[] = [
    {
      name: 'name',
      title: this.translateService.translate('shipping-app.grid_fields.name'),
      cellComponent: PeGridTableTitleCellComponent,
      skeletonColumnType: GridSkeletonColumnType.ThumbnailWithName,
    },
    {
      name: 'condition',
      title: this.translateService.translate('shipping-app.grid_fields.condition'),
    },
    {
      name: 'action',
      title: '',
      cellComponent: PeGridTableActionCellComponent,
      skeletonColumnType: GridSkeletonColumnType.Rectangle,
    },
  ];

  toolbar = {
    filterConfig: [{
      fieldName: 'title',
      filterConditions: [
        PeFilterConditions.Contains,
        PeFilterConditions.DoesNotContain,
      ],
      label: this.translateService.translate('shipping-app.grid_fields.name'),
      type: PeFilterType.String,
    }],
    optionsMenu: {
      title: this.translateService.translate('shipping-app.grid.options'),
      items: [
        {
          label: this.translateService.translate('shipping-app.grid.select_all'),
          value: OptionsMenu.SelectAll,
          defaultIcon: PeDataToolbarOptionIcon.SelectAll,
        },
        {
          label: this.translateService.translate('shipping-app.grid.deselect_all'),
          value: OptionsMenu.DeselectAll,
          defaultIcon: PeDataToolbarOptionIcon.DeselectAll,
        },
        {
          label: this.translateService.translate('shipping-app.grid.delete'),
          value: OptionsMenu.Delete,
          defaultIcon: PeDataToolbarOptionIcon.Delete,
        },
      ],
    },
    sortMenu: {
      title: this.translateService.translate('shipping-app.sort_actions.title'),
      items: [
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.a_z'),
          value: 'asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
          active: true,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.z_a'),
          value: 'desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.newest'),
          value: 'desc,createdAt',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.oldest'),
          value: 'asc,createdAt',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
      ],
    },
  };

  viewMenu: PeGridMenu = {
    title: this.translateService.translate('grid.content.toolbar.layout'),
    items: [
      {
        label: this.translateService.translate('grid.content.toolbar.list'),
        value: PeGridView.Table, defaultIcon: PeDataGridLayoutByActionIcon.ListLayout,
      },
      {
        label: this.translateService.translate('grid.content.toolbar.grid'),
        value: PeGridView.BigListCover, defaultIcon: PeDataGridLayoutByActionIcon.GridLayout,
        minItemWidth: 290,
        maxColumns: 5,
      },
    ],
  };

  items: PeGridItem[] = [];
  originItems = [];
  filteredItems = [];

  constructor(
    private overlayService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private shippingConnectService: PebShippingConnectService,
    private shippingSettingsService: PebShippingSettingsService,
    private shippingBusinessService: PebShippingBusinessService,
    private envService: EnvService,
    protected translateService: TranslateService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private productsListService: ProductsListService,
    private countriesPipe: CountriesPipe,
    private router: Router,
    private route: ActivatedRoute,
    private destroyed$: PeDestroyService,
    private productsService: ProductsService,
    public confirmDialog: ConfirmDialogService,
    protected overlay: Overlay,
    private gridService: PeGridService,
    private gridQueryParamsService: PeGridQueryParamsService,
    protected viewContainerRef: ViewContainerRef,
    private store: Store,
    private messageBus: MessageBus,
    private apmService: ApmService,
    private snackBarService: SnackBarService,
    private productDialogService: ProductsDialogService,

  ) {
    super(translateService);
    this.gridItems$.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      this.items = data;

      if (this.isAllSelectable) {
        this.gridService.selectedItems = this.items;
      }

      const scrollTop = this.gridQueryParamsService.getQueryParamByName(GridQueryParams.ScrollTop);
      if (scrollTop) {
        this.gridService.restoreScroll$.next(true);
      }
    });

    this.matIconRegistry.addSvgIcon(
      `edit-icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/edit-icon.svg')
    );
  }

  setPaginator(data: any): void {
    this.paginator = {
      ...this.paginator,
      page: data.page - 1,
      total: data.total,
    }

    this.totalItems$.next(data.total);
    this.gridQueryParamsService.pageToParams(data.page);
  }

  onSelectRootFolder(): void {
    this.store.dispatch(new AddItems([]));
  }

  onBranchCreate(name, category) {
    category.title = name;
  }

  ngOnInit() {
    if(this.route.snapshot.params.profileId) {
      const profile: PeGridItem<ShippingSettingInterface> = this.route.snapshot.data.profile;
      this.openProfileDialog(profile);
    }
    this.isLoading$.next(true);
    const currentLayout = localStorage.getItem('shipping.profile.grid.layout');
    if (currentLayout) {
      this.gridLayout$.next(currentLayout);
    }

    this.setProfiles();
    this.filteredItems = [];
    this.connections = this.getConnections();
    this.shippingSettingsService.profiles.pipe(
      tap((res) => {
        this.setProfiles();
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
  }

  onSearchChanged(searchItems) {
    this.setProfiles(searchItems);
  }

  getConnections() {
    const connections = [];
    this.shippingConnectService
      .getShippingMethods()
      .pipe(
        map((data: any) => {
          data.integrationSubscriptions.forEach((element) => {
            if (element.enabled) {
              connections.push(element.integration);
            }
          });
        }),
        catchError((err) => {
          this.snackBarService.show(
            `Cant load connect from server, reason: ${err?.message}`
          );

          return of(null);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();

    return connections;
  }

  getSettings(settings) {
    this.shippingBusinessService.getShippingSettings().pipe(
      tap((response: ShippingSettingInterface) => {
        this.currency = response.currency;
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    if (settings?.origins?.length) {
      settings.origins[0].phone = settings.origins[0]?.phone?.split(' ')[1] ?? settings?.origins[0]?.phone;
      this.settings = {
        zones: settings.zones,
        origins: settings.origins[0],
      };
    }
  }

  setProfiles(searchConfig = null) {
    const pageParam = this.gridQueryParamsService.getQueryParamByName(GridQueryParams.Page);
    if (pageParam && pageParam > 1) {
      for (let i = 1; i < pageParam; i++) {
        this.paginator.page = i;
      }
    }
    this.shippingSettingsService.getSettings(this.envService.businessId)
      .pipe(
        tap((response: any) => {
          if (response?.length) {
            this.getSettings(response[0]);
            this.originItems = response;
            if(this.order) {
              this.originItems = sortItems(this.order, this.originItems);
            }
            this.items = this.originItems.map(item =>
              this.shippingSettingsService.profileToItemMapper(item, this.canvas)
            );

            if (searchConfig?.length) {
              this.items = filterDataGrid(searchConfig, this.items);
            }
          } else {
            this.gridService.items$.next([]);
          }
          this.isLoading$.next(false);
          this.totalItems$.next(this.items.length);
          this.store.dispatch(new OpenFolder(this.items));
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroyed$)
      ).subscribe();
  }

  showConfirmationWindow(dialogContent) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
      tap(() => {
        this.dialogRef.close();
      }),
    ).subscribe();
  }

  showDeleteConfirmation(dialogContent, ids = null) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
      switchMap(() => {
        if (ids) {
          return forkJoin(ids.map((id) => {
            if (!this.originItems.find(res => res.id === id).isDefault) {
              return this.shippingSettingsService
                .deleteProfile(id, this.envService.businessId)
                .pipe(
                  tap((_) => {
                    this.setProfiles();
                    this.cdr.detectChanges();
                  }),
                  catchError((err) => {
                    this.apmService.apm.captureError(
                      `Cant delete shipping profile ERROR ms:\n ${JSON.stringify(err)}`
                    );

                    return of(true);
                  }),
                );
            } else {
              this.snackBarService.show( this.translateService.translate('shipping-app.snackbar.default_delete'));
            }
          }))
        }
        this.cdr.detectChanges();
      })
    ).subscribe();
  }

  onDuplicateItem = (ids) => {
    const duplicateItem = ids.map(id => this.originItems.find(item => item.id === id));
    if (duplicateItem.length) {
      const requests = duplicateItem.map((item) => {
        const profiles = {
          isDefault: false,
          name: item.name,
          business: item.businessId,
          products: item.products?.map(val => val._id),
          zones: item.zones.map(val => val._id),
          origins: item.origins.map(val => val._id),
        };

        return this.shippingSettingsService
          .addProfile(profiles, this.envService.businessId);
      });

      forkJoin(requests).pipe(
        tap((_) => {
          this.setProfiles();
          this.cdr.detectChanges();
        }),
        catchError((err) => {
          this.apmService.apm.captureError(
            `Cant duplicate shipping item ERROR ms:\n ${JSON.stringify(err)}`
          );

          return of(true);
        }),
        takeUntil(this.destroyed$)
      ).subscribe();
    }
  }

  getZonesCountries(item) {
    const zones = item?.data?.zones;
    if (zones.length > 0) {
      let shippingCountry = '';
      let countryCount = 0;

      zones.forEach((zone) => {
        if (zones.length === 1) {
          if (zone.countryCodes.length === 1) {
            shippingCountry = this.countriesPipe.transform(zone.countryCodes);
          } else {
            countryCount = zone.countryCodes.length;
          }
        } else {
          countryCount += zone.countryCodes.length;
        }
      });

      return countryCount > 0 ? `${countryCount} countries` : shippingCountry;
    }

    return '';
  }

  copy(item: PeGridItem): void {
    this.copiedItem = item;
    this.itemContextMenu$.next(this.enableMenuItem(this.itemContextMenu, ContextMenu.Paste, true));
    this.viewportContextMenu$.next(this.enableMenuItem(this.viewportContextMenu, ContextMenu.Paste, true));
  }

  private enableMenuItem(menuItems: PeGridMenu, menuItemValue: ContextMenu, enable: boolean): PeGridMenu {
    const menu: PeGridMenu = {
      ...menuItems,
      items: menuItems.items.map((item) => {
        if (item.value === menuItemValue) {
          return {
            ...item,
            disabled: !enable,
          }
        }

        return item;
      }),
    };

    return menu;
  }

  onContentDelete({ themeIds }): void {
    this.showDeleteConfirmation(themeIds);
  }

  onDeleteItem = (ids) => {
    if (ids) {
      this.showDeleteConfirmation(this.getDeleteConfirmationContent(), ids);
    }
  }

  optionsChange(event: string): void {
    this.isAllSelectable = false;

    switch (event) {
      case OptionsMenu.SelectAll:
        this.gridService.selectedItems = this.items;
        this.isAllSelectable = true;
        this.cdr.detectChanges();
        break;
      case OptionsMenu.Duplicate:
        this.duplicateItems();
        this.unselectAllItems();
        break;
      case OptionsMenu.DeselectAll:
        this.unselectAllItems();
        break;
      case OptionsMenu.Delete:
        this.onDeleteItem(this.gridService.selectedItemsIds);
        this.unselectAllItems();
        break;
    }
  }

  unselectAllItems() {
    this.gridService.selectedItems = [];
    this.cdr.detectChanges();
  }

  duplicateItems(): void {
    const itemIds = this.gridService.selectedItemsIds;
    if (itemIds.length) {
      this.onDuplicateItem(itemIds);
    }
  }

  sortChange(sort: string): void {
    this.order = sort;
    this.paginator.page = 0;
    this.setProfiles();
  }

  createByHand(): void {
    this.shippingSettingsService.profilesHelpData = {
      connections: this.connections,
      currency: this.currency,
      settings: this.settings,
      productsService: this.productsService,
      mode: 'adding',
    };

    this.router.navigate([`profile/adding`], { relativeTo: this.route });
  }

  viewChange(layout): void {
    localStorage.setItem('shipping.profile.grid.layout', layout);
    this.cdr.detectChanges();
  }

  onViewportContextMenu({ menuItem }: PeGridViewportContextSelect): void {
    switch (menuItem?.value) {
      case ContextMenu.Paste:
        this.paste(this.copiedItem);
        break;
    }
  }

  paste(item?: PeGridItem): void {
    if (this.copiedItem) {
      if (item) {
        this.onDuplicateItem([this.copiedItem.id]);
      }
    }
  }

  scrollBottom() {
    this.paginator.page += 1;
    this.loadMore();
  }

  loadMore(): void {
    if (Math.ceil(this.paginator.total / this.paginator.perPage) < this.paginator.page) {
      return;
    }
    // TODO: implement pagination for shipping
    // let request = this.shippingSettingsService.getSettings(this.envService.businessId);
    //
    // request.pipe(
    //   tap(),
    //   takeUntil(this.destroyed$)).subscribe({
    //   next: (profiles) => {
    //   },
    // })
  }

  actionClick(event) {
    const item = this.originItems.find(x => x.id === event.id);
    this.shippingSettingsService.profilesHelpData = {
      data: item,
      isLastDefault: this.originItems.filter(item => item.isDefault).length === 1,
      connections: this.connections,
      currency: this.currency,
      settings: this.settings,
      productsService: this.productsService,
      mode: 'editing',
    };

    this.router.navigate(['profile/editing'], { relativeTo: this.route });
  }

  onItemContentContextMenu({ gridItem, menuItem }: PeGridItemContextSelect): void {
    switch (menuItem?.value) {
      case ContextMenu.Edit:
        this.actionClick(gridItem);
        break;
      case ContextMenu.Copy:
        this.copy(gridItem);
        break;
      case ContextMenu.Paste:
        this.paste(gridItem);
        break;
      case ContextMenu.Duplicate:
        this.onDuplicateItem([gridItem.id]);
        break;
      case ContextMenu.Delete:
        this.onDeleteItem([gridItem.id]);
        break;
    }
  }

  openSidebarFunc = () => {
    this.messageBus.emit('shipping.app.toggle.sidebar', false);
  }

  openProfileDialog(data, mode?:any) {
    const config: PeOverlayConfig = {
      data: {
        data: data,
        connections: data.connections,
        settings: data.settings,
        currency: data.currency,
        items: data.products,
        zones: data.zones,

      },
      headerConfig: {
        title: data.name,
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationDialog(this.getConfirmationContent('profiles', 'editing'));
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      backdropClick: () => {
        this.showConfirmationDialog(this.getConfirmationContent('profiles', 'editing'));
      },
      component: PebShippingProfileFormComponent,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        filter(data => !!data),
        tap((data) => {
          if (data) {
            this.shippingSettingsService.saveProfile({ data, isEdit: mode === 'editing' });
          }
          this.productDialogService.selectedProducts = [];
          this.messageBus.emit('products.clear.selectedItems', true);
        }),
      ).subscribe();
  }

  showConfirmationDialog(dialogContent) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
    ).subscribe(() => {
      this.router.navigate([`business/${this.envService.businessId}/shipping/profiles`]);
      this.shippingSettingsService.profilesHelpData = [];
      this.dialogRef.close();
    });
  }

  ngOnDestroy() {
    this.store.dispatch(new ClearStore());
    this.unselectAllItems();
  }
}
