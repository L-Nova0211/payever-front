import { HttpClient } from '@angular/common/http';
import { TestBed, async } from '@angular/core/testing';
import { FakeEnvironmentConfigService, FakeHttpClient } from 'test.helpers';

import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

import { WidgetsApiService } from './widgets-api.service';

// TODO: Made proper tests to all methods
describe('WidgetsApiService', () => {
  let service: WidgetsApiService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        WidgetsApiService,
        {
          provide: EnvironmentConfigService,
          useValue: new FakeEnvironmentConfigService(),
        },
        {
          provide: HttpClient,
          useValue: new FakeHttpClient(),
        },
      ],
    });
    service = TestBed.get(WidgetsApiService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get BusinessWidgets', () => {
    let result: any;
    service.getBusinessWidgets('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get PersonalWidgets', () => {
    let result: any;
    service.getPersonalWidgets().subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get WidgetTutorials', () => {
    let result: any;
    service.getWidgetTutorials('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should install Widget', () => {
    let result: any;
    service.installWidget('', '').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should uninstall Widget', () => {
    let result: any;
    service.uninstallWidget('', '').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should mark watched TutorialWidget', () => {
    let result: any;
    service.watchedTutorialWidget('', '').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get TransactionsDailyAmount', () => {
    let result: any;
    service.getTransactionsDailyAmount('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get TransactionsMonthlyAmount', () => {
    let result: any;
    service.getTransactionsMonthlyAmount('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get TransactionsPersonalDailyAmount', () => {
    let result: any;
    service.getTransactionsPersonalDailyAmount().subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get TransactionsPersonalMonthlyAmount', () => {
    let result: any;
    service.getTransactionsPersonalMonthlyAmount().subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get WeekTransactionsByChannelSet', () => {
    let result: any;
    service.getWeekTransactionsByChannelSet('', '').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get MarketingData', () => {
    let result: any;
    service.getMarketingData('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get Shops', () => {
    let result: any;
    service.getShops('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get ShopDomain', () => {
    let result: any;
    service.getShopDomain('', '').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get TopViewedProductsByChannelSet', () => {
    let result: any;
    service.getTopViewedProductsByChannelSet('', '').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get WeekPopularProducts', () => {
    let result: any;
    service.getWeekPopularProducts('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get MonthPopularProducts', () => {
    let result: any;
    service.getMonthPopularProducts('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get LastSoldProducts', () => {
    let result: any;
    service.getLastSoldProducts('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get WeekPopularProductsRandom', () => {
    let result: any;
    service.getWeekPopularProductsRandom('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get MonthPopularProductsRandom', () => {
    let result: any;
    service.getMonthPopularProductsRandom('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get LastSoldProductsRandom', () => {
    let result: any;
    service.getLastSoldProductsRandom('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get Terminals', () => {
    let result: any;
    service.getTerminals('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get BusinessIntegrations', () => {
    let result: any;
    service.getBusinessIntegrations('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get CheckoutIntegrations', () => {
    let result: any;
    service.getCheckoutIntegrations('', '').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get ChannelSets', () => {
    let result: any;
    service.getChannelSets('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get UninstalledConnections', () => {
    let result: any;
    service.getUninstalledConnections('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get UninstalledConnectionsFilteredByCountry', () => {
    let result: any;
    service.getUninstalledConnectionsFilteredByCountry('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should install Integration', () => {
    let result: any;
    service.installIntegration('', '').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should CheckoutList', () => {
    let result: any;
    service.getCheckoutList('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should IntegrationList', () => {
    let result: any;
    service.getIntegrationList('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

});
