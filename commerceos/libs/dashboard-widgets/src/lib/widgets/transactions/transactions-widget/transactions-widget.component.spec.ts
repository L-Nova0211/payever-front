import { Pipe, PipeTransform } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppLauncherService, EnvService, HeaderService, WallpaperService } from '@app/services';
import { WidgetActionButtonComponent, WidgetCardComponent, WidgetStatisticsComponent } from '@modules/dashboard/shared-dashboard/components';
import { EditWidgetsService } from '@modules/dashboard/shared-dashboard/services';
import { LoaderService, ApiService } from '@modules/shared/services';
import { BehaviorSubject } from 'rxjs';
import { FakeWindowService, FakeRouter, FakeTranslateService, FakeMediaService } from 'test.helpers';

import { ButtonModule } from '@pe/ng-kit/modules/button';
import { PlatformService } from '@pe/ng-kit/modules/common';
import { I18nModule, TranslateService } from '@pe/ng-kit/modules/i18n';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';
import { WindowService } from '@pe/ng-kit/modules/window';
import { SafeStylePipe, IconsPngUrlPipe, MediaService } from '@pe/ng-kit/src/kit/media';

import { TransactionsWidgetComponent, TransactionsChartComponent } from '../';
import { WidgetsApiService } from '../../../services';
import { ChartLegendComponent } from '../../shared';


const last_monthly: any[] = [
  { date: '2018-05', amount: 0, currency: 'EUR' },
  { date: '2018-06', amount: 0, currency: 'EUR' },
  { date: '2018-07', amount: 0, currency: 'EUR' },
  { date: '2018-08', amount: 0, currency: 'EUR' },
  { date: '2018-09', amount: 0, currency: 'EUR' },
  { date: '2018-10', amount: 0, currency: 'EUR' },
  { date: '2018-11', amount: 0, currency: 'EUR' },
  { date: '2018-12', amount: 0, currency: 'EUR' },
  { date: '2019-01', amount: 0, currency: 'EUR' },
  { date: '2019-02', amount: 0, currency: 'EUR' },
  { date: '2019-03', amount: 0, currency: 'EUR' },
  { date: '2019-04', amount: 0, currency: 'EUR' },
  { date: '2019-05', amount: 650, currency: 'EUR' },
];

const last_daily: any[] = [
  { date: '2019-05-01', amount: 0, currency: 'USD' },
  { date: '2019-05-02', amount: 0, currency: 'USD' },
  { date: '2019-05-03', amount: 0, currency: 'USD' },
  { date: '2019-05-04', amount: 0, currency: 'USD' },
  { date: '2019-05-05', amount: 0, currency: 'USD' },
  { date: '2019-05-06', amount: 0, currency: 'USD' },
  { date: '2019-05-07', amount: 0, currency: 'USD' },
  { date: '2019-05-08', amount: 0, currency: 'USD' },
  { date: '2019-05-09', amount: 0, currency: 'USD' },
  { date: '2019-05-10', amount: 0, currency: 'USD' },
  { date: '2019-05-11', amount: 0, currency: 'USD' },
  { date: '2019-05-12', amount: 0, currency: 'USD' },
  { date: '2019-05-13', amount: 0, currency: 'USD' },
  { date: '2019-05-14', amount: 0, currency: 'USD' },
  { date: '2019-05-15', amount: 0, currency: 'USD' },
  { date: '2019-05-16', amount: 0, currency: 'USD' },
  { date: '2019-05-17', amount: 0, currency: 'USD' },
  { date: '2019-05-18', amount: 0, currency: 'USD' },
  { date: '2019-05-19', amount: 0, currency: 'USD' },
  { date: '2019-05-20', amount: 0, currency: 'USD' },
  { date: '2019-05-21', amount: 0, currency: 'USD' },
  { date: '2019-05-22', amount: 0, currency: 'USD' },
  { date: '2019-05-23', amount: 0, currency: 'USD' },
  { date: '2019-05-24', amount: 0, currency: 'USD' },
  { date: '2019-05-25', amount: 0, currency: 'USD' },
  { date: '2019-05-26', amount: 0, currency: 'USD' },
  { date: '2019-05-27', amount: 0, currency: 'USD' },
  { date: '2019-05-28', amount: 0, currency: 'USD' },
  { date: '2019-05-29', amount: 0, currency: 'USD' },
  { date: '2019-05-30', amount: 0, currency: 'USD' },
  { date: '2019-05-31', amount: 650, currency: 'USD' },
];

@Pipe({
  name: 'translate',
  pure: true,
})
class FakeTranslatePipe implements PipeTransform {
  transform(input: string): string {
    return input;
  }
}

class FakeWidgetsApiService {
  personalDailyAmount$ = new BehaviorSubject(last_daily);
  dailyAmount$ = new BehaviorSubject(last_daily);
  monthlyAmount$ = new BehaviorSubject(last_monthly);
  getTransactionsPersonalDailyAmount = () => this.personalDailyAmount$;
  getTransactionsDailyAmount = () => this.dailyAmount$;
  getTransactionsMonthlyAmount = () => this.monthlyAmount$;
  getTransactionsPersonalMonthlyAmount = () => this.monthlyAmount$;
}

const PeriodLabels: string[] = [
  'widgets.transactions.1-month',
  'widgets.transactions.3-months',
  'widgets.transactions.6-months',
  'widgets.transactions.1-year',
];

describe('TransactionsWidgetComponent', function () {
  let comp: TransactionsWidgetComponent;
  let fixture: ComponentFixture<TransactionsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        I18nModule,
        MatProgressSpinnerModule,
        MatCardModule,
      ],
      declarations: [
        TransactionsWidgetComponent,
        WidgetCardComponent,
        WidgetActionButtonComponent,
        WidgetStatisticsComponent,
        WidgetStatisticsComponent,
        TransactionsChartComponent,
        ChartLegendComponent,
        FakeTranslatePipe,
        SafeStylePipe,
        IconsPngUrlPipe,
      ],
      providers: [
        {
          provide: WindowService,
          useValue: new FakeWindowService(600),
        },
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
          useValue: {},
        },
        {
          provide: EnvService,
          useValue: {},
        },
        {
          provide: Router,
          useValue: new FakeRouter(),
        },
        {
          provide: LoaderService,
          useValue: {},
        },
        {
          provide: PlatformService,
          useValue: {},
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
          useValue: {},
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
    fixture = TestBed.createComponent(TransactionsWidgetComponent);
    comp = fixture.componentInstance;
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Widget Transactions content header', () => {

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

  describe('Widget Transactions content body', () => {

    it('should render the chart', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content transactions-chart'));
      expect(element).not.toBeNull();
    });

    it('should render the legend', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content chart-legend'));
      expect(element).not.toBeNull();
    });

    it('should render today revenue', () => {
      fixture.detectChanges();
      const elements = fixture.debugElement
        .queryAll(By.css('.widget-card-content .transactions-revenue span'));
      expect(elements.length).toEqual(3);
    });

    describe('More panel', () => {
      it('should render periods', () => {
        fixture.detectChanges();
        const elements = fixture.debugElement
        .queryAll(By.css('.widget-card-content-more .transactions-quarters-item'));

        let resultArray;
          resultArray = elements.map(el => el.nativeElement.innerHTML);

        expect(resultArray).toEqual(jasmine.arrayContaining(PeriodLabels));
      });

      it('should render periods values', () => {
        let periodValues: any[];
        fixture.detectChanges();
        const elements = fixture.debugElement
          .queryAll(By.css('.widget-card-content-more .transactions-quarters-value'));

        comp.periodData$.subscribe(d => periodValues = d);
        expect(elements.length).toEqual(PeriodLabels.length);
      });
    });

  });

  describe('Widget Transactions data', () => {

    it('should get 0 if no current month', () => {
      const apiService = TestBed.get(WidgetsApiService);
      apiService.monthlyAmount$.next(last_monthly.filter(d => d.date !== '2019-05'));
      let currentMonthAmount = 1;
      fixture.detectChanges();
      comp.currentMonthAmount$.subscribe(d => currentMonthAmount = d);
      expect(currentMonthAmount).toBe(0);
    });

    it('should get last object if date is invalid', () => {
      const apiService = TestBed.get(WidgetsApiService);
      apiService.dailyAmount$.next([
        {
          date: '',
          amount: 0,
        },
      ]);
      let todayData = null;
      fixture.detectChanges();
      comp.todayDailyAmountData$.subscribe(d => todayData = d);
      expect(todayData).toEqual({
        date: '',
        amount: 0,
      });
    });

    it('should get 0 if no daily amount', () => {
      const apiService = TestBed.get(WidgetsApiService);
      apiService.dailyAmount$.next([]);
      let todayData = null;
      fixture.detectChanges();
      comp.todayAmount$.subscribe(d => todayData = d);
      expect(todayData).toBe(0);
    });

    it('should get monthly amount for personal', () => {
      const envService = TestBed.get(EnvService);
      let todayData;

      envService.isPersonalMode = true;

      comp.ngOnInit();
      fixture.detectChanges();
      comp.currentMonthAmount$.subscribe(d => todayData = d);
      expect(todayData).toBe(650);
    });

    it('should sort daily amounts', () => {
      let todayData;

      comp.compareWithPastDay$.subscribe(d => todayData = d);

      comp.dailyAmount$.next(last_daily.map((d) => {
        if (d.date === '2019-05-13') {
          return {
            ...d,
            amount: 10,
          }
        }

        return d;
      }));
      expect(todayData).toBe(-1);

      comp.dailyAmount$.next(last_daily.map((d) => {
        if (d.date === '2019-05-13') {
          return {
            ...d,
            amount: -10,
          }
        }

        return d;
      }));
      expect(todayData).toBe(1);
    });

    it('should sort monthly amounts', () => {
      let todayData;

      comp.compareWithPastMonth$.subscribe(d => todayData = d);
      comp.monthlyAmount$.next(last_monthly.map((d) => {
        if (d.date === '2019-04') {
          return {
            ...d,
            amount: 10,
          };
        }

        return d;
      }));
      expect(todayData).toBe(1);

      comp.monthlyAmount$.next(last_monthly.map((d) => {
        if (d.date === '2019-04') {
          return {
            ...d,
            amount: 660,
          };
        }

        return d;
      }));
      expect(todayData).toBe(-1);

    });

  });

});
