import { HttpClient } from '@angular/common/http';
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

import {
  FakeEnvService, FakeRouter, FakeLoaderService, FakePlatformService,
  FakeTranslateService, FakeWallpaperService, FakeTranslationLoaderService,
  FakeEnvironmentConfigService, FakeMicroLoaderService,
  FakeMicroRegistryService,
  FakeHttpClient,
} from 'test.helpers';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { PlatformService, CommonModule } from '@pe/ng-kit/modules/common';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { I18nModule, TranslateService, TranslationLoaderService } from '@pe/ng-kit/modules/i18n';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { MicroRegistryService, MicroLoaderService } from '@pe/ng-kit/modules/micro';


import { StoreWidgetComponent } from '..';
import { WidgetsApiService } from '../../../services';
import { StoreInfoComponent, StoreStatsComponent } from '../../shared';

import { BehaviorSubject, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

const shops: any[] = [
  { active:false,locales:['en'],defaultLocale:'en',live:false,_id:'44926230-1731-4120-888d-b1746dcf09bb',name:'Shop #2',logo:'',channelSet:'8fd6cf4a-18c7-4311-b58d-86d2b4067583',business:'fbeca444-f5c5-4a7c-a326-7ad57556fd45',createdAt:'2019-02-22T15:10:46.897Z',updatedAt:'2019-03-03T13:06:28.555Z',__v:0,theme:'8d033bfe-c4ed-430f-98ed-b4225b02a5a7' },
  { active:false,locales:['en'],defaultLocale:'en',live:false,_id:'d00d606a-db0d-4f16-be5f-48fbb25d2e35',name:'test creating shop',logo:null,channelSet:'789d3cfe-33d4-4b2e-9784-e1557fee7908',business:'fbeca444-f5c5-4a7c-a326-7ad57556fd45',createdAt:'2019-02-22T19:02:52.197Z',updatedAt:'2019-02-22T19:02:52.234Z',__v:0,theme:'07cbef36-2732-4b08-9a8a-d213d9586407' },
];

const transactions: any[] = [
  { amount: 1 },
  { amount: 2 },
]

describe('StoreWidgetComponent', function () {
  let comp: StoreWidgetComponent;
  let fixture: ComponentFixture<StoreWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        I18nModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatDividerModule,
        MediaModule,
        CommonModule,
      ],
      declarations: [
        StoreWidgetComponent,
        WidgetCardComponent,
        WidgetStatisticsComponent,
        WidgetActionButtonComponent,
        StoreInfoComponent,
        StoreStatsComponent,
      ],
      providers: [
        {
          provide: WidgetsApiService,
          useValue: {
            getShops: () => new BehaviorSubject(shops),
            getShopDomain: () => new BehaviorSubject({
              name: '',
            }),
            getTopViewedProductsByChannelSet: () => new BehaviorSubject([]),
            getWeekTransactionsByChannelSet: () => new BehaviorSubject(transactions),
          },
        },
        {
          provide: AppLauncherService,
          useValue: {},
        },
        {
          provide: MicroRegistryService,
          useValue: new FakeMicroRegistryService(),
        },
        {
          provide: EnvService,
          useValue: new FakeEnvService('id'),
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
          provide: TranslationLoaderService,
          useValue: new FakeTranslationLoaderService(),
        },
        {
          provide: EnvironmentConfigService,
          useValue: new FakeEnvironmentConfigService(),
        },
        {
          provide: MicroLoaderService,
          useValue: new FakeMicroLoaderService(),
        },
        {
          provide: HttpClient,
          useValue: new FakeHttpClient(),
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreWidgetComponent);
    comp = fixture.componentInstance;
    comp.widget = {
      _id: '',
      defaultApp: true,
      installedApp: true,
      icon: '',
      title: 'Shop',
      type: '',
      installed: true,
    };
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Widget Store content header', () => {

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

    it('should render the open button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-buttons button.mat-button-rounded'));
      expect(element).not.toBeNull();
    });

    it('should render the more button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-buttons button.widget-card-header-more'));
      expect(element).not.toBeNull();
    });

  });

  describe('Widget Store content body', () => {

    it('should render install button if no data', () => {
      comp.widget.defaultApp = false;
      comp.widget.installedApp = false;
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body .install-app-button'));
      expect(element).not.toBeNull();
    });

  });

  describe('Widget Store actions', () => {

    it('should open shop', () => {
      fixture.detectChanges();
      const platfService = TestBed.get(PlatformService);
      spyOn(platfService, 'dispatchEvent');

      comp.openShop('');

      expect(platfService.dispatchEvent).toHaveBeenCalled();
    });

    it('should set next shop', () => {
      let firstShop, NextShop;
      fixture.detectChanges();

      comp.shop$.pipe(take(1)).subscribe(s => firstShop = s);
      comp.showNextShop();
      comp.shop$.pipe(take(1)).subscribe(s => NextShop = s);

      expect(firstShop).not.toEqual(NextShop);
    });

    it('should open on ButtonClick', () => {
      fixture.detectChanges();

      const service = TestBed.get(MicroLoaderService);

      spyOn(service, 'loadScript').and.returnValue(new BehaviorSubject(''));
      comp.onOpenButtonClick();

      expect(service.loadScript).toHaveBeenCalled();
    });

  });

  describe('Widget Store data', () => {

    it('transactions amount should 0', () => {
      const envService: FakeEnvService = TestBed.get(EnvService);
      envService.businessIdStorage$.next(undefined);

      let transactionsAmount;

      fixture.detectChanges();

      comp.transactionsAmount$.subscribe(a => transactionsAmount = a);

      expect(transactionsAmount).toBe(0);
    });

    it('should hide spinner on getShops error', () => {
      let showSpinner;
      comp.showSpinner$.subscribe(s => showSpinner = s);
      const apiService = TestBed.get(WidgetsApiService);
      spyOn(apiService, 'getShops').and.returnValue(throwError({}));

      fixture.detectChanges();
      expect(apiService.getShops).toHaveBeenCalled();
      expect(showSpinner).toBe(false);
    });

    it('should hide spinner on loadMicroScript error', () => {
      let showSpinner;
      comp.showSpinner$.subscribe(s => showSpinner = s);
      const loaderService = TestBed.get(LoaderService);
      spyOn(loaderService, 'loadMicroScript').and.returnValue(throwError({}));

      fixture.detectChanges();
      comp.openShop('');

      expect(loaderService.loadMicroScript).toHaveBeenCalled();
      expect(showSpinner).toBe(false);
    });

    it('should get 0 if no transactions', () => {
      const apiService = TestBed.get(WidgetsApiService);
      let transactionsAmount;
      spyOn(apiService, 'getWeekTransactionsByChannelSet').and.returnValue(new BehaviorSubject([{}]));

      fixture.detectChanges();
      comp.transactionsAmount$.subscribe(t => transactionsAmount = t);

      expect(apiService.getWeekTransactionsByChannelSet).toHaveBeenCalled();
      expect(transactionsAmount).toBe(0);
    });

    // it('should get empty array if no products', () => {
    //   const apiService = TestBed.get(WidgetsApiService);
    //   let products;
    //   spyOn(apiService, 'getTopViewedProductsByChannelSet').and.returnValue(new BehaviorSubject(undefined));

    //   fixture.detectChanges();
    //   comp.products$.subscribe(t => products = t);

    //   expect(apiService.getTopViewedProductsByChannelSet).toHaveBeenCalled();
    //   expect(products.length).toBe(0);
    // });

  });
});
