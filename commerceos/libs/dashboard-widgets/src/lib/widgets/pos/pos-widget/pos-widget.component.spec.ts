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


import { BehaviorSubject, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  FakeEnvService, FakeRouter, FakeLoaderService, FakePlatformService,
  FakeTranslateService, FakeWallpaperService, FakeTranslationLoaderService,
  FakeEnvironmentConfigService, FakeMicroLoaderService, FakeMicroRegistryService, FakeHttpClient
} from 'test.helpers';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { PlatformService, CommonModule } from '@pe/ng-kit/modules/common';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { I18nModule, TranslateService, TranslationLoaderService } from '@pe/ng-kit/modules/i18n';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { MicroRegistryService, MicroLoaderService } from '@pe/ng-kit/modules/micro';
import { PosWidgetComponent } from '..';
import { WidgetsApiService } from '../../../services';
import { StoreInfoComponent, StoreStatsComponent } from '../../shared';

const terminals: any[] = [
  // tslint:disable-next-line:max-line-length
  { integrationSubscriptions: [], active: false, locales: ['en'], defaultLocale: 'en', _id: 'a6195309-dcd8-47ad-8f49-27dca764b020', default: true, logo: '', name: 'Terminal', channelSet: 'f186814a-0f15-4fd4-8e0c-30f1cabbb869', business: 'fbeca444-f5c5-4a7c-a326-7ad57556fd45', createdAt: '2019-01-20T08:54:02.727Z', updatedAt: '2019-03-10T17:27:00.616Z', __v: 0, theme: '838bb073-8289-47df-92eb-5197fcbbab1b' },
  // tslint:disable-next-line:max-line-length
  { integrationSubscriptions: [], active: false, locales: ['en'], defaultLocale: 'en', _id: '348e7731-f931-44c8-8795-bbc6c87a7ef9', name: 'Terminal #1', logo: null, channelSet: 'd64707c4-af26-4f6a-a3c9-d352034dadfa', business: 'fbeca444-f5c5-4a7c-a326-7ad57556fd45', createdAt: '2019-02-21T19:39:39.216Z', updatedAt: '2019-02-21T19:39:39.450Z', __v: 0, theme: 'de09da3a-c757-42c1-8236-755864277b46' },
];

const channelSets: any[] = [
  { checkout: 'f8f31cb5-ec92-43cc-b633-f2a5a0ed783f', id: '02f71c3b-6795-486a-b2cf-e6eed82d2ae4', type: 'link' },
  { checkout: 'f8f31cb5-ec92-43cc-b633-f2a5a0ed783f', id: 'feb3c426-2172-4bf8-93fd-239fc42266cb', type: 'finance_express' },
  // tslint:disable-next-line:max-line-length
  { checkout: 'f8f31cb5-ec92-43cc-b633-f2a5a0ed783f', id: 'f186814a-0f15-4fd4-8e0c-30f1cabbb869', name: 'Terminal', type: 'marketing' },
  { checkout: 'f8f31cb5-ec92-43cc-b633-f2a5a0ed783f', id: 'e500adf7-5657-4d74-b482-be607c83724f', type: 'marketing' },
];

const intergrations: any[] = [
  // tslint:disable-next-line:max-line-length
  { installed: false, _id: '21eb2e15-bb9e-43a8-9123-545964ee1d28', integration: { _id: '378f1080-aff6-4199-a287-20da11afbfe8', name: 'api', category: 'shopsystems', displayOptions: { _id: 'd32ea486-b8e8-41e8-849c-40202988c801', icon: '#icon-api', title: 'API' }, createdAt: '2018-11-12T18:13:41.340Z', updatedAt: '2018-11-12T18:13:41.340Z', __v: 0 }, createdAt: '2019-02-11T16:47:03.041Z', updatedAt: '2019-03-10T12:13:17.351Z', __v: 0 },
  // tslint:disable-next-line:max-line-length
  { installed: true, _id: 'e2d9fbfa-1375-453c-b381-359313024a50', integration: { _id: 'ffb0b18f-dbce-4ca8-b9e7-905f67bb7ba3', name: 'shipping', category: 'payments', displayOptions: { _id: 'e80b134a-15f6-4396-ae65-a4360ab64a6e', icon: '#icon-payment-option-wire-transfer', title: 'integrations.payments.cash.title' }, createdAt: '2018-11-12T18:13:41.340Z', updatedAt: '2018-11-12T18:13:41.340Z', __v: 0 }, createdAt: '2019-01-09T16:41:36.105Z', updatedAt: '2019-01-10T09:33:35.187Z', __v: 0, enabled: false },
];

const checkoutIntegrations: string[] = ['shipping'];

class FakeWidgetsApiService {
  terminals$ = new BehaviorSubject(terminals);
  wTransactions$ = new BehaviorSubject([]);
  topProducts$ = new BehaviorSubject([]);
  getTerminals = () => this.terminals$;
  getChannelSets = () => new BehaviorSubject(channelSets);
  getBusinessIntegrations = () => new BehaviorSubject(intergrations);
  getWeekTransactionsByChannelSet = () => this.wTransactions$;
  getTopViewedProductsByChannelSet = () => this.topProducts$;
  getCheckoutIntegrations = () => new BehaviorSubject(checkoutIntegrations);
}

describe('PosWidgetComponent', function () {
  let comp: PosWidgetComponent;
  let fixture: ComponentFixture<PosWidgetComponent>;

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
        PosWidgetComponent,
        WidgetCardComponent,
        WidgetStatisticsComponent,
        WidgetActionButtonComponent,
        StoreInfoComponent,
        StoreStatsComponent,
      ],
      providers: [
        {
          provide: WidgetsApiService,
          useValue: new FakeWidgetsApiService(),
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
    fixture = TestBed.createComponent(PosWidgetComponent);
    comp = fixture.componentInstance;
    comp.widget = {
      _id: '',
      defaultApp: true,
      installedApp: true,
      icon: '',
      title: 'POS',
      type: '',
      installed: true,
    };
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Widget POS content header', () => {

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

  describe('Widget POS content body', () => {

    it('should render install button if no data', () => {
      comp.widget.defaultApp = false;
      comp.widget.installedApp = false;
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body .install-app-button'));
      expect(element).not.toBeNull();
    });

  });

  describe('Widget POS actions', () => {

    it('should open terminal', () => {
      fixture.detectChanges();

      const platformService = TestBed.get(PlatformService);
      spyOn(platformService, 'dispatchEvent');

      comp.onTerminalEditClick();

      expect(platformService.dispatchEvent).toHaveBeenCalled();
    });

    it('should open terminal with micro loading error', () => {
      fixture.detectChanges();

      const loaderService = TestBed.get(LoaderService);
      spyOn(loaderService, 'loadMicroScript').and.returnValue(throwError({}));

      comp.onTerminalEditClick();

      expect(loaderService.loadMicroScript).toHaveBeenCalled();
    });

    it('should show next termial', () => {
      let firstTerminal, nextTerminal;
      fixture.detectChanges();

      comp.terminal$.pipe(take(1)).subscribe(t => firstTerminal = t);

      comp.showNextTerminal();
      comp.terminal$.pipe(take(1)).subscribe(t => nextTerminal = t);

      expect(firstTerminal !== nextTerminal).toBeTruthy();

      // should return the first one
      comp.showNextTerminal();
      comp.terminal$.pipe(take(1)).subscribe(t => nextTerminal = t);

      expect(firstTerminal === nextTerminal).toBeTruthy();
    });

  });

  describe('Widget POS data', () => {

    it('should get empty terminal if no terminals', () => {
      let  terminal: any;
      TestBed.get(WidgetsApiService).terminals$.next(undefined);

      fixture.detectChanges();

      comp.terminal$.subscribe(a => terminal = a);

      expect(terminal).not.toBeDefined();
    });

    it('should get 0 if no transactions', () => {
      let  transactionsAmount;
      fixture.detectChanges();

      comp.transactionsAmount$.subscribe(a => transactionsAmount = a);
      comp.terminal$.next(undefined);

      expect(transactionsAmount).toEqual(0);
    });

    it('should calculate transactions amount', () => {
      let  transactionsAmount;
      TestBed.get(WidgetsApiService).wTransactions$.next([
        { },
        { amount: 1 },
        { amount: 2 },
      ]);

      fixture.detectChanges();

      comp.transactionsAmount$.subscribe(a => transactionsAmount = a);

      expect(transactionsAmount).toEqual(3);
    });

    it('should get empty array if no top products', () => {
      let  products: any[];
      TestBed.get(WidgetsApiService).topProducts$.next(undefined);

      fixture.detectChanges();

      comp.products$.subscribe(a => products = a);

      expect(products).toBeDefined();
      expect(products.length).toEqual(0);
    });

    it('should get products', () => {
      let list;
      fixture.detectChanges();

      comp.products$.subscribe(a => list = a);

      expect(list).toEqual([]);
    });

    it('should get terminal', () => {
      let list;
      fixture.detectChanges();

      comp.terminal$.subscribe(a => list = a);

      expect(list).toBe(terminals[0]);
    });

    it('should get paymentOptions', () => {
      let list;
      fixture.detectChanges();

      comp.paymentOptions$.subscribe(a => list = a);

      expect(list).toEqual([{
        icon: intergrations[1].integration.displayOptions.icon,
        title: intergrations[1].integration.displayOptions.title,
      }]);
    });

    it('should get transactionsAmount', () => {
      let list;
      fixture.detectChanges();

      comp.transactionsAmount$.subscribe(a => list = a);

      expect(list).toBe(0);
    });

  });

});
