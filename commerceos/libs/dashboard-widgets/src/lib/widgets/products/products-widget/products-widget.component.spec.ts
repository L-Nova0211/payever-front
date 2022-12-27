import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppLauncherService, EnvService, HeaderService, WallpaperService } from '@app/services';
import { WidgetActionButtonComponent, WidgetCardComponent, WidgetStatisticsComponent } from '@modules/dashboard/shared-dashboard/components';
import { EditWidgetsService } from '@modules/dashboard/shared-dashboard/services';
import { LoaderService, ApiService } from '@modules/shared/services';
import { Subject, of, empty } from 'rxjs';
import {
  FakeEnvService, FakeRouter, FakeLoaderService, FakeTranslateService,
  FakePlatformService, FakeWallpaperService, FakeMediaService,
} from 'test.helpers';

import { ButtonModule } from '@pe/ng-kit/modules/button';
import { PlatformService } from '@pe/ng-kit/modules/common';
import { I18nModule, TranslateService } from '@pe/ng-kit/modules/i18n';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';
import { IconsPngUrlPipe, SafeStylePipe, MediaService } from '@pe/ng-kit/src/kit/media';

import { ProductsWidgetComponent, ProductItemComponent, TruncatePipe } from '..';
import { WidgetsApiService } from '../../../services';

const products = [
  // tslint:disable-next-line:max-line-length
  { _id: 'i1', business: 'id', id: 'i1', lastSell: '2019-05-14T07:08:42.890Z', name: 'DRONE 1', quantity: 1, thumbnail: '', uuid: 'i1' },
  // tslint:disable-next-line:max-line-length
  { _id: '2', business: 'id', id: 'i2', lastSell: '2019-05-14T12:05:10.931Z', name: 'test sku', quantity: 0, thumbnail: null, uuid: 'u2' },
  // tslint:disable-next-line:max-line-length
  { _id: 'i3', business: 'id', id: 'i3', lastSell: '2019-05-10T14:22:26.275Z', name: '2', quantity: 0, thumbnail: null, uuid: 'u3' },
];

describe('ProductsWidgetComponent', function () {
  let comp: ProductsWidgetComponent;
  let fixture: ComponentFixture<ProductsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        I18nModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatDividerModule,
      ],
      declarations: [
        ProductsWidgetComponent,
        ProductItemComponent,
        WidgetCardComponent,
        WidgetStatisticsComponent,
        WidgetActionButtonComponent,
        TruncatePipe,
        IconsPngUrlPipe,
        SafeStylePipe,
      ],
      providers: [
        {
          provide: WidgetsApiService,
          useValue: {
            getWeekPopularProducts: (id: any) => {
              if (id) {
                return of([]);
              }

              return empty();
            },

            getMonthPopularProducts: (id: any) => {
              if (id === 'id_empty') {
                return of([]);
              } else if (id) {
                return of(products);
              }

              return empty();
            },

            getLastSoldProducts: (id: any) => {
              if (id === 'id_empty') {
                return of([]);
              } else if (id) {
                return of(products)
              }

              return empty();
            },

            getWeekPopularProductsRandom: (id: any) => {
              return of(products);
            },

            getMonthPopularProductsRandom: (id: any) => {
              return of(products);
            },

            getLastSoldProductsRandom: (id: any) => {
              return of(products);
            },
          },
        },
        {
          provide: AppLauncherService,
          useValue: {},
        },
        {
          provide: MicroRegistryService,
          useValue: {},
        },
        {
          provide: EnvService,
          useValue: new FakeEnvService(),
        },
        {
          provide: Router,
          useValue: new FakeRouter(),
        },
        {
          provide: LoaderService,
          useValue: new FakeLoaderService(),
        },
        {
          provide: PlatformService,
          useValue: new FakePlatformService(),
        },
        {
          provide: HeaderService,
          useValue: {},
        },
        {
          provide: TranslateService,
          useValue: new FakeTranslateService(),
        },
        {
          provide: WallpaperService,
          useValue: new FakeWallpaperService(),
        },
        {
          provide: ApiService,
          useValue: {},
        },
        {
          provide: EditWidgetsService,
          useValue: {},
        },
        {
          provide: MediaService,
          useValue: new FakeMediaService(),
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsWidgetComponent);
    comp = fixture.componentInstance;
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Widget Products content header', () => {

    it('should render the icon', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-container .widget-card-header-icon'));
      expect(element).not.toBeNull();
    });

    it('should render the title', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-container .widget-card-header-title'));
      expect(element).not.toBeNull();
    });

    it('should render the learn more button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-buttons .learn-more-link'));
      expect(element).not.toBeNull();
    });

    it('should render the open button', () => {
      TestBed.get(EnvService).businessIdStorage$.next('id');
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-buttons button.mat-button-rounded'));
      expect(element).not.toBeNull();
    });

    it('should render the more button', () => {
      TestBed.get(EnvService).businessIdStorage$.next('id');
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-buttons button.widget-card-header-more'));
      expect(element).not.toBeNull();
    });

  });

  describe('Widget Products content body', () => {

    it('should render products title', () => {
      TestBed.get(EnvService).businessIdStorage$.next('id');
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body-content .products-widget-title'));
      expect(element).not.toBeNull();
    });

    it('should render products item', () => {
      TestBed.get(EnvService).businessIdStorage$.next('id');
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body-content product-item'));
      expect(element).not.toBeNull();
    });

    it('should render random products item', () => {
      TestBed.get(EnvService).businessIdStorage$.next('id_empty');
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body-content product-item'));
      expect(element).not.toBeNull();
    });

    it('should render panel "More"', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-more'));
      expect(element).not.toBeNull();
    });

    it('should render panel "More" content', () => {
      TestBed.get(EnvService).businessIdStorage$.next('id');
      fixture.detectChanges();
      const element = fixture.debugElement
        .queryAll(By.css('.widget-card-content-more product-item'));
      expect(element.length).toBe(3);
    });

  });

  describe('Widget Products item description', () => {

    jasmine.clock().mockDate(new Date('2019-05-14T01:08:42.890Z'));
    it('last hour', () => {
      let products: any[];
      TestBed.get(EnvService).businessIdStorage$.next('id');
      comp.products$.subscribe(prods => products = prods);

      expect(products.length).toBe(1);
    });

  });

  describe('Widget Products actions', () => {
    it('should call add product', () => {
      let routerCall = false;
      TestBed.get(Router).navigate$.subscribe(() => routerCall = true);
      comp.onAddNewProduct();

      expect(routerCall).toBeTruthy();
    });

    it('should throw an error on add failed', () => {
      let routerCall = false;
      TestBed.get(Router).navigate$.subscribe(() => routerCall = true);
      const envService = TestBed.get(EnvService);
      envService.businessIdStorage$.next('id');
      envService.businessUuid = 'id_error';

      comp.onAddNewProduct();
      expect(routerCall).toBeFalsy();
    });

    it('should call open product', () => {
      let routerCall = false;
      TestBed.get(Router).navigate$.subscribe(() => routerCall = true);
      TestBed.get(EnvService).businessIdStorage$.next('id');

      comp.productsMore$.subscribe(prod => comp.onOpenProduct(prod[0]));

      expect(routerCall).toBeTruthy();
    });

    it('should not call if no link to product', () => {
      let routerCall = false;
      TestBed.get(Router).navigate$.subscribe(() => routerCall = true);
      TestBed.get(EnvService).businessIdStorage$.next('id');

      comp.productsMore$.subscribe(prod => comp.onOpenProduct(prod[1]));

      expect(routerCall).toBeFalsy();
    });

    it('should throw an error on open failed', () => {
      let routerCall = false;
      TestBed.get(Router).navigate$.subscribe(() => routerCall = true);
      const envService = TestBed.get(EnvService);
      envService.businessIdStorage$.next('id');
      envService.businessUuid = 'id_error';

      comp.products$.subscribe(prod => comp.onOpenProduct(prod[0]));
      expect(routerCall).toBeFalsy();
    });

  });

});
