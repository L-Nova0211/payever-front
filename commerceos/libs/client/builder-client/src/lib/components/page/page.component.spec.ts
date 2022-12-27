import { BreakpointObserver } from '@angular/cdk/layout';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { NO_ERRORS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

import {
  CONTEXT_SERVICES,
  PebElementContextState,
  PebInteractionType,
  PebInteractionWithPayload,
  PebPageVariant,
  PebScreen,
} from '@pe/builder-core';
import { APP_TYPE, AppType } from '@pe/builder-renderer';
import { TranslateService, TranslationLoaderService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { PebClientCheckoutCartService } from '../../modules/checkout/services/cart.service';
import { PebClientApiService  } from '../../services/api.service';
import { CompanyService } from '../../services/company/company.service';
import { PebContextService } from '@pe/builder-context';
import { ProductsService } from '../../services/products/products.service';

import { PebClientCheckoutService } from './../../modules/checkout/services/checkout.service';
import { PebClientContextBuilderService } from './../../services/context-builder.service';
import { PebClientStateService } from './../../services/state.service';
import { PebClientPageComponent } from './page.component';


describe('PageComponent', () => {

  let fixture: ComponentFixture<PebClientPageComponent>;
  let component: PebClientPageComponent;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRoute;
  let rootStateService: jasmine.SpyObj<PebClientStateService>;
  let contextBuilder: jasmine.SpyObj<PebClientContextBuilderService>;
  let productsService: jasmine.SpyObj<ProductsService>;
  let checkoutService: jasmine.SpyObj<PebClientCheckoutService>;
  let cartService: jasmine.SpyObj<PebClientCheckoutCartService>;
  let companyService: jasmine.SpyObj<CompanyService>;
  let snackbar: jasmine.SpyObj<MatSnackBar>;
  let api: jasmine.SpyObj<PebClientApiService>;
  let theme: any;
  let shop: any;
  let routing: {
    routeId: string,
    url: string
  }[];

  beforeEach(waitForAsync(() => {

    routing = [
      {
        routeId: 'r-001',
        url: 'route/r-001',
      },
      {
        routeId: 'r-002',
        url: 'route/r-002',
      },
      {
        routeId: 'r-003',
        url: 'route/r-003',
      },
    ];

    const routerSpy = jasmine.createSpyObj<Router>('Router', {
      navigate: Promise.resolve(true),
      navigateByUrl: Promise.resolve(true),
    });

    const routeMock = {
      snapshot: {
        url: [],
      },
      url: of([]),
      queryParams: of({}),
    };

    const rootStateServiceSpy = jasmine.createSpyObj<PebClientStateService>('RootStateService', [
      'patch',
      'setProductSort',
      'setProductFilters',
      'patchCategoryData',
    ], {
      categories$: new BehaviorSubject([]),
      state$: new BehaviorSubject({}),
    });

    const contextBuilderSpy = jasmine.createSpyObj<PebClientContextBuilderService>('ContextBuilder', {
      buildSchema: of({}),
    });

    const breakpointObserverMock = {
      observe() {
        return of({
          breakpoints: { desktop: true },
          matches: true,
        });
      },
    };

    const productsServiceSpy = jasmine.createSpyObj<ProductsService>('ProductsService', [
      'getProductById',
      'toggleFilters',
      'toggleVariant',
      'resetFilters',
    ]);

    const checkoutServiceSpy = jasmine.createSpyObj<PebClientCheckoutService>('CheckoutService', [
      'addCheckoutComponent',
      'showCartCheckout',
      'showCheckoutWrapper',
    ]);
    checkoutServiceSpy.addCheckoutComponent.and.returnValue(of({}));

    const cartServiceSpy = jasmine.createSpyObj<PebClientCheckoutCartService>('CartService', [
      'loadData',
      'addCartItem',
    ]);

    const companyServiceSpy = jasmine.createSpyObj<CompanyService>('CompanyService', [
      'toggleMobileMenu',
      'hideMobileMenu',
    ]);

    const integrationServiceSpy = jasmine.createSpyObj<PebContextService>('IntegrationsContext', [
      'fetchAction',
      'fetchActionWithAdditional',
    ]);

    const snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    const apiSpy = jasmine.createSpyObj<PebClientApiService>('ApiService', {
      getAppSourcePage: of({
        application: '499b5aea-85d7-4d5d-8a17-26281077b5a9',
        compiledTheme: '0d194f63-6e28-46f2-9518-f47959301056',
        context: { _id: 'ab3cef86-5dff-4de7-9b9f-d795b77863af' },
        createdAt: '2021-10-13T13:30:41.700Z',
        data: {
          fonts: {
            desktop: {
              generic: [{ name: 'Roboto', weights: ['700'] }],
              english: [{ name: 'Roboto', weights: ['700'] }],
            },
          },
        },
        name: 'Front',
        stylesheets: {
          desktop: {},
        },
        template: {
          id: 'bb5001c3-1ccc-40ac-a28d-ad2179b14d8f',
          type: 'document',
          children: [{
            id: '2f6167d4-7b40-4496-86b2-13a5b753af97',
            type: 'section',
            data: { name: 'header' },
            meta: { deletable: false },
            children: [],
          }],
        },
        updatedAt: '2021-10-13T13:30:41.700Z',
        variant: 'default',
        id: 'e2f71766-2bad-4715-9cf2-2e0168c1a94c',
      }),
      getAppSourcePageScreenStylesheet: of({}),
    });

    const translationLoaderServiceSpy = jasmine.createSpyObj<TranslationLoaderService>('TranslationLoaderService', {
      loadTranslations: of(true),
    });

    const translationServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translation',
    });

    const snackbarServiceSpy = jasmine.createSpyObj<SnackbarService>('SnackbarService', [
      'toggle',
    ]);

    theme = {
      context: {},
      routing: [],
      data: undefined,
    };

    shop = {
      id: 'shop-001',
    };

    const overlaySpy = jasmine.createSpyObj<Overlay>('Overlay', ['create']);

    TestBed.configureTestingModule({
      declarations: [
        PebClientPageComponent,
      ],
      imports: [
        BrowserTransferStateModule,
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: PebClientStateService, useValue: rootStateServiceSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
        { provide: PebClientContextBuilderService, useValue: contextBuilderSpy },
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: PebClientCheckoutService, useValue: checkoutServiceSpy },
        { provide: PebClientCheckoutCartService, useValue: cartServiceSpy },
        { provide: CompanyService, useValue: companyServiceSpy },
        { provide: CONTEXT_SERVICES.integrations, useValue: integrationServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: PebClientApiService, useValue: apiSpy },
        { provide: 'THEME', useValue: theme },
        { provide: 'APP', useValue: shop },
        { provide: APP_TYPE, useValue: AppType.Shop },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: 'LOCALE', useValue: 'en' },
        { provide: 'USER_AGENT_SCREEN', useValue: PebScreen.Desktop },
        { provide: DOCUMENT, useValue: document },
        { provide: TranslateService, useValue: translationServiceSpy },
        { provide: TranslationLoaderService, useValue: translationLoaderServiceSpy },
        { provide: SnackbarService, useValue: snackbarServiceSpy },
        { provide: Overlay, useValue: overlaySpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebClientPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      route = TestBed.inject(ActivatedRoute);
      rootStateService = TestBed.inject(PebClientStateService) as jasmine.SpyObj<PebClientStateService>;
      contextBuilder = TestBed.inject(PebClientContextBuilderService) as jasmine.SpyObj<PebClientContextBuilderService>;
      productsService = TestBed.inject(ProductsService) as jasmine.SpyObj<ProductsService>;
      checkoutService = TestBed.inject(PebClientCheckoutService) as jasmine.SpyObj<PebClientCheckoutService>;
      cartService = TestBed.inject(PebClientCheckoutCartService) as jasmine.SpyObj<PebClientCheckoutCartService>;
      companyService = TestBed.inject(CompanyService) as jasmine.SpyObj<CompanyService>;
      snackbar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
      api = TestBed.inject(PebClientApiService) as jasmine.SpyObj<PebClientApiService>;

      api.getAppSourcePage.and.returnValue(of({}));
      api.getAppSourcePageScreenStylesheet.and.returnValue(of({}));

      rootStateService[`state$` as any] = of(null);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get window resize observable', () => {

    const event = new Event('resize');

    // platform = browser
    component[`windowResize$`].pipe(skipWhile(e => e === null)).subscribe(ev => expect(ev).toEqual(event));
    window.dispatchEvent(event);

  });

  it('should get scale$', () => {

    component.scale$.subscribe(scale => expect(scale).toBe(1));

  });

  it('should handle init', () => {

    router[`url` as any] = 'router.url';
    route.snapshot.url = [
      { path: 'path' },
    ] as any;

    theme.data = {
      productPages: undefined,
      categoryPages: undefined,
    };
    theme.routing = [
      {
        url: 'router.url',
        pageId: 'p-001',
      },
    ];

    api.getAppSourcePage.and.returnValues(
      throwError('test error'),
      of({
        id: 'p-001',
        stylesheets: {},
      }),
    );

    // w/o variant
    component.ngOnInit();

    expect(cartService.loadData).toHaveBeenCalled();
    expect(rootStateService.patch).toHaveBeenCalledWith({
      '@products-detail-variants': {
        state: PebElementContextState.Empty,
        data: null,
      },
    });
    // expect(api.getAppSourcePage).toHaveBeenCalledWith(shop.id, 'p-001', null, PebScreen.Desktop);
    // expect(api.getAppSourcePage).toHaveBeenCalledWith(shop.id, null, '404');
    // expect(api.getAppSourcePageScreenStylesheet).toHaveBeenCalledWith(shop.id, 'p-001', PebScreen.Tablet);
    // expect(api.getAppSourcePageScreenStylesheet).toHaveBeenCalledWith(shop.id, 'p-001', PebScreen.Mobile);

    // variant = product
    // w/o productId
    api.getAppSourcePageScreenStylesheet.calls.reset();
    theme.data.productPages = '/path/:productId';

    api.getAppSourcePage.and.returnValue(of({ id: 'p-001', stylesheets: {} }));

    component.ngOnInit();

    // expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    expect(productsService.getProductById).not.toHaveBeenCalled();
    // expect(api.getAppSourcePageScreenStylesheet).not.toHaveBeenCalled();

    // w/ productId
    router.navigateByUrl.calls.reset();

    route.snapshot.url.push({ path: 'prod-001' } as any);

    // productsService.getProductById.and.returnValue(of({
    //   result: {
    //     id: 'prod-001',
    //   },
    // }));

    component.ngOnInit();

    // expect(productsService.getProductById).toHaveBeenCalledWith('prod-001');
    // expect(rootStateService.patch).toHaveBeenCalledWith({
    //   '@products-detail': {
    //     state: PebElementContextState.Ready,
    //     data: { id: 'prod-001' },
    //   },
    // });

    // variant = category
    // w/o categoryName
    // w/o queryParams
    theme.data.productPages = undefined;
    theme.data.categoryPages = '/path/:categoryId';

    route.snapshot.url.pop();

    component.ngOnInit();

    // expect(rootStateService.setProductSort).toHaveBeenCalledWith([]);
    // expect(rootStateService.setProductFilters).toHaveBeenCalledWith([]);

    // w/ queryParams
    // w/ categoryName
    rootStateService.setProductSort.calls.reset();
    rootStateService.setProductFilters.calls.reset();

    route.snapshot.url.push({ path: 'guns' } as any);

    route.queryParams = of({
      '@order': { test: true },
      id: ['1'],
      'attribute.test': ['test'],
    });

    component.ngOnInit();

    // expect(rootStateService.setProductSort).toHaveBeenCalledWith([]);
    // expect(rootStateService.setProductFilters).toHaveBeenCalledWith([
    //   {
    //     field: 'categories.slug',
    //     fieldCondition: 'contains',
    //     value: 'guns',
    //   },
    //   {
    //     field: 'id',
    //     fieldCondition: 'in',
    //     value: ['1'],
    //   },
    //   {
    //     field: 'attribute.test',
    //     fieldCondition: 'and',
    //     value: [
    //       {
    //         field: 'attribute.name',
    //         fieldCondition: 'contains',
    //         value: 'attribute.test',
    //       },
    //       {
    //         field: 'attribute.value',
    //         fieldCondition: 'in',
    //         value: ['test'],
    //       },
    //     ],
    //   },
    //   {
    //     field: 'attribute.test',
    //     fieldCondition: 'in',
    //     value: ['test'],
    //   },
    // ]);

    // pageData change
    // w/o page
    contextBuilder.buildSchema.calls.reset();

    const pageSubject = new BehaviorSubject(null);
    const screenSubject = new BehaviorSubject(null);
    const stateSubject = new BehaviorSubject(null);

    // component.pageData$ = pageSubject.asObservable();
    component[`screen$` as any] = screenSubject.asObservable();
    rootStateService[`state$` as any] = stateSubject.asObservable();

    pageSubject.next(null);
    screenSubject.next(PebScreen.Desktop);
    stateSubject.next({ test: true });

    component.ngOnInit();

    // expect(contextBuilder.buildSchema).not.toHaveBeenCalled();

    // w/ page
    contextBuilder.buildSchema.and.returnValue(of({}));

    pageSubject.next({
      template: 'tpl-001',
      stylesheets: {
        [PebScreen.Desktop]: { color: '#333333' },
      },
      context: { id: 'ctx-001' },
    });

    // expect(component.snapshotSubject.value).toEqual({
    //   template: 'tpl-001',
    //   stylesheet: { color: '#333333' },
    //   context: { test: true },
    // });

  });

  it('should handle interaction - NavigateInternal', () => {

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.NavigateInternal,
      payload: null,
    };

    theme.routing = routing;

    (component as any).buildOutAnimation = () => of(true);

    // w/o payload
    component.onInteraction(interaction);

    expect(companyService.hideMobileMenu).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith([undefined]);

    // w/ payload
    // typeof payload = string
    interaction.payload = 'r-002';

    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith([routing[1].url]);

    // typeof payload != string
    // w/o payload.value
    interaction.payload = {
      route: 'r-001',
    };

    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith([routing[0].url]);

  });

  it('should handle interaction - NavigateInternalSpecial', () => {

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.NavigateInternalSpecial,
      payload: {
        variant: PebPageVariant.Product,
        value: 'prod-001',
      },
    };

    theme.data = undefined;
    (component as any).buildOutAnimation = () => of(true);

    // variant = product
    // theme.data = undefined
    component.onInteraction(interaction);
    expect(router.navigate).toHaveBeenCalledWith([undefined]);

    // w/o product pages
    router.navigate.calls.reset();
    theme.data = {
      productPages: undefined,
    };

    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith([undefined]);

    // w/ product page
    theme.data.productPages = '/products/:productId';

    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith(['/products/prod-001']);

    // variant = category
    // w/o theme.data
    router.navigate.calls.reset();
    interaction.payload = {
      variant: PebPageVariant.Category,
      value: 'cat-001',
    };
    theme.data = undefined;

    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith(['/cat-001']);

    // open product in overlay
    interaction.payload.inOverlay = true;

    // fetch product page
    // expect(api.getAppSourcePage).toHaveBeenCalledWith(shop.id, null, PebPageVariant.Product);

    const overlay: jasmine.SpyObj<Overlay> = TestBed.inject(Overlay) as jasmine.SpyObj<Overlay>;
    const overlayRef = jasmine.createSpyObj<OverlayRef>('OverlayRef', {
      attach: { instance: {} },
    });
    overlay.create.and.returnValue(overlayRef);

    component.onInteraction(interaction);

    expect(overlay.create).toHaveBeenCalled();
    expect(overlayRef.attach).toHaveBeenCalled();

  });

  it('should handle interaction - NavigateExternal', () => {

    const warnSpy = spyOn(console, 'warn');
    const openSpy = spyOn(window, 'open');
    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.NavigateExternal,
      payload: {
        value: undefined,
      },
    };

    // typeof payload != string
    // w/o payload.value
    component.onInteraction(interaction);

    expect(warnSpy).toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    // typeof payload = string
    // url w/o http or https
    interaction.payload = 'test.com';

    component.onInteraction(interaction);

    expect(openSpy).toHaveBeenCalledWith('https://test.com', '_blank');

    // typeof payload != string
    openSpy.calls.reset();
    interaction.payload = {
      value: 'https://test.com',
      newTab: true,
    };

    component.onInteraction(interaction);

    expect(openSpy).toHaveBeenCalledWith(interaction.payload.value, '_blank');

  });

  it('should handle interaction - CartClick', () => {

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.CartClick,
      payload: null,
    };

    component.onInteraction(interaction);

    expect(checkoutService.showCheckoutWrapper).toHaveBeenCalled();

  });

  it('should handle interaction - ProductAddToCart', () => {

    const snackbarService = TestBed.inject(SnackbarService);

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.ProductAddToCart,
      payload: { id: 'prod-001' },
    };

    component.onInteraction(interaction);

    expect(cartService.addCartItem).toHaveBeenCalledWith(interaction.payload);
    expect(snackbarService.toggle).toHaveBeenCalled();

  });

  it('should handle interaction - CategoryToggleFilters', () => {

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.CategoryToggleFilters,
      payload: null,
    };

    component.onInteraction(interaction);

    expect(productsService.toggleFilters).toHaveBeenCalled();

  });

  it('should handle interaction - NavigationToggleMobileMenu', () => {

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.NavigationToggleMobileMenu,
      payload: null,
    };

    component.onInteraction(interaction);

    expect(companyService.toggleMobileMenu).toHaveBeenCalled();

  });

  it('should handle interaction - NavigationHideMobileMenu', () => {

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.NavigationHideMobileMenu,
      payload: null,
    };

    component.onInteraction(interaction);

    expect(companyService.hideMobileMenu).toHaveBeenCalled();

  });

  it('should handle interaction - CategoryResetFilters', () => {

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.CategoryResetFilters,
      payload: null,
    };

    component.onInteraction(interaction);

    expect(productsService.resetFilters).toHaveBeenCalled();

  });

  it('should handle interaction - GridCategoryClick', () => {

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.GridCategoryClick,
      payload: 'cat-001',
    };

    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith([interaction.payload]);

  });

  it('should handle interaction - GridProductsFilterSelect', () => {

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.GridProductsFilterSelect,
      payload: null,
    };

    route.snapshot.url = [
      { path: 'path' },
    ] as any;

    // w/o payload
    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith(['path'], {
      queryParams: {
        undefined: null,
      },
      queryParamsHandling: 'merge',
    });

    // w/o filter & values
    router.navigate.calls.reset();
    interaction.payload = {
      filter: undefined,
      values: undefined,
    };

    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith(['path'], {
      queryParams: {
        undefined: null,
      },
      queryParamsHandling: 'merge',
    });

    // w/ filter & values
    interaction.payload = {
      filter: {
        field: 'title',
      },
      values: ['test'],
    };

    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith(['path'], {
      queryParams: {
        title: ['test'],
      },
      queryParamsHandling: 'merge',
    });

  });

  it('should handle interaction - GridProductsSortSelect', () => {

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.GridProductsSortSelect,
      payload: null,
    };

    route.snapshot.url = [
      { path: 'path' },
    ] as any;

    // w/o payload
    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith(['path'], {
      queryParams: {
        '@order': null,
      },
      queryParamsHandling: 'merge',
    });

    // w/o values
    interaction.payload = {
      values: undefined,
    };

    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith(['path'], {
      queryParams: {
        '@order': null,
      },
      queryParamsHandling: 'merge',
    });

    // w/ values
    interaction.payload.values = [
      {
        field: 'id',
        value: 'desc',
      },
    ];

    component.onInteraction(interaction);

    expect(router.navigate).toHaveBeenCalledWith(['path'], {
      queryParams: {
        '@order': JSON.stringify(interaction.payload.values.map(option => ({
          field: option.field,
          direction: option.value,
        }))),
      },
      queryParamsHandling: 'merge',
    });

  });

  it('should handle interaction - IntegrationLinkPropertyContextUpdate', () => {

    const interaction: PebInteractionWithPayload<any> = {
      type: PebInteractionType.IntegrationLinkPropertyContextUpdate,
      payload: null,
    };

    rootStateService.patch.calls.reset();

    // w/o payload
    component.onInteraction(interaction);

    expect(rootStateService.patch).not.toHaveBeenCalled();

  });
});
