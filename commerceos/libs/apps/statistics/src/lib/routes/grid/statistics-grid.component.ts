import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import floor  from 'lodash/floor';
import moment from 'moment';
import { BehaviorSubject, EMPTY, fromEvent, ReplaySubject, Subscription, throwError } from 'rxjs';
import { catchError, delay, map, skip, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  AppThemeEnum,
  EnvironmentConfigInterface,
  EnvService,
  MenuSidebarFooterData,
  MessageBus,
  PeDataGridFilterItems, PeFilterContainsEnum, PE_ENV, TreeFilterNode,
} from '@pe/common';
import { PeDataGridComponent, PeDataGridSidebarService } from '@pe/data-grid';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { PeContextMenuService, PeDateTimePickerExtendedService, PeMenuService } from '@pe/ui';

import { ActualPeStatisticsApi, PeWidgetService, ucfirst } from '../../infrastructure';
import { PeHeaderMenuService } from '../../misc/components/header-menu/header-menu.service';
import { sizeOptions } from '../../overlay/form/statistics-form.component';
import { PeStatisticsOverlayComponent } from '../../overlay/statistics-overlay.component';
import {
  ConfirmDialogContentsInterface,
  ConfirmDialogService,
} from '../../shared/confirm-dialog/confirm-dialog.service';



/**
 * Used to give unique dashboard index when new dashboard is created
 */
let newDashboardIndex = 0;

/**
 * Main dashboard view
 */
@Component({
  selector: 'pe-statistics-grid',
  templateUrl: './statistics-grid.component.html',
  styleUrls: ['./statistics-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeStatisticsGridComponent implements OnInit, AfterViewInit, OnDestroy {
  /** On destroy subject */
  readonly destroyed$ = new ReplaySubject<boolean>();
  /**
   * Gets theme from COSF and is used to set theme in statistics datagrid.
   */
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  /**
   * Used to store array of widget filters
   */
  widgetFilters = [];

  /** Wether the display is mobile */
  isMobile = window.innerWidth < 620;

  /** Wether the grid is in fullscreen mode */
  isFullScreenMode = false;
  private doesHaveDashboards = false;

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private envService: EnvService,
    private overlayWidgetService: PeOverlayWidgetService,
    private dataGridSidebarService: PeDataGridSidebarService,
    private fb: FormBuilder,
    private apiService: ActualPeStatisticsApi,
    public headerService: PePlatformHeaderService,
    public widgetService: PeWidgetService,
    private dateTimePickerExtended: PeDateTimePickerExtendedService,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private confirmService: ConfirmDialogService,
    private contextMenu: PeContextMenuService,
    private snackBar: MatSnackBar,
    private menu: PeMenuService,
    private messageBus: MessageBus,
    private headerMenu: PeHeaderMenuService,
  ) {
    /** Sets business id */
    this.localBusinessId = this.envService.businessId;
  }

  /**
   * Data grid viewchild
   * Used for setting sidebar open or closed
   */
  @ViewChild('dataGridComponent') set setDataGrid(dataGrid: PeDataGridComponent) {
    if (dataGrid?.showFilters$) {
      dataGrid.showFilters$.subscribe((value) => {
        if (value === null) {
          this.showSideNav$.next(true);
        } else if (value !== this.showSideNav$.value) {
          this.showSideNav$.next(value);
        }
      });
    }
  }

  /** Used to set sidebar open/closed */
  set showSidebar(value: boolean) {
    this.showSideNav$.next(value);
  }

  /** Used to get sidebar state */
  get showSidebar() {
    return this.showSideNav$.value;
  }

  /** Subscription */
  private subscriptions$: Subscription = new Subscription();

  /** Variable that stores business id */
  localBusinessId;

  /** Subject used for sidebar nav open/close */
  showSideNav$ = new BehaviorSubject<boolean>(true);

  /** Refresh Subject */
  refreshSubject$ = new BehaviorSubject(true);
  readonly refresh$ = this.refreshSubject$.asObservable();

  /**
   * Edit mode subject
   * @deprecated
   */
  editMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /** Observable whether sidebar is opened or closed  */
  showSidebar$ = this.showSideNav$.asObservable().pipe(delay(10));

  /** Form group for dashboard sidebar category */
  formGroupDashboard: FormGroup;
  /** Form group for calendar sidebar category */
  formGroupCalendar: FormGroup;
  /** Form group for channel sidebar category */
  formGroupChannel: FormGroup;

  /** Variable for storing selected dashboard id */
  selectedDashboard;

  /** Categories array */
  categories = [];

  /** Sidebar footer menu items */
  sideNavActionRail: MenuSidebarFooterData = {
    menuItems: [
      {
        title: this.translateService.translate('statistics.action.add_dashboard'),
        onClick: () => {
          this.onAddDashboard();
        },
      },
    ],
  };

  /** Filter menu options */
  filterItems: PeDataGridFilterItems[] = [
    {
      value: 'Calendar',
      label: this.translateService.translate('statistics.filters.time_range'),
      callback: (event, option) => {
        if (option === 'Calendar') {
          this.openDateTimePicker(event);
        }
      },
    },
    {
      value: 'currency',
      label: this.translateService.translate('statistics.filters.currency'),
    },
  ];

  /** Sidebar navigation tree object */
  sideNavTree: any = {
    a: [],
    b: [
      {
        id: 'today',
        name: this.translateService.translate('statistics.sidebar.calendar.today'),
        children: null,
        noToggleButton: true,
        image: `${this.env.custom.cdn}/icons/calendar-icon.svg`,
        data: {
          isFolder: true,
          isCalendar: true,
        },
      },
      {
        id: 'last week',
        name: this.translateService.translate('statistics.sidebar.calendar.last_week'),
        children: null,
        noToggleButton: true,
        image: `${this.env.custom.cdn}/icons/calendar-icon.svg`,
        data: {
          isFolder: true,
          isCalendar: true,
        },
      },
      {
        id: 'last month',
        name: this.translateService.translate('statistics.sidebar.calendar.last_month'),
        children: null,
        noToggleButton: true,
        image: `${this.env.custom.cdn}/icons/calendar-icon.svg`,
        data: {
          isFolder: true,
          isCalendar: true,
        },
      },
    ],
    c: [],
    d: [],
  };

  /** Widgets observable */
  widgets$ = this.widgetService.widgets$;

  /** Default grid columns */
  gridCols = 7;

  /** Search items array */
  searchItems = [];

  /** Emits event on window resize and sets number of columns using setGridCols() function */
  @HostListener('window:resize', ['$event'])
  onResize($event) {
    this.setGridCols();
  }

  /**
   * Sets grid columns based on window width
   *
   * @returns Number of columns
   */
  setGridCols() {
    const gridWidth = window.innerWidth - 302;
    const cols = gridWidth / 152;
    let numberOfCols = floor(cols);
    if (numberOfCols % 2 !== 0) {
      numberOfCols -= 1;
    }

    if (numberOfCols < 2) {
      numberOfCols = 2;
    }

    this.gridCols = numberOfCols;
  }

  ngOnInit(): void {
    /** Listen to sidebar toggle event */
    this.messageBus.listen('toggle-sidebar').pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.showSidebar = !this.showSidebar;
      });
    /** Listen to header edit open event */
    this.messageBus.listen('edit-open').pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.onEditOpen();
      });

    /** Refreshes component on widget change */
    this.widgetService.refreshWidget$.subscribe(() => {
      this.cdr.detectChanges();
    });
    /**
     * Widget filters observable
     * Upon widgetFilters change filter widgets
     */
    this.widgetService.widgetFilters$
      .pipe(
        skip(1),
        tap((filters) => {
          /** Gets dashboard widgets */
          this.apiService.getWidgets(this.widgetService.currentDashboard?.id).subscribe((val: any) => {
            this.widgetService.webSocket.close();
            this.widgetService.webSocket = new WebSocket(this.env.backend.statisticsWs);
            let widgets = val.map((widget: any) => {
              return {
                widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
                id: widget._id,
                viewType: widget.viewType,
                size: widget.size ?? this.widgetService.widgetSize.Large,
                edit: false,
              };
            });

            /** Filter logic */
            if (filters.length !== 0) {
              const filteredWidgets = widgets
                .filter((widget) => {
                  const isFiltered = [];

                  widget.widgetSettings.forEach((settings) => {
                    settings.forEach((setting) => {
                      filters.forEach((filter) => {
                        if (filter?.filter === 'channel') {
                          if (setting?.type === 'filter') {
                            if (setting?.value?.name === 'channel') {
                              if (filter?.searchText === setting?.value?.value) {
                                isFiltered.push(true);
                              } else {
                                isFiltered.push(false);
                              }
                            }
                          }
                        }
                        if (filter?.filter === 'apps') {
                          if (widget.widgetSettings[0][0]?.value.toLowerCase() === filter.searchText.toLowerCase()) {
                            isFiltered.push(true);
                          } else {
                            isFiltered.push(false);
                          }
                        }
                        if (filter?.filter === 'calendar') {
                          if (setting?.type === 'dateTimeRelative') {
                            if (filter?.searchText === setting?.value) {
                              isFiltered.push(true);
                            } else {
                              isFiltered.push(false);
                            }
                          }
                        }
                        if (filter?.filter === 'Time frame') {
                          if (filter?.searchText?.filter) {
                            if (setting?.type === 'dateTimeRelative') {
                              if (filter?.searchText?.filter === setting?.value) {
                                isFiltered.push(true);
                              } else {
                                isFiltered.push(false);
                              }
                            }
                          } else {
                            if (setting?.type === 'dateTimeFrom') {
                              if (moment(setting?.value).isAfter(moment(filter?.searchText?.start))) {
                                isFiltered.push(true);
                              } else {
                                isFiltered.push(false);
                              }
                            }
                            if (setting?.type === 'dateTimeTo') {
                              if (filter?.searchText?.end !== null) {
                                if (moment(setting?.value).isBefore(moment(filter?.searchText?.end))) {
                                  isFiltered.push(true);
                                } else {
                                  isFiltered.push(false);
                                }
                              }
                            }
                          }
                        }
                        if (filter?.filter === 'currency') {
                          if (setting?.type === 'filter') {
                            if (setting?.value?.name === 'currency') {
                              if (setting?.value?.value === filter.searchText) {
                                isFiltered.push(true);
                              } else {
                                isFiltered.push(false);
                              }
                            }
                          }
                        }
                      });
                    });
                  });

                  if (isFiltered.length === 0) {
                    return false;
                  }

                  return isFiltered.every(value => value);
                })
                .map(widget => widget.id);

              if (filters.filter(item => item.filter === 'apps').length >= 1) {
                const appFilteredWidgets = widgets
                  .filter((widget) => {
                    const appFilters = filters
                      .filter(item => item.filter === 'apps')
                      .map(element => element.searchText.toLowerCase());
                    if (appFilters.includes(widget.widgetSettings[0][0]?.value.toLowerCase())) {
                      return true;
                    }

                    return false;
                  })
                  .map(widget => widget.id);

                widgets = widgets.filter((widget) => {
                  if (appFilteredWidgets.includes(widget.id)) {
                    return true;
                  }

                  return false;
                });
              }

              widgets.forEach((element, index) => {
                if (filteredWidgets.includes(element.id)) {
                  widgets[index].filtered = false;
                } else {
                  widgets[index].filtered = true;
                }
              });

              this.widgetService.widgets = widgets;
            } else {
              this.widgetService.widgets = widgets;
            }

            this.cdr.detectChanges();
          });
        }),
      )
      .subscribe();

    this.getWidgetTypeAndSize();

    /** Adds header items */
    this.headerService.assignConfig({
      isShowDataGridToggleComponent: true,
      showDataGridToggleItem: {
        onClick: () => {
          this.showSidebar = !this.showSideNav$.value;
        },
      },
      leftSectionItems: [
        {
          title: this.translateService.translate('statistics.action.edit'),
          class: 'statistics__header-button',
          onClick: (e) => {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }

            const sectionItem = this.headerService.config.leftSectionItems[0];
            const sectionItemClass = sectionItem?.class;
            sectionItem.class = `${sectionItemClass} statistics__header-button--active`;

            const data = {
              title: this.translateService.translate('statistics.action.edit'),
              list: [
                {
                  label: this.translateService.translate('statistics.action.add_widget'),
                  value: 'add_widget',
                },
                {
                  label: this.translateService.translate('statistics.action.full_screen_zoom'),
                  value: 'full_screen',
                },
              ],
            };

            let dialogRef;
            if (e) {
              dialogRef = this.menu.open(e, {
                data,
                theme: this.theme,
              });
            } else {
              dialogRef = this.headerMenu.open(
                {
                  data,
                  disableClose: false,
                  hasBackdrop: true,
                  panelClass: 'edit-dialog',
                  autoFocus: false,
                  theme: this.theme,
                });
            }
            dialogRef.afterClosed.subscribe((d) => {
              if (d === 'add_widget') {
                this.onAddWidgetClick();
              }
              if (d === 'full_screen') {
                this.showFullscreen();
              }

              sectionItem.class = sectionItemClass;
              this.headerService.assignConfig(this.headerService.config);
            });
          },
        },
      ],
    } as PePlatformHeaderConfig);

    /**
     * Window resize observable
     * Used to dynamically set right header
     */
    fromEvent(window, 'resize').subscribe(() => {
      this.isMobile = window.innerWidth < 620;
      if (this.isMobile) {
        this.mobileHeaderInit();

        return;
      }
      this.desktopHeaderInit();
    });

    if (this.isMobile) {
      this.headerService.assignConfig({
        isShowSubheader: this.isMobile,
        leftSectionItems: [
          {
            icon: '#icon-header-menu',
            iconSize: '25px',
            iconType: 'vector',
            onClick: (e) => {
              e.preventDefault();
              e.stopPropagation();

              const data = {
                option: [
                  {
                    title: this.translateService.translate('statistics.action.edit'),
                    icon: '#icon-edit-pencil-24',
                    list: [
                      {
                        label: this.translateService.translate('statistics.action.add_widget'),
                        value: 'add_widget',
                      },
                      {
                        label: this.translateService.translate('statistics.action.full_screen_zoom'),
                        value: 'full_screen',
                      },
                    ],
                  },
                ],
              };

              const dialogRef = this.headerMenu.open({ data, theme: this.theme });
              dialogRef.afterClosed.subscribe((d) => {
                if (d === 'add_widget') {
                  this.onAddWidgetClick();
                }
                if (d === 'full_screen') {
                  this.showFullscreen();
                }
              });
            },
          },
        ],
      } as PePlatformHeaderConfig);
    }
    this.cdr.detectChanges();
    this.setGridCols();
    this.formGroupDashboard = this.fb.group({
      tree: [[]],
      toggle: [false],
    });
    this.categories.push({
      title: this.translateService.translate('statistics.sidebar.subtitle_my'),
      tree: [...this.sideNavTree.a],
      editMode: false,
    });
    this.getDashboards();
  }

  ngAfterViewInit() {
    /** If mobile close sidebar on load */
    if (this.isMobile) {
      this.showSidebar = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    /** Unsubscribe when component destroyed */
    if (this.subscriptions$) {
      this.subscriptions$.unsubscribe();
    }
  }

  onEditOpen() {
    const data = {
      option: [
        {
          title: this.translateService.translate('statistics.action.edit'),
          icon: '#icon-edit-pencil-24',
          list: [
            {
              label: this.translateService.translate('statistics.action.add_widget'),
              value: 'add_widget',
            },
            {
              label: this.translateService.translate('statistics.action.full_screen_zoom'),
              value: 'full_screen',
            },
          ],
        },
      ],
    };

    const dialogRef = this.headerMenu.open(
      {
        data,
        disableClose: false,
        hasBackdrop: true,
        panelClass: 'edit-dialog',
        autoFocus: false,
        theme: this.theme,
      });
    dialogRef.afterClosed.subscribe((d) => {
      if (d === 'add_widget') {
        this.onAddWidgetClick();
      }
      if (d === 'full_screen') {
        this.showFullscreen();
      }
    });
  }

  /** Sets mobile header */
  mobileHeaderInit() {
    this.headerService.assignConfig({
      isShowSubheader: this.isMobile,
    } as PePlatformHeaderConfig);
  }

  /** Sets desktop header */
  desktopHeaderInit() {
    this.headerService.assignConfig({
      isShowDataGridToggleComponent: true,
      showDataGridToggleItem: {
        onClick: () => {
          this.showSidebar = !this.showSidebar;
        },
      },
    } as PePlatformHeaderConfig);
  }

  /**
   * Function that sets fullscreen mode
   */
  showFullscreen() {
    if (this.isMobile) {
      if (!this.isFullScreenMode) {
        this.isFullScreenMode = true;
        this.headerService.assignConfig({
          isShowSubheader: this.isMobile,
          leftSectionItems: [
            {
              icon: '#icon-header-menu',
              iconSize: '25px',
              iconType: 'vector',
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();

                const data = {
                  option: [
                    {
                      title: this.translateService.translate('statistics.action.edit'),
                      icon: '#icon-edit-pencil-24',
                      list: [
                        {
                          label: this.translateService.translate('statistics.action.add_widget'),
                          value: 'add_widget',
                        },
                        {
                          label: this.translateService.translate('statistics.action.exit_full_screen_zoom'),
                          value: 'full_screen',
                        },
                      ],
                    },
                  ],
                };

                const dialogRef = this.headerMenu.open({ data, theme: this.theme });
                dialogRef.afterClosed.subscribe((d) => {
                  if (d === 'add_widget') {
                    this.onAddWidgetClick();
                  }
                  if (d === 'full_screen') {
                    this.showFullscreen();
                  }
                });
              },
            },
          ],
        } as PePlatformHeaderConfig);
      } else {
        this.isFullScreenMode = false;
        this.headerService.assignConfig({
          isShowSubheader: this.isMobile,
          leftSectionItems: [
            {
              icon: '#icon-header-menu',
              iconSize: '25px',
              iconType: 'vector',
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();

                const data = {
                  option: [
                    {
                      title: this.translateService.translate('statistics.action.edit'),
                      icon: '#icon-edit-pencil-24',
                      list: [
                        {
                          label: this.translateService.translate('statistics.action.add_widget'),
                          value: 'add_widget',
                        },
                        {
                          label: this.translateService.translate('statistics.action.full_screen_zoom'),
                          value: 'full_screen',
                        },
                      ],
                    },
                  ],
                };

                const dialogRef = this.headerMenu.open({ data, theme: this.theme });
                dialogRef.afterClosed.subscribe((d) => {
                  if (d === 'add_widget') {
                    this.onAddWidgetClick();
                  }
                  if (d === 'full_screen') {
                    this.showFullscreen();
                  }
                });
              },
            },
          ],
        } as PePlatformHeaderConfig);
      }

      this.cdr.detectChanges();

      return;
    }
    if (!this.isFullScreenMode) {
      this.isFullScreenMode = true;
      this.showSidebar = false;
      this.headerService.assignConfig({
        leftSectionItems: [
          {
            title: this.translateService.translate('statistics.action.edit'),
            class: 'statistics__header-button',
            onClick: (e) => {
              if (e) {
                e.preventDefault();
                e.stopPropagation();
              }
              const sectionItem = this.headerService.config.leftSectionItems[0];
              const sectionItemClass = sectionItem?.class;
              sectionItem.class = `${sectionItemClass} statistics__header-button--active`;

              const data = {
                title: this.translateService.translate('statistics.action.edit'),
                list: [
                  {
                    label: this.translateService.translate('statistics.action.add_widget'),
                    value: 'add_widget',
                  },
                  {
                    label: this.translateService.translate('statistics.action.exit_full_screen_zoom'),
                    value: 'full_screen',
                  },
                ],
              };
              let dialogRef;
              if (e) {
                dialogRef = this.menu.open(e, {
                  data,
                  theme: this.theme,
                });
              } else {
                dialogRef = this.headerMenu.open(
                  {
                    data,
                    disableClose: false,
                    hasBackdrop: true,
                    panelClass: 'edit-dialog',
                    autoFocus: false,
                    theme: this.theme,
                  });
              }
              dialogRef.afterClosed.subscribe((d) => {
                if (d === 'add_widget') {
                  this.onAddWidgetClick();
                }
                if (d === 'full_screen') {
                  this.showFullscreen();
                }

                sectionItem.class = sectionItemClass;
                this.headerService.assignConfig(this.headerService.config);
              });
            },
          },
        ],
      } as PePlatformHeaderConfig);
    } else {
      this.isFullScreenMode = false;
      this.showSidebar = true;
      this.headerService.assignConfig({
        leftSectionItems: [
          {
            title: this.translateService.translate('statistics.action.edit'),
            class: 'statistics__header-button',
            onClick: (e) => {
              if (e) {
                e.preventDefault();
                e.stopPropagation();
              }

              const sectionItem = this.headerService.config.leftSectionItems[0];
              const sectionItemClass = sectionItem?.class;
              sectionItem.class = `${sectionItemClass} statistics__header-button--active`;

              const data = {
                title: this.translateService.translate('statistics.action.edit'),
                list: [
                  {
                    label: this.translateService.translate('statistics.action.add_widget'),
                    value: 'add_widget',
                  },
                  {
                    label: this.translateService.translate('statistics.action.full_screen_zoom'),
                    value: 'full_screen',
                  },
                ],
              };
              let dialogRef;
              if (e) {
                dialogRef = this.menu.open(e, {
                  data,
                  theme: this.theme,
                });
              } else {
                dialogRef = this.headerMenu.open(
                  {
                    data,
                    disableClose: false,
                    hasBackdrop: true,
                    panelClass: 'edit-dialog',
                    autoFocus: false,
                    theme: this.theme,
                  });
              }
              dialogRef.afterClosed.subscribe((d) => {
                if (d === 'add_widget') {
                  this.onAddWidgetClick();
                }
                if (d === 'full_screen') {
                  this.showFullscreen();
                }
                sectionItem.class = sectionItemClass;
                this.headerService.assignConfig(this.headerService.config);
              });
            },
          },
        ],
      } as PePlatformHeaderConfig);
    }

    this.cdr.detectChanges();
  }

  /**
   * When dashboard is renamed update on backend
   *
   * @param e Rename event
   */
  nodeRenamed(e) {
    if (e.data.isNewDash) {
      this.apiService
        .createSingleDashboard({ name: e.name })
        .pipe(
          tap((x: any) => {
            const newDashIndex = this.categories[0].tree.findIndex(element => element.id === e.id);
            this.categories[0].tree[newDashIndex].id = x._id;
            this.categories[0].tree[newDashIndex].data.isNewDash = false;

            this.widgetService.currentDashboard = this.categories[0].tree[newDashIndex];
            this.formGroupDashboard.get('tree').patchValue([this.widgetService.currentDashboard]);
            this.getSelectedDashboard(this.categories[0].tree[newDashIndex].id);
            this.cdr.detectChanges();
          }),
        )
        .subscribe();
    } else {
      this.apiService
        .editDashboardName(e.id, { name: e.name })
        .pipe(
          tap((_) => {
          }),
          catchError((err) => {
            if (err.status === 503 && 500) {
              this.snackBar.open('Oh, no! Server returns error! Unable to rename dashboard.');
            }

            return throwError(err.message);
          }),
        )
        .subscribe();
    }
  }

  /**
   * On search change update search items array and widgetFilters subject
   *
   * @param e Gives search filter object
   */
  onSearchChanged(e) {
    this.searchItems = [...this.searchItems, e];

    this.widgetService.widgetFilters = [...this.widgetService.widgetFilters, e];
  }

  /**
   * On search item remove removes item from search item array and widgetFilters subject
   *
   * @param e Gives removed search filter object
   */
  onSearchRemove(e) {
    this.searchItems.splice(e, 1);
    const widgets = this.widgetService.widgetFilters;
    widgets.splice(e, 1);
    this.widgetService.widgetFilters = widgets;
  }

  /**
   * Filters the widgets
   * @deprecated
   */
  filterWidgets(searchItems) {
    const { filter, contains, searchText } = searchItems;
    const widgets = this.widgetService.widgets.filter((widget) => {
      let isFiltered = false;
      widget.widgetSettings.forEach((settings) => {
        settings.forEach((setting) => {
          if (setting?.type === 'filter') {
            if (setting?.value.name === filter) {
              if (setting?.value.value === searchText) {
                isFiltered = true;
              }
            }
          }
        });
      });

      if (contains === 0) {
        return isFiltered;
      }

      return !isFiltered;
    });

    return widgets;
  }

  /**
   * Opens datetime picker and updates filters
   * @param event Mouse click event
   */
  openDateTimePicker(event: MouseEvent) {
    const dialogRef = this.dateTimePickerExtended.open(event, { theme: this.theme });
    dialogRef.afterClosed.subscribe((dateTimeObject) => {
      const datePicked = dateTimeObject.range;
      const filter = dateTimeObject.filter;

      this.widgetService.widgetFilters = [
        ...this.widgetService.widgetFilters,
        {
          filter: 'Time frame',
          contains: PeFilterContainsEnum.Contains,
          searchText: { filter, start: datePicked?.start, end: datePicked?.end },
        },
      ];

      this.searchItems = [
        ...this.searchItems,
        {
          filter: 'Time frame',
          contains: 0,
          searchText:
            datePicked.end !== null
              ? `${moment(datePicked.start).format('DD.MM.YYYY')} - ${moment(datePicked.end).format('DD.MM.YYYY')}`
              : `${moment(datePicked.start).format('DD.MM.YYYY')}`,
        },
      ];
      this.cdr.detectChanges();
    });
  }

  /**
   * Sets line graph size
   * @param size Line graph size
   */
  getGraphView(size) {
    return sizeOptions.find(sizeOption => sizeOption.size === size)?.graphView;
  }

  /** Opens Add widget overlay */
  onAddWidgetClick() {
    this.widgetService.currentPage = 0;
    const onSaveSubject$ = new BehaviorSubject(null);
    const data = {};
    const headerConfig = {
      onSaveSubject$,
      title: this.translateService.translate('statistics.overlay_titles.add_widget'),
      backBtnTitle: this.translateService.translate('statistics.action.back'),
      backBtnCallback: () => {
        onSaveSubject$.next(false);
      },
      doneBtnTitle: this.translateService.translate('statistics.action.next'),
      doneBtnCallback: () => {
        onSaveSubject$.next(true);
      },
      onSave$: onSaveSubject$.asObservable(),
      theme: this.theme,
    } as any;
    this.widgetService.overlayRef = this.overlayWidgetService.open({
      data,
      headerConfig,
      component: PeStatisticsOverlayComponent,
      backdropClick: () => {
        const contents: ConfirmDialogContentsInterface = {
          title: this.translateService.translate('statistics.confirm_dialog.are_you_sure'),
          subtitle: this.translateService.translate('statistics.confirm_dialog.subtitle_exit'),
          confirmButton: this.translateService.translate('statistics.action.yes'),
          declineButton: this.translateService.translate('statistics.action.no'),
        };
        this.confirmService.openConfirmDialog(this.theme, contents);
        this.confirmService.afterClosed.pipe(take(1)).subscribe((isConfirm) => {
          if (isConfirm) {
            this.widgetService.overlayRef.close();
          }
        });

        return EMPTY;
      },
    });
  }

  /**
   * Selects dashboard based on dashboard item clicked
   * @param e Gives clicked dashboard item
   */
  dashboardClick(e) {
    this.selectedDashboard = e.filter(dashboard => dashboard?.data?.isDashboard === true)[0];
    if (this.selectedDashboard?.id) {
      if (this.selectedDashboard?.id !== this.widgetService.currentDashboard?.id) {
        this.getSelectedDashboard(this.selectedDashboard?.id);
        if (this.isMobile) {
          this.showSidebar = false;
          this.cdr.detectChanges();
        }

        return;
      }
    }
  }

  /**
   * Adds channel item filters based on ones selected
   * @param e Channel items clicked
   */
  channelClick(e) {
    const channelFilters = e.filter(app => app?.data?.isChannels === true).map(item => item.id);
    if (channelFilters.length !== 0) {
      this.widgetFilters = this.widgetFilters.filter(filter => filter.filter !== 'channel');
      channelFilters.forEach((element) => {
        this.widgetFilters = [
          ...this.widgetFilters,
          {
            filter: 'channel',
            contains: PeFilterContainsEnum.Contains,
            searchText: element,
          },
        ];
      });
    }

    if (channelFilters.length === 0) {
      this.widgetFilters = this.widgetService.widgetFilters.filter(filter => filter.filter !== 'channel');
    }
    this.widgetService.widgetFilters = this.widgetFilters;
  }

  /**
   * Gets selected dashboard by dashboard id
   * @param dashboardId dashboard id
   */
  getSelectedDashboard(dashboardId) {
    this.apiService
      .getDashboardsById(dashboardId)
      .pipe(
        switchMap((dashboard: any) => {
          this.widgetService.currentDashboard = {
            id: dashboard._id,
            name: dashboard.name,
            children: [],
            noToggleButton: true,
            image: `${this.env.custom.cdn}/icons/apps-icon.svg`,
            data: {
              isDashboard: true,
              isFolder: true,
            },
          };

          return this.apiService.getWidgets(dashboardId);
        }),
        tap((widgets: any[]) => {
          this.widgetService.webSocket.close();
          this.widgetService.webSocket = new WebSocket(this.env.backend.statisticsWs);
          this.apiService.getWidgetData().subscribe((widgetData: { channels: string[]; paymentMethods: string[] }) => {
            this.widgetService.appChannels = widgetData?.channels.map((channel) => {
              return { label: this.translateService.translate(`statistics.channels.${channel}`), value: channel };
            });
            this.widgetService.paymentMethods = widgetData?.paymentMethods.map((paymentMethod) => {
              const label = ucfirst(paymentMethod.replace(/_/g, ' '));

              return { label, value: paymentMethod };
            });

            this.cdr.detectChanges();
          });
          this.widgetService.widgets = [];
          this.widgetService.widgets = widgets.map((widget: any) => {
            return {
              id: widget._id,
              widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
              createdAt: widget.createdAt,
              updatedAt: widget.updatedAt,
              type: widget.type,
              viewType: widget.viewType,
              size: widget.size ?? this.widgetService.widgetSize.Large,
              edit: false,
            };
          });
        }),
      )
      .subscribe();
  }

  /** Gets dasbboards */
  getDashboards(): void {
    const dashboards$ = this.apiService.getDashboards();
    const sideNavDashboardOptions$ = dashboards$.pipe(
      map((res: any[]) => {
        const data = res.map((item: any) => {
          const tile: TreeFilterNode = {
            id: item._id,
            name: item.name,
            children: [],
            noToggleButton: true,
            image: `${this.env.custom.cdn}/icons/apps-icon.svg`,
            data: {
              isDashboard: true,
              isFolder: true,
            },
          };

          return tile;
        });

        return data;
      }),
    );
    const dashboardExistenceCheck$ = dashboards$.pipe(
      takeUntil(this.destroyed$),
      switchMap((dashboards: any[]) => {
        this.doesHaveDashboards = dashboards.find(dashboard => dashboard?.business?._id === this.localBusinessId);
        if (!this.doesHaveDashboards) {
          return this.apiService
            .createSingleDashboard({
              name: this.translateService.translate('statistics.action.initial_dashboard'),
            })
            .pipe(
              tap((res) => {
                this.getDashboards();
              }),
            );
        }
        this.widgetService.apps = dashboards[0]?.availableTypes;

        return this.apiService.getWidgets(dashboards[0]._id);
      }),
      tap((widgets: any[]) => {
        this.apiService.getWidgetData().pipe(takeUntil(this.destroyed$))
          .subscribe((widgetData: { channels: string[]; paymentMethods: string[] }) => {
            this.widgetService.appChannels = widgetData?.channels.map((channel) => {
              return { label: this.translateService.translate(`statistics.channels.${channel}`), value: channel };
            });
            this.widgetService.paymentMethods = widgetData?.paymentMethods.map((paymentMethod) => {
              const label = ucfirst(paymentMethod.replace(/_/g, ' '));

              return { label, value: paymentMethod };
            });
            this.cdr.detectChanges();
          });
        if (this.widgetService.webSocket) {
          this.widgetService.webSocket.close();
        }
        this.widgetService.webSocket = new WebSocket(this.env.backend.statisticsWs);
        this.widgetService.widgets = Array.isArray(widgets) && widgets.map((widget: any) => {
          return {
            id: widget._id,
            widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
            createdAt: widget.createdAt,
            updatedAt: widget.updatedAt,
            type: widget.type,
            viewType: widget.viewType,
            size: widget.size ?? this.widgetService.widgetSize.Large,
            edit: false,
          };
        });
      }),
    );

    this.subscriptions$.add(
      sideNavDashboardOptions$
        .pipe(
          takeUntil(this.destroyed$),
          tap((x) => {
            this.widgetService.currentDashboard = x[0];
            this.formGroupDashboard.get('tree').patchValue([this.widgetService.currentDashboard]);
          }),
          tap(x => (this.categories[0].tree = x)),
        )
        .subscribe(),
    );

    dashboardExistenceCheck$.subscribe();
  }

  /**
   * Adds edit option on widget that is clicked
   *
   * @param widget Widget id of clicked widget
   */
  onClickToEdit(event, widget) {
    if (widget.edit === false) {
      const widgetIndex = this.widgetService.widgets.indexOf(widget);
      const newWidgets = this.widgetService.widgets;
      newWidgets.forEach((wid, index) => {
        newWidgets[index].edit = false;
      });
      newWidgets[widgetIndex].edit = true;
      this.widgetService.widgets = newWidgets;
      this.cdr.detectChanges();
    } else {
      const widgetIndex = this.widgetService.widgets.indexOf(widget);
      const newWidgets = this.widgetService.widgets;
      newWidgets[widgetIndex].edit = false;
      this.widgetService.widgets = newWidgets;
      this.cdr.detectChanges();
    }
  }

  /** Adds new dashboard */
  onAddDashboard() {
    this.categories[0].tree = [
      ...this.categories[0].tree,
      {
        id: newDashboardIndex,
        name: this.translateService.translate('statistics.action.new_dashboard'),
        editing: true,
        children: [],
        noToggleButton: true,
        image: `${this.env.custom.cdn}/icons/apps-icon.svg`,
        data: {
          isDashboard: true,
          isFolder: true,
          isNewDash: true,
        },
      },
    ];
    newDashboardIndex += 1;
    this.cdr.detectChanges();
  }

  /** Gets widget types and sizes */
  getWidgetTypeAndSize() {
    this.apiService
      .getWidgetTypeData()
      .pipe(
        tap((res: any) => {
          this.widgetService.widgetSize = res.widgetSize.reduce((accu, item) => {
            accu[item] = item.toLowerCase();

            return { ...accu };
          }, {});

          this.widgetService.widgetType = res.widgetType.reduce((accu, item) => {
            accu[item] = item;

            return { ...accu };
          }, {});
        }),
      )
      .subscribe();
  }

  /** Returns sidebar category */
  checkCategory(category) {
    if (category.title === this.translateService.translate('statistics.sidebar.subtitle_apps')) {
      return 'apps';
    }
    if (category.title === this.translateService.translate('statistics.sidebar.subtitle_channels')) {
      return 'channels';
    }
    if (category.title === this.translateService.translate('statistics.sidebar.subtitle_my')) {
      return 'dashboard';
    }
    if (category.title === this.translateService.translate('statistics.sidebar.subtitle_calendar')) {
      return 'calendar';
    }
  }

  /**
   * Opens dashboard context menu
   *
   * @param event click event
   */
  openDashboardContextMenu(event) {
    event.event.preventDefault();
    event.event.stopPropagation();

    const data = {
      title: 'Options',
      list: [
        { label: this.translateService.translate('statistics.action.rename_dashboard'), value: 'rename' },
        { label: this.translateService.translate('statistics.action.delete_dashboard'), value: 'delete', red: true },
      ],
    };

    const dialogRef = this.contextMenu.open(event.event, { data, theme: this.theme });
    dialogRef.afterClosed.subscribe((d) => {
      switch (d) {
        case 'rename':
          const dashboardIndex = this.categories[0].tree.findIndex(item => item.id === event.node.id);
          this.categories[0].tree[dashboardIndex].editing = true;
          this.cdr.detectChanges();
          break;
        case 'delete':
          const dashIndex = this.categories[0].tree.findIndex(item => item.id === event.node.id);
          const currentDashboard = this.categories[0].tree[dashIndex];
          this.apiService
            .deleteDashboardName(currentDashboard.id)
            .pipe(
              tap((_) => {
                this.getDashboards();
              }),
            )
            .subscribe();
          break;
        default:
          break;
      }
    });
  }

  /**
   * Opens add widget context menu
   *
   * @param event mouse click
   */
  openWidgetContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();

    const data = {
      title: 'Options',
      list: [{ label: this.translateService.translate('statistics.action.add_widget'), value: 'widget' }],
    };

    const dialogRef = this.contextMenu.open(event, { data, theme: this.theme });
    dialogRef.afterClosed.subscribe((d) => {
      if (d === 'widget') {
        {
          this.onAddWidgetClick();
        }
      }
    });
  }

  onChangeTitle(event: string) {
    console.log(event);
  }
}
