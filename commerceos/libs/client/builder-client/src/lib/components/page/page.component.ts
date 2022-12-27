import { BreakpointObserver } from '@angular/cdk/layout';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT, isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { Store } from '@ngxs/store';
import isEqual from 'lodash/isEqual';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  forkJoin,
  from,
  fromEvent,
  iif,
  merge,
  Observable,
  of,
  OperatorFunction,
  ReplaySubject,
  Subject,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  first,
  map,
  mapTo,
  mergeMap,
  pairwise,
  retry,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { PebContextService } from '@pe/builder-context';
import {
  applyRecursive,
  CONTEXT_SERVICES,
  ContextService,
  generateGrid,
  PebContextSchema,
  PebElementContextState,
  PebElementDef,
  PebElementType,
  PebFilterConditionType,
  pebFontFamilies,
  pebGenerateId,
  PebIntegration,
  PebIntegrationAction,
  PebIntegrationFieldMetaType,
  PebIntegrationSelectLink,
  PebIntegrationTag,
  PebInteractionType,
  PebInteractionWithPayload,
  PebLanguage,
  PebLanguagesData,
  PebLink,
  PebPageVariant,
  PebScreen,
  pebScreenDocumentWidthList,
  PebStylesheet,
  PebTemplate,
} from '@pe/builder-core';
import {
  fromResizeObserver,
  PebAbstractElement,
  PebEditorOptionsAction,
  PebRenderer,
  PebRTree,
  PebScreenAction,
} from '@pe/builder-renderer';
import { PebEditorAccessorService } from '@pe/builder-services';
import { APP_TYPE, AppType, EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { DEFAULT_LOCALE, TranslateService, TranslationLoaderService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { PebClientCheckoutCartService, PebClientCheckoutService, PebClientProductDetailsService } from '../../modules';
import {
  CompanyService,
  PebClientApiService,
  PebClientAuthService,
  PebClientCachedService,
  PebClientContextBuilderService,
  PebClientSeoService,
  PebClientStateService,
  PebClientStoreService,
  ProductsService,
} from '../../services';
import { getRouteData, PebClientPasswordError, RouteData } from '../../shared/utils';
import { PebClientPageOverlayComponent } from '../page-overlay/page-overlay.component';

interface PageInteraction {
  interaction: PebInteractionWithPayload;
  componentRef?: ComponentRef<any>;
}

@Component({
  selector: 'peb-client-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PebClientPageComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<boolean>();
  private readonly renderer$ = new BehaviorSubject<PebRenderer>(null);

  get renderer() {
    return this.renderer$.getValue();
  }

  @ViewChild('renderer', { read: PebRenderer }) set renderer(renderer: PebRenderer) {
    this.renderer$.next(renderer);
  }

  private overlayRefs: { overlayRef: OverlayRef, componentRef: ComponentRef<PebClientPageOverlayComponent> }[] = [];

  private readonly screenSubject = new BehaviorSubject(null);
  public screen$: Observable<PebScreen>;

  get screen() {
    return this.screenSubject.getValue();
  }

  get isProductLoading(): boolean {
    return this.stateService.state['@pos-catalog'].data.products
      .some(product => product.state === PebElementContextState.Loading);
  }

  private windowResize$ = isPlatformBrowser(this.platformId)
    ? fromEvent(window, 'resize').pipe(startWith(null))
    : of(null);

  public scale$: Observable<number>;

  public snapshot$: Observable<{ template: PebTemplate; stylesheet: PebStylesheet; context: PebContextSchema; }>;

  private readonly onInteractionSubject = new Subject<PageInteraction>();
  readonly onInteraction$ = this.onInteractionSubject.asObservable();

  readonly defaultLanguage = this.theme.data?.defaultLanguage ?? PebLanguage.English;
  readonly language$ = new BehaviorSubject<PebLanguage>(this.defaultLanguage);

  private pageIdKey;

  public readonly pageNotFound$ = new Subject<boolean>();
  public readonly pagePassword$ = new BehaviorSubject<string>(null);
  private readonly document: Document;

  private readonly refresh$ = new ReplaySubject<void>();

  constructor(
    // Angular
    private activatedRoute: ActivatedRoute,
    private apmService: ApmService,
    private breakpointObserver: BreakpointObserver,
    private elementRef: ElementRef,
    private overlay: Overlay,
    private renderer2: Renderer2,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: string,
    @Inject(ViewContainerRef) viewContainerRef,

    // Pe
    private apiService: PebClientApiService,
    private authService: PebClientAuthService,
    private cartService: PebClientCheckoutCartService,
    private cachedService: PebClientCachedService,
    private checkoutService: PebClientCheckoutService,
    private clientStore: PebClientStoreService,
    private contextBuilder: PebClientContextBuilderService,
    private editorAccessorService: PebEditorAccessorService,
    private productDetailsService: PebClientProductDetailsService,
    private seo: PebClientSeoService,
    private snackbarService: SnackbarService,
    public stateService: PebClientStateService,
    private translateService: TranslateService,
    private translationLoaderService: TranslationLoaderService,
    private tree: PebRTree<PebAbstractElement>,
    private store: Store,
    @Inject('APP_NAME') private appName: string,
    @Inject(APP_TYPE) private appType: AppType,
    @Inject(CONTEXT_SERVICES[ContextService.Company]) private companyService: CompanyService,
    @Inject(CONTEXT_SERVICES[ContextService.Integrations]) private integrationService: PebContextService,
    @Inject(CONTEXT_SERVICES[ContextService.Products]) private productsService: ProductsService,
    @Inject(DOCUMENT) _document: any,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    @Optional() @Inject('USER_AGENT_SCREEN') private userAgentScreen: PebScreen,
  ) {
    this.document = _document as Document;
    this.productsService.destroyed$ = this.destroyed$.asObservable();

    this.contextBuilder.buildSchema(this.theme.context).pipe(
      tap(context => this.stateService.patch(context)),
      takeUntil(this.destroyed$),
    ).subscribe();

    if (isPlatformBrowser(this.platformId) && [AppType.Mail, AppType.Site].every(at => this.appType !== at)) {
      this.checkoutService.addCheckoutComponent(viewContainerRef).subscribe();
    }

    this.refresh$.next();
  }

  get app(): any {
    return this.clientStore.app;
  }

  private get appId(): string {
    return this.app?._id ?? this.app?.id;
  }

  get theme(): any {
    return this.clientStore.theme;
  }

  ngOnInit(): void {
    this.renderer$.pipe(
      filter(renderer => !!renderer),
      tap((renderer) => {
        this.editorAccessorService.renderer = renderer;
      }),
      switchMap(() =>
        this.renderer.rendered.pipe(
          tap(() => {
            /**
             * Workaround:
             * Sections children elements not getting updated when changing products directly on product page,
             * and generateGrid updates values from parent to child - so new products elements don't have their styles updated
             * as they're not children of section element.
             */
            const elements = this.document.querySelectorAll('peb-element-section');
            elements.forEach(el => {
              const id = el.getAttribute('peb-element-id');
              const elRef = this.renderer.registry.get(id);
              if (elRef) {
                elRef.element.children = elRef.children.map(child => ({
                  ...child.element,
                  styles: child.styles,
                }));
                generateGrid(elRef.element, elRef.styles);
              }
            });
          }),
          takeUntil(this.destroyed$),
        ),
      ),
      takeUntil(this.destroyed$),
    ).subscribe();

    const fromResizeObserver$ = fromResizeObserver(this.elementRef.nativeElement.parentElement);
    const parentResize$: Observable<any> = isPlatformBrowser(this.platformId)
      ? fromEvent(window, 'resize').pipe(debounceTime(100))
      : fromResizeObserver$;

    this.screen$ = parentResize$.pipe(
      startWith(null),
      filter(() => !!this.elementRef.nativeElement.parentElement),
      map(() => {
        const screens = Object.entries(pebScreenDocumentWidthList).sort((a, b) => b[1] - a[1]);
        const width = this.elementRef.nativeElement.parentElement.clientWidth || 0;
        let i = 0;
        while (i < screens.length - 1 && width < screens[i][1]) {
          i++;
        }

        if (width) {
          if (width < pebScreenDocumentWidthList[PebScreen.Tablet]) {
            this.store.dispatch(new PebScreenAction(PebScreen.Mobile));

            return PebScreen.Mobile;
          } else if (width < pebScreenDocumentWidthList[PebScreen.Desktop]) {
            this.store.dispatch(new PebScreenAction(PebScreen.Tablet));

            return PebScreen.Tablet;
          }
        } else if (this.userAgentScreen) {
          return this.userAgentScreen;
        }

        this.store.dispatch(new PebScreenAction(PebScreen.Desktop));

        return PebScreen.Desktop;
      }),
      distinctUntilChanged(),
      takeUntil(this.destroyed$),
    );

    this.scale$ = combineLatest([
      this.screen$,
      parentResize$.pipe(startWith(null)),
    ]).pipe(
      filter(() => !!this.elementRef.nativeElement.parentElement),
      map(([screen]) => screen === PebScreen.Desktop
        ? 1
        : (this.elementRef.nativeElement.parentElement?.clientWidth ?? 0) / pebScreenDocumentWidthList[screen]
      ),
      distinctUntilChanged(),
      takeUntil(this.destroyed$),
    );
    this.screen$.subscribe(this.screenSubject);

    this.cartService.loadData();

    this.language$.pipe(
      map(language => PebLanguagesData[language]?.shortName),
      filter(Boolean),
      mergeMap((locale: string) => this.translationLoaderService.loadTranslations('builder-client', locale)),
      takeUntil(this.destroyed$),
    ).subscribe();

    const routeDataSubject$ = new ReplaySubject(2);
    routeDataSubject$.next(null);

    const routeData$: Observable<RouteData> = combineLatest([
      this.activatedRoute.url,
      this.stateService.categories$,
      this.refresh$,
    ]).pipe(
      map(([url, categories]) => {
        const path = `/${url.map(u => u.path).join('/')}`;

        return { path, categories };
      }),
      filter(({ path }) => !path.includes('favicon')),
      map(({ path, categories }) => {
        return getRouteData(path, this.theme, categories);
      })
    ) as any;

    const getProductBySlug = (slug: string) => {
      // TODO: Figure out why Andrei used getProductBySlug
      return this.productsService.getProductBySlug(slug).pipe(
        map(({ result }) => {
          result.variants = result.variants.map(variant =>
            variant.options.reduce((acc, option) => {
                acc.title = acc.title ? `${acc.title}; ${option.value}` : `${option.value}`;

                return acc;
              },
              { ...variant },
            ),
          );

          return result;
        }),
      );
    };

    const openSnackbar = (snackbars: Array<{ element: PebElementDef, screen: PebScreen, styles: PebStylesheet }>) => {
      const { children, stylesheets } = snackbars.reduce(
        (acc, snackbar) => {
          acc.children.push(snackbar.element);
          Object.assign(acc.stylesheets[snackbar.screen], {
            ...snackbar.styles,
          });

          return acc;
        },
        { children: [], stylesheets: Object.values(PebScreen).reduce((accS, s) => ({ ...accS, [s]: {} }), {}) },
      );
      const template: PebElementDef = {
        id: pebGenerateId(),
        type: PebElementType.Document,
        children: [{
          id: pebGenerateId(),
          type: PebElementType.Section,
          children,
        }],
      };

      const overlayRef = this.overlay.create({
        width: '100vw',
        hasBackdrop: false,
      });
      const portal = new ComponentPortal(PebClientPageOverlayComponent);
      const cmp = overlayRef.attach(portal);
      Object.assign(cmp.instance, {
        snapshot: {
          template,
          stylesheets,
          context: {
            ...this.stateService.state,
          },
        },
        screen$: this.screen$,
        language$: this.language$,
        scale$: this.scale$,
        defaultLanguage: this.defaultLanguage,
        onInteraction: this.onInteraction.bind(this),
      });

      return timer(1500).pipe(
        switchMap(() => this.detachOverlay({ overlayRef, componentRef: cmp })),
      ).toPromise();
    };

    const navigateInternalSpecialOverlay = (variant: PebPageVariant, value: any): OperatorFunction<any, any> => {
      return source$ => {
        let cmp: ComponentRef<any>;

        return source$.pipe(
          switchMap(data => this.snapshot$.pipe(mapTo(data))),
          switchMap(async (data) => {
            if (data?.template) {
              data.template = await applyRecursive(data, data.template, this.env);
            }

            return data;
          }),
          switchMap(data => variant === PebPageVariant.Product
            ? value !== null
              ? getProductBySlug(value).pipe(map(product => ({ data, product })))
              : throwError('Product ID missing')
            : of({ data, product: null })),
          switchMap(({ data, product = null }) => !data
            ? EMPTY
            : this.contextBuilder.buildSchema(data.context).pipe(
                map(pageContext => ({
                  template: data.template,
                  stylesheets: data.stylesheets,
                  context: {
                    ...this.stateService.state,
                    ...pageContext,
                    '@products-detail': {
                      state: !!product ? PebElementContextState.Ready : PebElementContextState.Empty,
                      data: product,
                    },
                  },
                })),
              )),
          tap(snapshot => {
            const clientRect = this.elementRef.nativeElement.parentElement.getBoundingClientRect();
            const overlayRef = this.overlay.create({
              width: `${clientRect.width}px`,
              height: `${clientRect.height}px`,
              hasBackdrop: false,
              panelClass: 'page-overlay-panel',
              positionStrategy: this.overlay.position()
                .flexibleConnectedTo(this.elementRef.nativeElement.parentElement)
                .withPositions([{
                  overlayX: 'center',
                  overlayY: 'top',
                  originX: 'center',
                  originY: 'top',
                }]),
            });
            if (!cmp) {
              const portal = new ComponentPortal(PebClientPageOverlayComponent);
              cmp = overlayRef.attach(portal);
              Object.assign(cmp.instance, {
                snapshot,
                screen$: this.screen$,
                language$: this.language$,
                scale$: this.scale$,
                defaultLanguage: this.defaultLanguage,
                onInteraction: this.onInteraction.bind(this),
              });
              this.overlayRefs.push({ overlayRef, componentRef: cmp });
              this.elementRef.nativeElement.parentElement.style.overflow = 'hidden';
              parentResize$.pipe(
                tap(() => {
                  const rect = this.elementRef.nativeElement.parentElement.getBoundingClientRect();
                  overlayRef.updateSize({
                    width: `${rect.width}px`,
                    height: `${rect.height}px`,
                  });
                  overlayRef.updatePositionStrategy(this.overlay.position()
                    .flexibleConnectedTo(this.elementRef.nativeElement.parentElement)
                    .withPositions([{
                      overlayX: 'center',
                      overlayY: 'top',
                      originX: 'center',
                      originY: 'top',
                    }]));
                }),
                takeUntil(cmp.instance.destroyed$),
                finalize(() => {
                  if (!this.overlayRefs.length) {
                    this.elementRef.nativeElement.parentElement.style.overflow = 'auto';
                    this.elementRef.nativeElement.parentElement.style.height = null;
                  }
                }),
              ).subscribe();
            } else {
              Object.assign(cmp.instance, {
                snapshot,
              });
              cmp.changeDetectorRef.detectChanges();
            }
          }),
        );
      };
    };

    const pageData$ = routeData$.pipe(
      switchMap((routeData: RouteData) => {
        const screen = this.screen;
        const password = this.authService.pagePassword;

        return this.apiService
          .getAppSourcePage(
            this.appId,
            routeData.pageId,
            !routeData.pageId ? routeData.pageVariant : undefined,
            screen,
            password,
          ).pipe(
            catchError(error => {
              if (error.status === 403) {
                const pageVariant = this.getPasswordVariant(error?.error?.message);

                return pageVariant === 'other'
                  ? throwError(new PebClientPasswordError(error?.error?.message))
                  : this.apiService
                      .getAppSourcePage(this.appId, undefined, pageVariant, screen)
                      .pipe(catchError(() => throwError(new PebClientPasswordError(error?.error?.message))));
              }

              return throwError(error);
            }),
            switchMap(data => {
              routeDataSubject$.next({
                ...routeData,
                variant: data.variant,
              });
              if (data.variant === PebPageVariant.Product && isPlatformBrowser(this.platformId)) {
                const productSlug = this.activatedRoute.snapshot.url?.[1]?.path;

                return productSlug !== undefined
                  ? getProductBySlug(productSlug)
                      .pipe(map(product => {
                        if (!product?.id) {
                          throw new Error('no product');
                        }

                        return { data, product };
                      }))
                  : throwError('Product ID missing');
              }

              return of({ data, product: null, password: null });
            }),
            switchMap(({ data, product }) => {
              this.seo.handlePageData(data);
              if (isPlatformBrowser(this.platformId)) {
                const screens$ = Object.values(PebScreen).reduce(
                  (acc: { [s: string]: Observable<PebStylesheet> }, s) => {
                    if (s !== screen) {
                      acc[s] = this.apiService.getAppSourcePageScreenStylesheet(this.appId, data?.id, s);
                    }

                    return acc;
                  },
                  {},
                );

                return forkJoin(screens$).pipe(
                  map((stylesheets: { [s: string]: PebStylesheet }) => {
                    data.stylesheets = {
                      ...data.stylesheets,
                      ...stylesheets,
                    };

                    return { data, product, password: null };
                  }),
                  takeUntil(this.destroyed$),
                );
              }

            return of({ data, product, password: null });
          }),
          catchError((err) => {
            if (err instanceof PebClientPasswordError) {
              const pwd = this.getPasswordVariant(err.message);

              return of({ data: null, product: null, password: pwd });
            }
            console.error(err);

              return this.apiService.getAppSourcePage(this.appId, null, '404').pipe(
                map(data => ({ data, product: null, password: null })),
                catchError(() => of({ data: null, product: null, password: null })),
              );
            }),
          );
      }),
      switchMap(async (value) => {
        const page = value.data;
        if (page?.template) {
          page.template = await applyRecursive(page, page.template, this.env);
          value.data = page;
        }

        return value;
      }),
      shareReplay(1),
    );

    combineLatest([pageData$, this.screen$, this.language$]).pipe(
      tap(([pageData]) => {
        this.removeLinks();
        if (pageData.data) {
          this.loadFonts(pageData.data);
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    pageData$.pipe(
      tap(({ product }) => {
        const state = {
          '@products-detail-variants': {
            state: PebElementContextState.Empty,
            data: null,
          },
        };

        if (product !== null && isPlatformBrowser(this.platformId)) {
          state['@products-detail'] = {
            state: PebElementContextState.Ready,
            data: product,
          };
        }

        this.stateService.patch(state);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    routeData$.pipe(
      filter(() => isPlatformBrowser(this.platformId)),
      switchMap((routeData: RouteData) => this.activatedRoute.queryParams.pipe(
        withLatestFrom(this.stateService.state$),
        map(([queryParams, state]) => {
          const { url } = this.activatedRoute.snapshot;
          const categoryName = routeData.pageVariant === PebPageVariant.Category ? url[0].path : '';
          let order = [];
          try {
            order = queryParams['@order'] ? JSON.parse(queryParams['@order']) : [];
          } catch (e) {
          }

          const data = {
            '@product-sort': {
              ...state['@product-sort'],
              data: order,
            },
            '@product-filters': {
              ...state['@product-filters'],
              data: [
                ...(categoryName ? [{
                  field: 'categories.slug',
                  fieldCondition: PebFilterConditionType.Contains,
                  value: categoryName,
                }] : []),
                ...Object.entries(queryParams).reduce(
                  (acc, [field, value]) => {
                    if (field !== '@order') {
                      const parts = field.split('.');
                      if (parts[0] === 'attribute') {
                        acc.push({
                          field,
                          fieldCondition: PebFilterConditionType.And,
                          value: [
                            { field: 'attribute.name', fieldCondition: PebFilterConditionType.Contains, value: field },
                            { field: 'attribute.value', fieldCondition: PebFilterConditionType.In, value },
                          ],
                        });
                      }
                      acc.push({
                        field,
                        value,
                        fieldCondition: PebFilterConditionType.In,
                      });
                    }

                    return acc;
                  },
                  [],
                ),
              ],
            },
          };

          this.stateService.patch(data);
        }),
      )),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.snapshot$ = combineLatest([
      this.stateService.state$.pipe(
        distinctUntilChanged(isEqual),
        tap((state) => {
          if (this.editorAccessorService?.renderer?.context) {
            this.editorAccessorService.renderer.context = {
              ...this.editorAccessorService.renderer.context,
              ...state,
            }
          };
        })
      ),
      pageData$.pipe(
        concatMap(({ data, password = null }) => {
          if (data && !password) {
            return this.contextBuilder.buildSchema(data.context).pipe(
              map(pageContext => ({ data, pageContext, password })),
              catchError((err) => {
                console.error(err);
                this.apmService.apm.captureError(err);

                return of({ data, pageContext: {}, password });
              }),
            );
          }

          return of({ data: null, pageContext: null, password });
        }),
      ),
      this.screen$,
    ]).pipe(
      map(([state, pageData, screen]) => ({ state, pageData, screen })),
      startWith(null),
      pairwise(),
      filter(([prev, curr]) => {
        return prev?.pageData?.data?.id !== curr.pageData?.data?.id || prev?.screen !== curr.screen
      }),
      map(([prev, curr]) => {
        const { state, pageData, screen } = curr;
        this.pagePassword$.next(pageData.password);
        if (pageData.data && !pageData.password) {
          const data = pageData.data;
          const pageContext = pageData.pageContext;
          this.pageNotFound$.next(false);

          return {
            template: data.template,
            stylesheet: data.stylesheets[screen],
            context: { ...state, ...pageContext },
          };
        }

        if (pageData.password) {
          return null;
        }

        this.pageNotFound$.next(true);

        return null;
      }),
      catchError((err) => {
        if (err instanceof PebClientPasswordError) {
          this.pagePassword$.next(this.getPasswordVariant(err.message));

          return of(null);
        }

        return throwError(err);
      }),
    )

    // this.snapshot$ = this.cachedService.getCachedObservable(snapshot$, this.pageIdKey);
    this.snapshot$.pipe(
      switchMap(() => routeDataSubject$.pipe(
        map((routeData: RouteData) => routeData?.pageVariant ?? null),
        pairwise(),
        first(),
        filter(([prevVariant, currentVariant]) =>
          isPlatformBrowser(this.platformId) &&
          (
            currentVariant === PebPageVariant.Default ||
            (prevVariant !== PebPageVariant.Category || currentVariant !== PebPageVariant.Category)
          ),
        ),
        tap(() => window.scroll(0, 0)),
      )),
      takeUntil(this.destroyed$),
    ).subscribe();

    merge(
      this.filterInteraction(PebInteractionType.ChangeLanguage).pipe(
        tap(({ interaction: { payload } }) => this.language$.next(payload)),
      ),

      this.filterInteraction(PebInteractionType.OverlayOpenPage).pipe(
        switchMap(({ interaction }) => {
          const routeId = typeof interaction.payload === 'string'
            ? interaction.payload
            : interaction.payload?.url;
          const route = this.theme.routing?.find(r => r.routeId === routeId);
          const pageId = route?.pageId;

          return this.apiService.getAppSourcePage(this.appId, pageId, null).pipe(
            switchMap(async (page) => {
              if (page?.template) {
                page.template = await applyRecursive(page, page.template, this.env);
              }

              return page;
            }),
            take(1),
            switchMap(data => {
              if (data?.variant === PebPageVariant.Product && interaction?.context?.slug) {
                return of(data).pipe(
                  navigateInternalSpecialOverlay(data.variant, interaction.context.slug),
                );
              }
              if (data) {
                return this.contextBuilder.buildSchema(data.context).pipe(
                  map(pageContext => ({
                    template: data.template,
                    stylesheets: data.stylesheets,
                    context: {
                      ...this.stateService.state,
                      ...pageContext,
                    },
                  })),
                  tap((snapshot) => {
                    const overlayRef = this.overlay.create({
                      width: '100vw',
                      height: '100vh',
                      hasBackdrop: false,
                      panelClass: 'page-overlay-panel',
                    });
                    const portal = new ComponentPortal(PebClientPageOverlayComponent);
                    const cmp = overlayRef.attach(portal);
                    Object.assign(cmp.instance, {
                      snapshot,
                      screen$: this.screen$,
                      language$: this.language$,
                      scale$: this.scale$,
                      defaultLanguage: this.defaultLanguage,
                      componentRef: cmp,
                      onInteraction: this.onInteraction.bind(this),
                    });
                    this.overlayRefs.push({ overlayRef, componentRef: cmp });
                  }),
                );
              }

              return EMPTY;
            }),
          );
        }),
      ),

      this.filterInteraction(PebInteractionType.OverlayClose).pipe(
        filter(() => !!this.overlayRefs.length),
        mergeMap(() => {
          const overlay = this.overlayRefs.pop();

          return this.detachOverlay(overlay);
        }),
      ),

      this.filterInteraction(PebInteractionType.NavigateInternal).pipe(
        switchMap(({ interaction }) => {
          const nextPath = typeof interaction.payload === 'string'
            ? interaction.payload
            : interaction.payload?.url ?? interaction.payload?.value ?? interaction.payload?.route;

          const nextRoute = this.theme.routing.find(r => r.routeId === nextPath);
          const page = this.theme?.pages?.find(p => p?._id === nextRoute?.pageId);
          if (page?.variant === PebPageVariant.Product && interaction?.context?.id) {
            this.onInteractionSubject.next({
              interaction: {
                type: PebInteractionType.NavigateInternalSpecial,
                payload: {
                  variant: page.variant,
                  value: interaction.context.id,
                },
              },
            });

            return EMPTY;
          }
          let nextUrl = nextRoute?.url;

          // if passed path
          if (!nextUrl) {
            nextUrl = nextPath;
          }

          this.companyService.hideMobileMenu();

          return this.buildOutAnimation().pipe(
            tap(() => this.router
              .navigate([nextUrl])
              .then(/* do nothing */)
              .catch()),
          );
        }),
      ),

      this.filterInteraction(PebInteractionType.NavigateInternalSpecial).pipe(
        switchMap(({ interaction }) => {
          const { variant, value, inOverlay = false }: {
            variant: PebPageVariant,
            value: string,
            inOverlay: boolean,
          } = interaction.payload;

          const url = variant === PebPageVariant.Category
            ? `/${value}`
            : this.theme.data?.productPages?.replace(':productId', value);
          this.companyService.hideMobileMenu();

          return iif(
            () => inOverlay,
            this.apiService.getAppSourcePage(this.appId, null, variant).pipe(
              take(1),
              navigateInternalSpecialOverlay(variant, value),
            ),
            this.buildOutAnimation().pipe(
              tap(() => this.router.navigate([url])
                .then(/* do nothing */)
                .catch()),
            ),
          );
        }),
      ),

      this.filterInteraction(PebInteractionType.NavigateExternal).pipe(
        tap(({ interaction }) => {
          const payload = typeof interaction.payload === 'string'
            ? interaction.payload
            : interaction.payload?.url ?? interaction.payload as PebLink;
          if (!isPlatformBrowser(this.platformId) || !payload || typeof payload !== 'string' && !payload.value) {
            console.warn('There is no url in passed interaction: ', interaction);

            return;
          }

          const regExp = new RegExp('^(http|https)://', 'i');
          const href = typeof payload === 'string' ? payload : payload.value;
          const url = regExp.test(href) ? href : `https://${href}`;
          if (typeof payload === 'string') {
            window.open(url, '_blank');
          } else {
            payload.newTab ? window.open(url, '_blank') : window.location.href = url;
          }
        }),
      ),

      this.filterInteraction(PebInteractionType.CartClick).pipe(
        tap(() => {
          this.checkoutService.hideAmountCheckout();
          this.checkoutService.hideCartCheckout();
          this.checkoutService.showCheckoutWrapper({
            forceUseCard: true,
            showQRSwitcher: false,
          });
        }),
      ),

      this.filterInteraction(PebInteractionType.CheckoutOpenAmount).pipe(
        tap(() => {
          this.checkoutService.hideAmountCheckout();
          this.checkoutService.hideCartCheckout();
          this.checkoutService.showAmountCheckoutWrapper({
            showQRSwitcher: false,
          });
        }),
      ),

      this.filterInteraction(PebInteractionType.CheckoutOpenQr).pipe(
        tap(() => {
          this.checkoutService.hideAmountCheckout();
          this.checkoutService.hideCartCheckout();

          if (!this.stateService.state['@cart'].data.length) {
            this.checkoutService.showAmountCheckoutWrapper({
              showQRSwitcher: true,
              showCreateCart: true,
            });
          } else {
            this.checkoutService.showCheckoutWrapper({
              showQRSwitcher: true,
              forceUseCard: true,
            });
          }
        }),
      ),

      this.filterInteraction(PebInteractionType.PosCatalogShowProductDetails).pipe(
        tap(({ interaction: event }) => {
          if (this.isProductLoading) {
            return;
          }

          const productPageId = this.clientStore.theme.pages.find(page => page.variant === 'product')?._id;

          combineLatest([
            this.apiService.getAppSourcePage(this.appId, productPageId, null),
            this.productsService.getById(event.payload),
            this.screen$,
          ])
            .pipe(
              take(1),
              tap(([snap, product, screen]) => {
                this.productDetailsService.showProductDetails({
                  ...snap,
                  context: this.stateService.state,
                  stylesheet: snap.stylesheets[screen],
                  screen,
                });
              }),
              catchError(err => of(err)),
            )
            .subscribe();
        }),
      ),

      this.filterInteraction(PebInteractionType.ProductAddToCart).pipe(
        mergeMap(({ interaction, componentRef }) => {
          this.cartService.addCartItem(interaction.payload);

          this.snackbarService.toggle(true, {
            content: this.translateService.translate(
              'builder-client.cart.product-added',
              undefined,
              PebLanguagesData[this.language$.value]?.shortName ||
              PebLanguagesData[this.defaultLanguage]?.shortName || DEFAULT_LOCALE,
            ),
            hideButtonTitle: this.translateService.translate(
              'builder-client.snackbar.hide',
              undefined,
              PebLanguagesData[this.language$.value]?.shortName ||
              PebLanguagesData[this.defaultLanguage]?.shortName || DEFAULT_LOCALE,
            ),
            duration: 2000,
            useShowButton: false,
          });

          if (componentRef) {
            const overlayIndex = this.overlayRefs.findIndex(overlay => overlay.componentRef === componentRef);
            if (overlayIndex >= 0) {
              const overlay = this.overlayRefs.splice(overlayIndex, 1)[0];

              return this.detachOverlay(overlay);
            }
          }

          return EMPTY;
        }),
      ),

      this.filterInteraction(PebInteractionType.PosCatalogToggleFilters).pipe(
        tap(() => {
          this.productsService.toggleFilters();
        }),
      ),

      this.filterInteraction(PebInteractionType.PosCatalogToggleFilter).pipe(
        tap(({ interaction: event }) => {
          this.productsService.toggleFilter(event.payload);
        }),
      ),

      this.filterInteraction(PebInteractionType.PosCatalogSort).pipe(
        tap(({ interaction }) => {
          const currentSortBy = this.stateService.state['@pos-catalog'].data.sortBy;
          const sortBy = !interaction.payload ? (currentSortBy === 'asc' ? 'desc' : 'asc') : interaction.payload;
          this.productsService.sortByCategory = sortBy;
        }),
      ),

      this.filterInteraction(PebInteractionType.SnackbarShowMessage).pipe(
        mergeMap(({ interaction }) => {
          const snackbars: any = Object.values(this.theme.data?.snackbars?.[interaction.payload?.type] ?? {});

          return from(openSnackbar(snackbars));
        }),
      ),

      this.filterInteraction(PebInteractionType.CategoryToggleFilters).pipe(
        tap(() => this.productsService.toggleFilters()),
      ),

      this.filterInteraction(PebInteractionType.CategoryToggleVariantFilter).pipe(
        tap(interaction => this.productsService.toggleVariant(interaction.payload)),
      ),

      this.filterInteraction(PebInteractionType.CartClick).pipe(
        tap(({ interaction }) => this.stateService.patchCategoryData({ title: interaction.payload })),
      ),

      this.filterInteraction(PebInteractionType.NavigationToggleMobileMenu).pipe(
        tap(() => this.companyService.toggleMobileMenu()),
      ),

      this.filterInteraction(PebInteractionType.NavigationHideMobileMenu).pipe(
        tap(() => this.companyService.hideMobileMenu()),
      ),

      this.filterInteraction(PebInteractionType.CategorySort).pipe(
        tap(interaction => this.productsService.sortByCategory = interaction.payload),
      ),

      this.filterInteraction(PebInteractionType.CategoryResetFilters).pipe(
        tap(() => this.productsService.resetFilters()),
      ),

      this.filterInteraction(PebInteractionType.GridCategoryClick).pipe(
        tap(({ interaction }) => {
          this.router
            .navigate([interaction.payload])
            .then(/* do nothing */)
            .catch();
        }),
      ),

      this.filterInteraction(PebInteractionType.GridProductsFilterSelect).pipe(
        tap(({ interaction }) => {
          const urlSegments = this.activatedRoute.snapshot.url;
          this.router.navigate(urlSegments.map(segment => segment.path), {
            queryParams: {
              [interaction.payload?.filter?.field]: interaction.payload?.values?.length ?
                interaction.payload?.values : null,
            },
            queryParamsHandling: 'merge',
          });
        }),
      ),

      this.filterInteraction(PebInteractionType.GridProductsSortSelect).pipe(
        tap(({ interaction }) => {
          const urlSegments = this.activatedRoute.snapshot.url;
          this.router.navigate(urlSegments.map(segment => segment.path), {
            queryParams: {
              ['@order']: interaction.payload?.values?.length ?
                JSON.stringify(interaction.payload.values.map(option => ({
                  field: option.field,
                  direction: option.value,
                }))) : null,
            },
            queryParamsHandling: 'merge',
          });
        }),
      ),

      this.filterInteraction(PebInteractionType.IntegrationLinkPropertyContextUpdate).pipe(
        tap(({ interaction }) => {
          const { integration = null, link = null, value = null }: {
            integration: PebIntegration,
            link: PebIntegrationSelectLink,
            value: any,
          } = interaction.payload ?? {};
          if (integration && link) {
            this.stateService.patch({
              [`@${integration.tag}-${link.contextEntity}-${link.property}`]: {
                state: PebElementContextState.Ready,
                data: value,
              },
            });
          }
        }),
      ),

      this.filterInteraction(PebInteractionType.NavigateEmail).pipe(
        filter(({ interaction }) => interaction.payload?.email),
        tap(({ interaction }) => {
          const { to, ...attributes } = interaction.payload;
          const href = Object.entries(attributes).reduce((acc, [key, value]) => {
            return acc.concat(`?${key}=${value || ''}`);
          }, `mailto:${to}`);
          document.location.href = href;
        }),
      ),

      this.filterInteraction(/^navigate\.application-link/).pipe(
        filter(({ interaction }) => isPlatformBrowser(this.platformId) && !!interaction.payload?.url),
        tap(({ interaction }) => {
          const href = this.appName && !this.document.location.hostname.includes(this.appName)
            ? Location.stripTrailingSlash(`https://${this.appName}`) + interaction.payload.url
            : interaction.payload.url;
          window.location.href = href;
        }),
      ),

      this.filterInteraction(PebInteractionType.SetPagePassword).pipe(
        switchMap(({ interaction }) => {
          const data = interaction?.payload?.data;

          return routeData$.pipe(
            take(1),
            switchMap((routeData) => {
              return this.apiService.getAppSourcePage(
                this.appId,
                routeData.pageId,
                routeData.pageId ? undefined : routeData?.pageVariant,
                this.screen,
                data?.password,
              );
            }),
            tap({
              next: () => {
                this.authService.pagePassword = data.password;
                this.refresh$.next();
              },
            }),
          );
        }),
      ),

      this.filterInteraction(PebInteractionType.IntegrationSubmitForm).pipe(
        mergeMap(({ interaction }: {
          interaction: PebInteractionWithPayload<{
            integration: PebIntegration,
            action: PebIntegrationAction,
            data: any,
          }>
        }) => {
          const { integration = null, action = null, data = null } = interaction.payload;

          // PebIntegrationTag.Auth expects snake_case while Shop expects camelCase
          if ([PebIntegrationTag.Shop, PebIntegrationTag.Site].includes(integration.tag as PebIntegrationTag)) {
            data.firstName = data.first_name;
            data.lastName = data.last_name;

            delete data.first_name;
            delete data.last_name;
          }

          if ('confirm_password' in data && data.password !== data.confirm_password) {
            this.snackbarService.toggle(true, {
              boldContent: 'Failure! ',
              content: `Passwords are not the same.`,
              duration: 5000,
              useShowButton: false,
            });

            return EMPTY;
          }

          const formData = Object.entries(data).reduce((acc, [key, value]: [string, string]) => {
            let v: any = value;
            switch (action.requestMeta?.[key]?.type) {
              case PebIntegrationFieldMetaType.Date:
                const parts = value.split('.').reverse();
                if (parts.length >= 3) {
                  v = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                break;
            }
            acc[key] = v;

            return acc;
          }, {});

          return this.integrationService.fetchIntegrationAction({
            integration,
            action,
            data: formData,
          }).pipe(
            tap(
              (response) => {
                if (action.tags.some(tag => tag === 'login') || (response.accessToken && response.refreshToken)) {
                  this.authService.authorize(response);
                  this.refresh$.next();
                }
                if (action.tags.some(tag => tag === 'register')) {
                  const page = this.theme?.pages?.find(p => p.variant === PebPageVariant.Login);
                  const route = this.theme?.routing?.find(r => r.pageId === page?.id);
                  if (route?.url) {
                    this.router.navigate(route.url);
                  }
                }
                this.snackbarService.toggle(true, {
                  boldContent: 'Success! ',
                  content: response?.message || 'Accepted',
                  duration: 5000,
                  useShowButton: false,
                });
              },
              err => {
                this.snackbarService.toggle(true, {
                  boldContent: 'Failure! ',
                  content: err.error.message || err.message,
                  duration: 5000,
                  useShowButton: false,
                });
              }
            ),
          );
        }),
      ),
    ).pipe(
      catchError((err) => {
        console.error(err);

        return throwError(err);
      }),
      retry(),
      takeUntil(this.destroyed$),
    ).subscribe();

    combineLatest([this.screen$, this.language$, this.scale$]).pipe(
      take(1),
      tap(([screen, language, scale]) => {
        this.store.dispatch(new PebEditorOptionsAction({
          screen: screen,
          defaultScreen: PebScreen.Desktop,
          scale: scale,
          scaleToFit: false,
          language: language,
          defaultLanguage: this.defaultLanguage,
          interactions: true,
          readOnly: true,
        }));
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.overlayRefs.forEach(overlay => {
      overlay.overlayRef.dispose();
    });
    this.destroyed$.next(true);
  }

  onInteraction(interaction: PebInteractionWithPayload<any>, componentRef?: ComponentRef<any>): void {
    this.onInteractionSubject.next({ interaction, componentRef });
  }

  onPagePasswordSubmit(form: { variant: string, value: { password: string, login: string }}): void {
    if (form.variant === 'password') {
      this.onInteractionSubject.next({
        interaction: {
          type: PebInteractionType.SetPagePassword,
          payload: { data: form.value },
        },
      });
    } else if (form.variant === 'login') {
      this.login(form.value.login, form.value.password);
    }
  }

  private login(email: string, password: string): Promise<any> {
    return this.apiService.login(this.app.businessId, email, password).pipe(
      tap({
        next: response => this.authService.authorize(response),
        error: (err) => this.snackbarService.toggle(true, {
          content: err?.error?.message,
          duration: 2000,
        }),
      }),
    ).toPromise();
  }

  private filterInteraction(interactionType: PebInteractionType | RegExp): Observable<PageInteraction> {
    return this.onInteraction$.pipe(
      filter(({ interaction }) => {
        if (interactionType instanceof RegExp) {
          return interactionType.test(interaction.type);
        }

        return interaction.type === interactionType;
      }),
    );
  }

  private detachOverlay(overlay: {
    overlayRef: OverlayRef,
    componentRef: ComponentRef<PebClientPageOverlayComponent>,
  }): Observable<void> {
    return overlay.componentRef.instance.buildOutAnimation().pipe(
      finalize(() => {
        overlay.overlayRef.detach();
        this.tree.load(this.renderer.instances);
      }),
    );
  }

  private getPasswordVariant(message: string) {
    let pageVariant = 'other';
    if (message === 'Password needed to access this page.') {
      pageVariant = PebPageVariant.Password;
    } else if (!this.authService.customer) {
      pageVariant = PebPageVariant.Login;
    }

    return pageVariant;
  }

  private detachAllOverlays(): Observable<void> {
    return this.overlayRefs.length ?
      forkJoin(this.overlayRefs.map(overlay => this.detachOverlay(overlay))) : of(null);
  }

  private buildOutAnimation(): Observable<void> {
    return this.detachAllOverlays().pipe(
      switchMap(() => this.renderer.applyBuildOutAnimation()),
    );
  }

  private loadFonts(page) {
    let fonts = page.data?.fonts?.[this.screen]?.[PebLanguage.Generic];

    page.data?.fonts?.[this.screen]?.[this.language$.value]?.forEach(font => {
      const index = fonts.findIndex(f => f.name === font.name);

      if (index === -1) {
        if (validateFont(font.name)) {
          fonts.push(font);
        }
      } else {
        fonts[index].weights = [ ...new Set([ ...fonts[index].weights, ...font.weights ]) ];
      }
    });

    if (fonts) {
      fonts = fonts.reduce((acc, { name, weights }) => {
        if (validateFont(name)) {
          weights = [ ...new Set(weights.map(weight => weight.toString()))];

          let italic = false;

          weights.forEach(weight => {
            if (weight.indexOf('i') !== -1) {
              italic = true;
            }
          });

          if (italic) {
            weights = weights.map(weight => weight.indexOf('i') !== -1 ? `1,${weight.slice(0, -1)}` : `0,${weight}`);
          }

          const str = `family=${name}${weights.length ? `:${italic ? 'ital,' : ``}wght@${weights.sort().join(';')}` : ``}`;

          acc.push(str);
        }

        return acc;
      }, []);

      const head = this.document.head;

      let link: any;

      link = this.renderer2.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = `https://fonts.googleapis.com/css2?${fonts.join('&')}&display=block`;

      this.renderer2.appendChild(head, link);

      link = this.renderer2.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?${fonts.join('&')}&display=block`;

      this.renderer2.appendChild(head, link);
    }

    function validateFont(familyName: string) {
      return pebFontFamilies.some(family => family.name.toLowerCase() === familyName.toLowerCase());
    }
  }

  private removeLinks(): void {
    const head = this.document.head;
    const links = head?.querySelectorAll('link');
    if (links) {
      for (let i = 0; i < links.length; i += 1) {
        const link = links[i];
        if (link.href.includes('https://fonts.googleapis.com/css2')) {
          this.renderer2.removeChild(head, link);
        }
      }
    }
  }
}
