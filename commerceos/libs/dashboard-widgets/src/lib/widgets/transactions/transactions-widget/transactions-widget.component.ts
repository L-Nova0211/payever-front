import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { combineLatest, EMPTY } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { Widget } from '@pe/widgets';

import { AmountDataInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';


@Component({
  selector: 'transactions-widget',
  templateUrl: './transactions-widget.component.html',
  styleUrls: ['./transactions-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  @Input() widget: Widget;

  readonly appName: string = 'transactions';

  constructor(
    injector: Injector,
    private currencyPipe: CurrencyPipe,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private editWidgetsService: EditWidgetsService,
  ) {
    super(injector);
    const TRANSACTIONS_LAST_DAILY = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_TRANSACTIONS_LAST_DAILY
      : MessageNameEnum.BUSINESS_TRANSACTIONS_LAST_DAILY;
    this.editWidgetsService.emitEventWithInterceptor(TRANSACTIONS_LAST_DAILY, {
      numDays: 7,
    });
    const TRANSACTIONS_LAST_MONTHLY = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_TRANSACTIONS_LAST_MONTHLY
      : MessageNameEnum.BUSINESS_TRANSACTIONS_LAST_MONTHLY;
    this.editWidgetsService.emitEventWithInterceptor(TRANSACTIONS_LAST_MONTHLY, {
      months: 3,
    });
  }

  ngOnInit() {
    combineLatest([
      this.editWidgetsService.transactionsMonthlySubject$,
      this.editWidgetsService.transactionsDailySubject$,
    ])
      .pipe(
        filter(
          ([monthlyData, dailyData]: [AmountDataInterface[], AmountDataInterface[]]) => !!monthlyData && !!dailyData,
        ),
        map(([monthlyData, dailyData]: [AmountDataInterface[], AmountDataInterface[]]) => {
          const currentMonth: AmountDataInterface = monthlyData[monthlyData.length - 1];
          const currentDay: AmountDataInterface = dailyData[dailyData.length - 1];
          const currentMonthAmount = currentMonth && currentMonth.amount ? currentMonth.amount : 0;
          const sign = currentMonthAmount > 0 ? '+' : '';
          const currency = monthlyData.length ? monthlyData[0]?.currency || 'EUR' : 'EUR';
          const currentDayAmount = currentDay && currentDay.amount ? currentDay.amount : 0;
          const dayCurrency = dailyData.length ? dailyData[0]?.currency || 'EUR' : 'EUR';
          this.widget = {
            ...this.widget,
            data: [
              {
                title: this.currencyPipe.transform(currentDayAmount, this.businessData.currency || currency.toUpperCase(), 'symbol'),
              },
              {
                title: this.translateService.translate('widgets.transactions.this-month'),
              },
              {
                title: `${sign}${this.currencyPipe.transform(
                  currentMonthAmount,
                  this.businessData.currency || dayCurrency.toUpperCase(),
                  'symbol',
                )}`,
                titleColor: sign === '+' ? 'green' : currentMonthAmount < 0 ? 'red' : null,
              },
            ],
            openButtonFn: () => {
              this.onOpenButtonClick();

              return EMPTY;
            },
          };

          this.cdr.detectChanges();

          return currentMonthAmount;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }
}
