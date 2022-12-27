import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { Select, Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import intersection from 'lodash/intersection';
import isFunction from 'lodash/isFunction';
import {
  animationFrameScheduler,
  BehaviorSubject,
  combineLatest,
  from,
  fromEvent,
  merge,
  Observable,
  of,
  Subject,
} from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  retryWhen,
  shareReplay,
  switchMap,
  switchMapTo,
  take,
  takeUntil,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import {
  PebAbstractEditor,
  PebEditorAbstractNavigation,
  PebEditorAbstractToolbar,
  PebEditorSlot,
} from '@pe/builder-abstract';
import { PebEditorApi, PebEditorWs, PebEditorWsEvents } from '@pe/builder-api';
import { PebControlsService } from '@pe/builder-controls';
import {
  pebCreateLogger,
  PebEditorCommand,
  PebEditorIntegrationsStore,
  PebEditorState,
  PebElementDef,
  PebElementId,
  PebElementType,
  PebEnvService,
  PebIntegrationActionTag,
  PebIntegrationTag,
  PebPageType,
  PebPageVariant,
  PebScreen,
  pebScreenDocumentWidthList,
  PebTheme,
  PebThemeDetailInterface,
  PebThemePageInterface,
  PebThemeShortPageInterface,
} from '@pe/builder-core';
import { FontLoaderService } from '@pe/builder-font-loader';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { checkElements, EDITOR_CONFIG_UI, ElementManipulation, PEB_EDITOR_PLUGINS } from '@pe/builder-old';
import { PebProductCategoriesComponent, PebProductsComponent } from '@pe/builder-products';
import {
  fromResizeObserver,
  PebAbstractElement,
  PebDefaultScreenAction,
  PebEditorOptionsState,
  PebRenderer,
  PebRTree,
  PebSetScaleAction,
} from '@pe/builder-renderer';
import {
  BackgroundActivityService,
  ContextBuilder,
  EditorSidebarTypes,
  PebEditorAccessorService,
  PebEditorStore,
  PebEditorThemeService,
} from '@pe/builder-services';
import { PebShapesComponent } from '@pe/builder-shapes';
import { PebLinkFormService } from '@pe/builder-shared';
import { PebDeselectAllAction, PebElementSelectionState, PebSelectAction } from '@pe/builder-state';
import { AppThemeEnum, MessageBus, PebDeviceService, PeDestroyService } from '@pe/common';
import { SnackbarConfig, SnackbarService } from '@pe/snackbar';

import { PebInsertAction } from './actions';
import { PebGenericSidebarComponent } from './components/generic-sidebar/generic-sidebar.component';
import { PebEditorRightSidebarComponent } from './components/right-sidebar/right-sidebar.component';
import { PebEditorLanguagesDialog } from './dialogs/languages/languages.dialog';
import { PebEditorPublishDialogComponent } from './dialogs/publish-dialog/publish-dialog.component';
import { PebEditorScriptsDialogService } from './dialogs/scripts/scripts.service';
import { EditorIcons } from './editor-icons';
import { sidebarsAnimations } from './editor.animations';
import { PebEditorUtilsService } from './services';


const logCommands = pebCreateLogger('editor:commands');

@Component({
  selector: 'peb-editor',
  templateUrl: './editor.component.html',
  styleUrls: [
    '../../../styles/src/lib/styles/_sidebars.scss',
    './editor.component.scss',
  ],
  providers: [
    PebEditorUtilsService,
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    sidebarsAnimations,
  ],
})
export class PebEditor extends PebAbstractEditor implements OnInit, AfterViewInit, OnDestroy {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$: Observable<PebScreen>;

  selectedElements: PebElementId[];
  screen: PebScreen;

  @Input()
  set data(value: { theme: PebTheme, snapshot: PebThemeDetailInterface }) {
    if (value) {
      const pageId = value.snapshot?.pages?.find(p => p.id === this.queryParams.pageId) ?
        this.queryParams.pageId : null;
      this.editorStore.openTheme(value.theme, value.snapshot, pageId);
      this.store.dispatch(new PebDefaultScreenAction(value.theme.defaultScreen ?? PebScreen.Desktop));
    }
  }

  @Output() changeLastSavingTime = new EventEmitter<string>();
  @Output() changeSavingStatus = new EventEmitter<string>();

  @ViewChild(PebRenderer)
  set renderer(val: PebRenderer) {
    if (val) {
      this.editorAccessorService.rendererSubject$.next(val);
    }
  }

  get renderer() {
    return this.editorAccessorService.rendererSubject$.value;
  }

  @ViewChild('contentContainerSlot') contentContainerSlotRef: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @ViewChild('contentContainerSlot', { read: ViewContainerRef }) contentContainerSlot: ViewContainerRef;
  @ViewChild('toolbarSlot', { read: ViewContainerRef, static: true }) public toolbarSlot: ViewContainerRef;
  @ViewChild('leftSidebarSlot', { read: ViewContainerRef, static: true }) public leftSidebarSlot: ViewContainerRef;
  @ViewChild(PebEditorRightSidebarComponent) public rightSidebar: PebEditorRightSidebarComponent;

  contentContainerInsert$ = new Subject<ComponentRef<any>>();

  get rightSidebarFormatSlot() {
    return this.rightSidebar.formatSlot;
  }

  get rightSidebarMotionSlot() {
    return this.rightSidebar.motionSlot;
  }

  get rightSidebarPageSlot() {
    return this.rightSidebar.pageSlot;
  }

  get rightSidebarDetailSlot() {
    return this.rightSidebar.detailSlot;
  }

  get rightSidebarOptionListSlot() {
    return this.rightSidebar.optionListSlot;
  }

  /** deprecated */
  get sidebarSlot() { return this.rightSidebarFormatSlot; }

  readonly commands$ = new Subject<PebEditorCommand>();
  readonly renderer$ = this.editorAccessorService.rendererSubject$.pipe(distinctUntilChanged());

  readonly manipulateElementSubject$ = new Subject<ElementManipulation>();
  readonly manipulateElement$ = this.manipulateElementSubject$.asObservable();

  readonly sidebarsActivityLayers$ = this.state.sidebarsActivity$.pipe(map(({ layers }) => layers),shareReplay(1));

  readonly pages$: Observable<PebThemeShortPageInterface[]> = this.editorStore.snapshot$.pipe(
    filter(snapshot => !!snapshot),
    map((snapshot: PebThemeDetailInterface) => snapshot.pages),
  );

  readonly activePageSnapshotSubject$ = new BehaviorSubject(null);

  readonly activePageSnapshot$ = this.activePageSnapshotSubject$.pipe(shareReplay(1));

  readonly isDetail$ = new BehaviorSubject<boolean>(false);
  get isDetail() {
    return this.isDetail$.getValue();
  }

  set isDetail(value: boolean) {
    this.isDetail$.next(value);
  }

  readonly isOptionList$ = new BehaviorSubject<boolean>(false);
  get isOptionList() {
    return this.isOptionList$.getValue();
  }

  set isOptionList(value: boolean) {
    this.isOptionList$.next(value);
  }

  sidebarHidden$ = combineLatest([this.isDetail$, this.isOptionList$]).pipe(
    map(([isDetail, isOptionList]) => isDetail || isOptionList),
  );

  detail: { back: string; title: string; } = null;
  optionList: { back: string; title: string } = null;

  rightSidebarTabs = [
    { title: 'Format', active: false },
    { title: 'Animate', active: false },
    { title: 'Page', active: true },
  ];

  previewOptions = {
    width: 250,
    height: 150,
    padding: {
      desktop: 0,
      tablet: 60,
      mobile: 100,
    },
  };

  get nativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  PebElementType = PebElementType;

  get pages() {
    return this.editorStore.pages;
  }

  get theme() {
    return this.editorStore.theme;
  }

  get snapshot() {
    return this.editorStore.snapshot;
  }

  get contextBuilder() {
    return this.contextManager;
  }

  readonly skeletonPages = Array.from({ length: 2 });

  readonly theming = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private editorStore: PebEditorStore,
    public state: PebEditorState,
    private contextManager: ContextBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    public injector: Injector,
    public cdr: ChangeDetectorRef,
    public cfr: ComponentFactoryResolver,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private fontLoaderService: FontLoaderService,
    private backgroundActivityService: BackgroundActivityService,
    private themeService: PebEditorThemeService,
    @Inject(PLATFORM_ID) private platformId: any,
    private editorAccessorService: PebEditorAccessorService,
    private integrationsStore: PebEditorIntegrationsStore,
    public deviceService: PebDeviceService,
    private editorUtilsService: PebEditorUtilsService,
    private editorWs: PebEditorWs,
    private readonly destroy$: PeDestroyService,
    private messageBus: MessageBus,
    private snackbarService: SnackbarService,
    private editorApi: PebEditorApi,
    private envService: PebEnvService,
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    private store: Store,
    public editorRenderer: PebEditorRenderer,
    @Inject('PEB_ENTITY_NAME') private appType: string,
    private scriptsDialogService: PebEditorScriptsDialogService,
    private apmService: ApmService,
    private tree: PebRTree<PebAbstractElement>,
    linkFormService: PebLinkFormService,
    private readonly controlsService: PebControlsService,
  ) {
    super();

    linkFormService.init();
    Object.entries(EditorIcons).forEach(([name, path]) => {
      iconRegistry.addSvgIcon(
        name,
        domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${path}`),
      );
    });

    this.editorAccessorService.editorComponent = this;
    this.state.reset();
    this.selectedElements$.pipe(
      tap((elements) => {
        this.selectedElements = elements.map(element => element.id);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.screen$.pipe(
      tap((screen) => {
        this.screen = screen;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
    this.store.dispatch(new PebDeselectAllAction());

    this.editorUtilsService.constructPageSnapshot(
      this.editorStore.snapshot$,
      this.editorStore.page$,
      this.screen$,
    ).pipe(
      tap(this.activePageSnapshotSubject$),
      takeUntil(this.destroy$),
    ).subscribe();

    this.fontLoaderService.renderFontLoader();

    this.editorStore.snapshot$.pipe(
      switchMapTo(this.editorAccessorService.rendererSubject$),
      filter(renderer => !!renderer),
      switchMap(renderer => renderer.rendered),
      withLatestFrom(this.editorAccessorService.rendererSubject$, this.selectedElements$),
      tap(() => {
        const elements = this.selectedElements.map(id => this.tree.find(id));
        const controls = this.controlsService.createDefaultControlsSet(elements);
        this.controlsService.renderControls(controls);
      }),
      takeUntil(this.destroy$),
    )
    .subscribe(([, renderer, elements]) => {
      const selectedElements = elements.map(e => e.id);
      const registryElements = renderer.registry.queryAll(() => true).map(el => el.element.id);
      const elementsFound = intersection(selectedElements, registryElements);

      if (elementsFound.length < selectedElements.length) {
        checkElements(elementsFound, this.apmService);
        this.store.dispatch(new PebSelectAction(elementsFound));
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      fromEvent(window, 'beforeunload').pipe(
        withLatestFrom(this.backgroundActivityService.hasActiveTasks$),
        tap(([event, hasTasks]) => {
          if (hasTasks) {
            event.returnValue = true;
          }
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }

    (window as any).pebEditor = this;
  }

  ngOnInit() {
    merge(
      this.trackActivePageIdInQuery(),
      this.initCommandsInvoker(),
      this.trackActivePageType(),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

    this.themeService.getLastThemeUpdate().pipe(
      takeUntil(this.destroy$),
    ).subscribe((value) => {
      this.changeLastSavingTime.emit(value);
    });

    this.themeService.getSavingStatus().pipe(
      takeUntil(this.destroy$),
    ).subscribe((value) => {
      this.changeSavingStatus.emit(value);
    });
  }

  ngAfterViewInit() {
    let timeout: number;
    this.selectedElements$.pipe(
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      filter(elements => elements.length > 1 && !elements.every(elm => elm.type === PebElementType.Shape)),
      tap(() => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
          this.openSidebar(PebGenericSidebarComponent);
        });
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.initScreensForMobileTablet();
    this.initUI();
    this.renderer$.pipe(
      filter(Boolean),
      tap((renderer: PebRenderer) => {
        this.initRenderer(renderer);
      }),
      switchMap(() => this.initPlugins()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.contextManager.clearCache();
    this.editorStore.reset();
    this.state.reset();
    this.store.dispatch(new PebDeselectAllAction());
  }

  get queryParams() {
    return (this.activeRoute.queryParams as any).value;
  }

  initRenderer(renderer: PebRenderer): void {
    this.editorRenderer.setRenderer(renderer);
  }

  initScreensForMobileTablet() {
    if (!this.deviceService.isDesktop) {
      this.initScaleForMobileAndTablet();
    }
    this.initMobileSidebarState();
  }

  initUI() {
    const uiConfig = this.injector.get(EDITOR_CONFIG_UI);

    if (!uiConfig) {
      return;
    }

    const toolbarCmp = uiConfig.toolbar;
    if (toolbarCmp) {
      const toolbarFac = this.cfr.resolveComponentFactory(uiConfig.toolbar);
      const toolbarCmpRef = toolbarFac.create(this.injector) as ComponentRef<PebEditorAbstractToolbar>;
      // toolbarCmpRef.instance.loading = true;
      toolbarCmpRef.instance.cdr.detectChanges();
      merge(
        toolbarCmpRef.instance.execCommand.pipe(
          tap(command => this.commands$.next(command)),
        ),
      ).pipe(
        takeUntil(this.destroy$),
      ).subscribe();
      this.toolbarSlot.insert(toolbarCmpRef.hostView);
    }

    const navigationCmp = uiConfig.navigation;
    if (navigationCmp) {
      const navigationFac = this.cfr.resolveComponentFactory(uiConfig.navigation);
      const navigationCmpRef = navigationFac.create(this.injector) as ComponentRef<PebEditorAbstractNavigation>;
      const navigationInstance = navigationCmpRef.instance;
      navigationInstance.cdr.detectChanges();

      merge(
        combineLatest([
          this.pages$,
          this.state.pagesView$,
        ]).pipe(
          tap(([pages, pagesView]) => {
            navigationInstance.pages = pages.filter(page => page.type === pagesView);
            navigationInstance.cdr.detectChanges();
          }),
        ),
        this.activePageSnapshot$.pipe(
          tap((activePageSnapshot) => {
            navigationInstance.activePageSnapshot = {
              ...activePageSnapshot,
            };
            navigationCmpRef.instance.loading = !activePageSnapshot;
            navigationInstance.cdr.detectChanges();
          }),
        ),
        navigationInstance.execCommand.pipe(
          tap(type => this.commands$.next(type)),
        ),
      ).pipe(
        takeUntil(this.destroy$),
      ).subscribe();

      this.leftSidebarSlot.insert(navigationCmpRef.hostView);
    }

  }

  initCommandsInvoker = () => {
    const onCommand$ = (commandName: string) => this.commands$.pipe(
      filter(command => command.type === commandName),
    );

    return merge(
      // logger
      this.commands$.pipe(
        tap(command => logCommands(...[command.type, command.params].filter(Boolean))),
      ),

      // handlers
      onCommand$('undo').pipe(
        filter(() => !this.state.textEditorActive),
        concatMap(() => this.editorStore.undoAction()),
      ),
      onCommand$('redo').pipe(
        filter(() => !this.state.textEditorActive),
        concatMap(() => this.editorStore.redoAction()),
      ),
      onCommand$('activatePage').pipe(
        tap((command) => {
          this.onActivatePage(command.params);
        }),
      ),
      onCommand$('createPage').pipe(
        tap((command) => {
          this.onCreatePage(command.params);
        }),
      ),
      onCommand$('pastePage').pipe(
        tap((command) => {
          this.onPastePage(command.params);
        }),
      ),
      onCommand$('duplicatePage').pipe(
        tap((command) => {
          this.onDuplicatePage(command.params);
        }),
      ),
      onCommand$('deletePage').pipe(
        tap((command) => {
          this.onDeletePage(command.params);
        }),
      ),
      onCommand$('changeElementVisible').pipe(
        tap((command) => {
          this.onChangeElementVisible(command.params);
        }),
      ),
      onCommand$('reorderPages').pipe(
        tap((command) => {
          this.onReorderPages(command.params);
        }),
      ),
      onCommand$('openLanguagesDialog').pipe(
        tap(() => {
          this.dialog.open(PebEditorLanguagesDialog, {
            panelClass: ['languages-dialog', this.theming],
            disableClose: true,
          });
        }),
      ),
      onCommand$('openScriptsDialog').pipe(
        switchMap(() => this.scriptsDialogService.openScriptsDialog().afterClosed()),
      ),
      onCommand$('openShapesDialog').pipe(
        switchMap(() => this.openShapes()),
      ),
      onCommand$('openPublishDialogUnderElement').pipe(
        switchMap(({ params = null }: PebEditorCommand<{ element: HTMLElement, appId: string }>) => {
          return this.openPublish(params?.element, params?.appId).pipe(
            tap(() => this.messageBus.emit('editor.publish-dialog.closed', undefined)),
          );
        }),
      ),
      onCommand$('publish').pipe(
        switchMap(() => this.editorWs.publish({ themeId: this.editorStore.theme.id })),
        tap(() => {
          const config: SnackbarConfig = {
            content: 'Publishing',
            pending: true,
            duration: 50000,
          };
          this.snackbarService.toggle(true, config);
        }),
        switchMap(id => this.editorWs.on(PebEditorWsEvents.BuilderThemePublished).pipe(
          filter(message => message.id === id && message.data?.status === 'client-synced'),
          take(1),
          tap(() => {
            this.editorStore.setLastPublishedActionId();
            this.snackbarService.hide();
            const config: SnackbarConfig = {
              boldContent: 'Success! ',
              content: 'Your theme has been published.',
              duration: 5000,
              useShowButton: true,
              iconId: 'icon-commerceos-success',
              iconSize: 24,
              iconColor: '#00B640',
              showButtonAction: () => this.messageBus.emit('editor.application.open', null),
            };
            this.snackbarService.toggle(true, config);
          }),
        )),
      ),
    ).pipe(
      catchError((err) => {
        console.log('Command handler error: ', err);

        return of(null);
      }),
      finalize(() => {
        console.log('Command handler completed');
      }),
    );
  }

  trackActivePageIdInQuery() {
    return combineLatest([
      this.editorStore.snapshot$,
      this.editorStore.activePageId$,
    ]).pipe(
      filter(([snapshot, activePageId]) => !!snapshot && !!activePageId),
      tap(([snapshot, activePageId]) => {
        const activatePage = find(snapshot.pages, page => page.variant === PebPageVariant.Front);
        const pageId = activatePage && activatePage.id !== activePageId ? activePageId : null;

        this.router.navigate(['./'], {
          relativeTo: this.activeRoute,
          queryParamsHandling: 'merge',
          queryParams: { pageId },
        }).then();
      }),
    );
  }

  initPlugins() {
    const pluginInstances = this.injector.get(PEB_EDITOR_PLUGINS).map(
      pluginCtor => this.injector.get(pluginCtor),
    );

    const global = pluginInstances
      .filter(pluginInst => isFunction(pluginInst.afterGlobalInit));

    let retryPlugin = true;
    const pluginsGlobalInit$ = merge(
      ...global.map(pluginInst => pluginInst.afterGlobalInit().pipe(
        retryWhen(errors => errors.pipe(
          map((err, i) => {
            console.error(err, i);
            if (!retryPlugin) {
              throw new Error();
            }
            this.state.reset();
            this.store.dispatch(new PebDeselectAllAction());
            retryPlugin = false;

            return true;
          }),
        )),
        tap(() => retryPlugin = true),
      )),
    );

    const pluginsPageInit$ = combineLatest([
      this.renderer$.pipe(filter(r => Boolean(r))),
      this.editorStore.activePageId$.pipe(distinctUntilChanged()),
    ]).pipe(
      switchMapTo(merge(
        ...pluginInstances
          .filter(pluginInst => isFunction(pluginInst.afterPageInit))
          .map(pluginInst => pluginInst.afterPageInit().pipe(
            retryWhen(errors => errors.pipe(
              map((err, i) => {
                console.error(err, i);
                if (!retryPlugin) {
                  throw new Error();
                }
                this.state.reset();
                this.store.dispatch(new PebDeselectAllAction());
                retryPlugin = false;

                return true;
              }),
            )),
            tap(() => retryPlugin = true),
          )),
      )),
      takeUntil(
        combineLatest([
          this.editorStore.snapshot$,
          this.editorStore.activePageId$,
        ]).pipe(
          filter(([snapshot, activePageId]) =>
            !snapshot || !activePageId,
          ),
        ),
      ),
    );

    return merge(
      pluginsGlobalInit$,
      pluginsPageInit$,
    ).pipe(
      finalize(() => console.log('finalizer')),
      takeUntil(this.destroy$),
    );
  }

  initMobileSidebarState() {
    if (!this.deviceService.isMobile || this.deviceService.landscape) {
      return;
    }
    this.state.sidebarsActivity = {
      ...this.state.sidebarsActivity,
      [EditorSidebarTypes.Navigator]: false,
      [EditorSidebarTypes.Inspector]: false,
      [EditorSidebarTypes.Layers]: false,
    };
  }

  initScaleForMobileAndTablet() {
    combineLatest([
      fromResizeObserver(this.contentContainer.nativeElement),
      this.screen$,
    ]).pipe(
      map(([contentContainerRect, screen]) =>
        contentContainerRect.width / pebScreenDocumentWidthList[screen]),
      tap((scaleValue: number) => {
        this.store.dispatch(new PebSetScaleAction(scaleValue));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  trackActivePageType() {
    return combineLatest([
      this.state.pagesView$.pipe(distinctUntilChanged()),
      this.editorStore.snapshot$.pipe(filter(v => Boolean(v))),
      this.editorStore.activePageId$.pipe(filter(v => Boolean(v))),
    ]).pipe(
      filter(([activePageType, snapshot, activePageId]) =>
        snapshot.pages[activePageId] && snapshot.pages[activePageId].type !== activePageType,
      ),
      tap(() => {
        this.store.dispatch(new PebDeselectAllAction());
      }),
      switchMap(([activePageType]) => {
        return this.editorStore.activateLastPageByView(activePageType);
      }),
    );
  }

  onActivatePage(page: PebThemePageInterface | PebThemeShortPageInterface) {
    this.store.dispatch(new PebDeselectAllAction());
    this.controlsService.renderControls([]);
    this.editorStore.activatePage(page.id).pipe(
      tap(() => {
        this.selectTab(this.rightSidebarTabs[0]);
        this.initMobileSidebarState();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }


  onCreatePage(input: { type, masterId, albumId, activatePage?, pageName? }) {
    this.store.dispatch(new PebDeselectAllAction());
    this.controlsService.renderControls([]);
    this.sidebarSlot.clear();

    const masterPage = this.editorStore.snapshot.pages.find(p => p.id === input.masterId);
    const name = input.pageName ? input.pageName : this.generatePageNameNumber(
      input.type === PebPageType.Master
        ? 'Master Page'
        : masterPage?.name
          ? `${masterPage.name}`
          : 'Page',
      this.editorStore.snapshot.pages.filter(p => p.type === input.type),
    );

    this.editorStore.createPage({
      name,
      variant: PebPageVariant.Default,
      type: input.type,
      masterId: input.masterId,
      activatePage: input.activatePage ?? true,
    }).pipe(
      switchMap(({ pageId, action }) => {
        const params = {
          action,
          themeId: this.editorStore.theme.id,
        };

        return from(this.editorWs.addAction(params)).pipe(
          map(id => ({ pageId, id })),
        );
      }),
      switchMap(({ pageId, id }) => this.editorWs.on(PebEditorWsEvents.AddAction).pipe(
        filter(message =>
          message.id === id &&
          message.data?.status === 'snapshot-updated' &&
          !!this.themeService.theme?.id &&
          !!this.envService.applicationId),
        tap(() => {
          if (input.type === PebPageType.Master && input.albumId) {
            this.editorApi.linkPageToAlbum(
              this.envService.applicationId,
              this.themeService.theme.id,
              pageId,
              input.albumId,
            );
          }
        }),
      )),
    ).toPromise();
  }

  onPastePage(page: PebThemeShortPageInterface| PebThemeShortPageInterface[]) {
    if (Array.isArray(page)) {
      this.editorStore.pastePages(page).subscribe();
    } else {
      const name = `${page.name}`;
      this.editorStore.pastePage({
        name,
        pageId: page.id,
        pageVariant: page.variant,
      });
    }
  }

  onDuplicatePage(page: PebThemeShortPageInterface| PebThemeShortPageInterface[]) {
    if (Array.isArray(page)) {
      this.editorStore.duplicatePages(page).subscribe();
    } else {
      this.editorStore.duplicatePage({
        name: page.name,
        pageId: page.id,
        pageVariant: page.variant,
      }).subscribe();
    }
  }

  onReorderPages(pageIds: string[]) {
    this.editorStore.reorderPages(pageIds).subscribe();
  }

  onDeletePage(page: any) {
    this.store.dispatch(new PebDeselectAllAction());
    this.controlsService.renderControls([]);
    this.sidebarSlot.clear();
    this.editorStore.deletePage(page, this.state.pagesView).subscribe();
  }

  getNewElementParent() {
    const abstractElements = this.selectedElements
      .map(elementId => this.tree.find(elementId))
      .filter(({ element }) => element.type !== PebElementType.Grid);

    if (abstractElements.length === 0) {
      const [document] = this.tree.all().filter(elm => elm.element.type === PebElementType.Document);
      const firstSection = document.children[0];
      abstractElements.push(this.tree.find(firstSection.element.id))
    }

    let parent = abstractElements[0];

    // it is necessary so as not to create a large amount of nesting inside the grid cell
    // only grid -> cell -> shape no more
    if (parent?.parent?.parent?.element.type === PebElementType.Grid) {
      return undefined;
    }
    if (parent?.element?.type === PebElementType.Text) {
      parent = parent.parent;
    }
    if (parent?.element?.type === PebElementType.Document) {
      parent = parent.children[0];
    }

    return parent.element;
  }

  openSidebar<T>(cmpClass: Type<T>): ComponentRef<T> {
    const prevSidebar = this.sidebarSlot.get(0);
    if (prevSidebar && !prevSidebar.destroyed) {
      prevSidebar.destroy();
    }

    this.sidebarSlot.clear();
    const sidebarFactory = this.cfr.resolveComponentFactory(cmpClass);
    const sidebarRef = sidebarFactory.create(this.injector);
    this.sidebarSlot.insert(sidebarRef.hostView);
    sidebarRef.changeDetectorRef.detectChanges();

    return sidebarRef;
  }

  openSidebarMotion<T>(cmpClass: Type<T>): ComponentRef<T> {
    const prevSidebar = this.rightSidebarMotionSlot.get(0);
    if (prevSidebar && !prevSidebar.destroyed) {
      prevSidebar.destroy();
    }

    this.rightSidebarMotionSlot.clear();
    const sidebarFactory = this.cfr.resolveComponentFactory(cmpClass);
    const sidebarRef = sidebarFactory.create(this.injector);
    this.rightSidebarMotionSlot.insert(sidebarRef.hostView);

    return sidebarRef;
  }

  openSidebarPage<T>(cmpClass: Type<T>): ComponentRef<T> {
    const prevSidebar = this.rightSidebarPageSlot.get(0);
    if (prevSidebar && !prevSidebar.destroyed) {
      prevSidebar.destroy();
    }

    this.rightSidebarPageSlot.clear();
    const sidebarFactory = this.cfr.resolveComponentFactory(cmpClass);
    const sidebarRef = sidebarFactory.create(this.injector);
    this.rightSidebarPageSlot.insert(sidebarRef.hostView);

    return sidebarRef;
  }

  openSidebarOptionList<T>(cmpClass: Type<T>): ComponentRef<T> {
    const prevSidebar = this.rightSidebarOptionListSlot.get(0);
    if (prevSidebar && !prevSidebar.destroyed) {
      prevSidebar.destroy();
    }

    this.rightSidebarOptionListSlot.clear();
    const sidebarFactory = this.cfr.resolveComponentFactory(cmpClass);
    const sidebarRef = sidebarFactory.create(this.injector);
    this.rightSidebarOptionListSlot.insert(sidebarRef.hostView);

    return sidebarRef;
  }

  openProductsDialog(selectedProducts: string[], isSubscription = false) {
    const tag = isSubscription ? PebIntegrationTag.Subscription : PebIntegrationTag.Products;
    const integration = this.integrationsStore.getIntegrationByTag(tag);
    const actionTag = isSubscription ? PebIntegrationActionTag.List : PebIntegrationActionTag.GetList;
    const action = this.integrationsStore.getFirstIntegrationActionByTags(integration.tag, actionTag);
    const collectionsAction = this.integrationsStore.getFirstIntegrationActionByTags(
      integration.tag,
      PebIntegrationActionTag.GetCollections,
    );

    const dialog = this.dialog.open(PebProductsComponent, {
      height: '82.3vh',
      maxWidth: '78.77vw',
      width: '78.77vw',
      panelClass: ['products-dialog', this.theming],
      data: {
        selectedProducts,
        productsIntegration: integration,
        productsIntegrationAction: action,
        productsCollectionIntegrationAction: collectionsAction,
      },
    });

    return dialog.beforeClosed();
  }

  openPublish(element: HTMLElement, appId: string): Observable<any> {
    const elementRect = element.getBoundingClientRect();
    const dialogRef = this.dialog.open(PebEditorPublishDialogComponent, {
      position: {
        top: `${elementRect.bottom + 10}px`,
        left: `${elementRect.left}px`,
      },
      hasBackdrop: true,
      backdropClass: 'publish-dialog__backdrop',
      panelClass: ['publish-dialog__panel', this.theming],
      data: { appId },
      maxWidth: '286px',
      width: '286px',
      disableClose: false,
      autoFocus: false,
    });

    return dialogRef.beforeClosed();
  }

  openShapes(): Observable<any> {
    const dialog = this.dialog.open(
      PebShapesComponent,
      {
        height: this.deviceService.isMobile ? '100%' : '82.3vh',
        maxWidth: this.deviceService.isMobile ? '100%' : '78.77vw',
        width: this.deviceService.isMobile ? '100%' : '78.77vw',
        panelClass: ['shapes-dialog', this.theming],
        data: {
          screen: this.screen,
          contextBuilder: this.editorAccessorService.editorComponent.contextManager,
        },
      },
    );

    return dialog.beforeClosed().pipe(
      take(1),
      filter(command => !!command),
      tap(command => {
        this.store.dispatch(new PebInsertAction(command.payload));
      }),
    );
  }

  openCategoriesDialog(selectedCategories: string[]): Observable<string[]> {
    const integration = this.integrationsStore.getIntegrationByTag(PebIntegrationTag.Products);
    const action = this.integrationsStore
      .getFirstIntegrationActionByTags(integration.tag, PebIntegrationActionTag.GetCategoriesByProducts);

    const dialog = this.dialog.open(PebProductCategoriesComponent, {
      height: '82.3vh',
      maxWidth: '78.77vw',
      width: '78.77vw',
      panelClass: ['products-categories-dialog', this.theming],
      data: { action, integration, selectedCategories },
    });

    return dialog.beforeClosed();
  }

  insertToSlot<T>(componentClass: Type<T>, slotType: PebEditorSlot): ComponentRef<T> {
    const componentFactory = this.cfr.resolveComponentFactory(componentClass);
    const componentRef = componentFactory.create(this.injector);

    const slot = slotType === PebEditorSlot.sidebar
      ? this.sidebarSlot
      : slotType === PebEditorSlot.contentContainer
        ? this.contentContainerSlot
        : slotType === PebEditorSlot.sidebarDetail
          ? this.rightSidebarDetailSlot
          : slotType === PebEditorSlot.sidebarOptionList
          ? this.rightSidebarOptionListSlot
            : null;

    if (slotType === PebEditorSlot.ngContentContainer) {
      this.contentContainerSlot.insert(componentRef.hostView);

      return componentRef;
    }

    if (!slot) {
      return null;
    }

    if (slotType === PebEditorSlot.contentContainer) {
      this.contentContainerInsert$.next(componentRef);

      return componentRef;
    }

    if (slotType === PebEditorSlot.sidebar) {
      this.rightSidebarDetailSlot.clear();
      this.rightSidebarOptionListSlot.clear();

      this.detail = null;
      this.optionList = null;

      slot.clear();

      this.selectTab(this.rightSidebarTabs[0]);
    }

    if (slotType === PebEditorSlot.sidebarDetail) {
      const prevSidebar = this.rightSidebarDetailSlot.get(0);
      if (prevSidebar && !prevSidebar.destroyed) {
        prevSidebar.destroy();
      }
      this.rightSidebarOptionListSlot.clear();

      this.optionList = null;

      slot.clear();
    }

    if (slotType === PebEditorSlot.sidebarOptionList) {
      slot.clear();
    }

    slot.insert(componentRef.hostView);

    this.isDetail = slotType === PebEditorSlot.sidebarDetail;
    this.isOptionList = slotType === PebEditorSlot.sidebarOptionList;

    return componentRef;
  }

  clearSlot(slotType: PebEditorSlot): void {
    if (slotType === PebEditorSlot.sidebarOptionList) {
      this.rightSidebarOptionListSlot.clear();
      this.isDetail = true;
      this.isOptionList = false;
    }
  }

  selectTab(activeTab) {
    this.rightSidebarTabs.forEach(tab => tab.active = false);

    activeTab.active = true;
  }

  getActiveTab() {
    return this.rightSidebarTabs.find(tab => tab.active);
  }

  backTo(direct: string) {
    if (direct === 'main') {
      this.rightSidebarDetailSlot.clear();
      this.isDetail = false;
      this.detail = null;
    }

    if (direct === 'detail') {
      this.rightSidebarOptionListSlot.clear();
      this.isDetail = this.detail !== null;
    }

    this.isOptionList = false;
    this.optionList = null;
  }


  private onChangeElementVisible({ element, stylesheet, visible }) {
    const clonedElement = cloneDeep(element);

    const createElement = (element) => {
      const elViewInjector = this.renderer.createElementInjector();
      element.styles = { ...stylesheet[element.id], display: null };

      const cmpRef = this.renderer.createElement(element, elViewInjector);
      const parent: PebAbstractElement = this.tree.find(element.parent.id);

      parent.children.splice(element.index, 0, cmpRef.instance);

      parent.childrenSlot.insert(cmpRef.hostView);
      cmpRef.instance.viewRef = cmpRef.hostView;
      this.tree.insert(cmpRef.instance);

      element.children.forEach((childDef) => {
        childDef.parent.id = element.id;
        createElement(childDef);
      });

      cmpRef.changeDetectorRef.detectChanges();
    };

    const removeBranch = (element) => {
      const branch = this.tree.find(element.id);
      if (branch) {
        branch.styles.display = 'none';

        branch.parent.children = branch.parent.children.filter(child => child.element.id !== branch.element.id);

        if (!!branch.children.length) {
          branch.children.forEach((abstractElement) => {
            removeBranch(abstractElement.element);
          });
        }

        branch.getRendererComponentRegistry(branch.element.id).destroy();
        this.tree.remove(branch);
      }
    }

    if (visible) {
      createElement(clonedElement);
    } else {
      removeBranch(clonedElement);
    }

    const styles = { [clonedElement.id]: { display: visible ? null : 'none' } };
    this.editorStore.updateStyles(this.screen, styles);
    this.controlsService.renderControls([]);
  }

  private generatePageNameNumber(name: string, pages: PebThemeShortPageInterface[]): string {
    const originalPageNumberMatches = name.match(/\d+/g);
    const originalPageNumber = originalPageNumberMatches?.length ? parseInt(originalPageNumberMatches[0], 10) : 0;

    return pages.reduce(
      (acc, page) => {
        if (page.name.replace(/\s|[0-9]/g, '') !== name.replace(/\s|[0-9]/g, '')) {
          return acc;
        }

        const prevPageNumberMatches = acc.match(/\d+/g);
        const currPageNumberMatches = page.name.match(/\d+/g);
        const prevPageNumber = prevPageNumberMatches?.length ? parseInt(prevPageNumberMatches[0], 10) : 0;
        const currPageNumber = currPageNumberMatches?.length ? parseInt(currPageNumberMatches[0], 10) : 0;

        return `${name.replace(` ${originalPageNumber}`, '')} ${Math.max(prevPageNumber, currPageNumber + 1)}`;
      },
      name,
    );
  }
}
