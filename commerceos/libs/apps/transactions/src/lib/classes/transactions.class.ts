import { ComponentFactoryResolver, Injector, ViewContainerRef } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';

import { PeDataGridPaginator, EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { PeGridItem, PeGridItemType } from '@pe/grid';
import { CurrencyPipe, LocaleConstantsService } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';

import { ChannelComponent } from '../routes/list/components/channel/channel-component';
import { CreatedAtCellComponent } from '../routes/list/components/created-at-cell/created-at-cell.component';
import { PaymentComponent } from '../routes/list/components/payment/payment-component';
import { SpecificStatusFieldComponent } from '../routes/list/components/specific-status/specific-status.component';
import { StatusComponent } from '../routes/list/components/status/status-component';
import { TransactionsListService } from '../services/list.service';
import { StatusUpdaterService } from '../services/status-updater.service';
import { ValuesService } from '../services/values.service';
import { FiltersFieldType, SortInterface, TransactionInterface } from '../shared/interfaces';

export class TransactionsClass {
  activeColumns = [];
  sortData: SortInterface = {
    orderBy: '',
    direction: '',
  };

  paginator: PeDataGridPaginator = {
    page: 0,
    perPage: 50,
    total: 10,
  }

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  isFoldersLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  totalItems$ = new BehaviorSubject<number>(0);

  private env: EnvironmentConfigInterface = this.injector.get(PE_ENV);
  protected currencyPipe: CurrencyPipe = this.injector.get(CurrencyPipe);
  protected listService = this.injector.get(TransactionsListService);
  protected localeConstantsService = this.injector.get(LocaleConstantsService);
  protected translateService = this.injector.get(TranslateService);
  protected statusUpdaterService = this.injector.get(StatusUpdaterService);
  protected viewContainerRef = this.injector.get(ViewContainerRef);
  protected valuesService: ValuesService = this.injector.get(ValuesService);
  protected componentFactoryResolver: ComponentFactoryResolver = this.injector.get(ComponentFactoryResolver);

  channelComponentFactory = this.componentFactoryResolver.resolveComponentFactory(ChannelComponent);
  statusComponentFactory = this.componentFactoryResolver.resolveComponentFactory(StatusComponent);
  paymentComponentFactory = this.componentFactoryResolver.resolveComponentFactory(PaymentComponent);
  createdAtCellComponentFactory = this.componentFactoryResolver.resolveComponentFactory(CreatedAtCellComponent);
  specificStatusFieldComponentFactory = this.componentFactoryResolver.resolveComponentFactory(SpecificStatusFieldComponent);

  constructor(
    protected injector: Injector
  ) {

  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  setPaginator(data: any) {
    this.paginator = {
      ...this.paginator,
      page: data.page - 1,
      total: data.total,
    }
    this.totalItems$.next(data.total);
  }

  transactionGridItemPipe(transaction: TransactionInterface): PeGridItem<TransactionInterface> {
    return {
      id: transaction._id,
      image: null, // this.env.custom.cdn + '/icons-transactions/mobile-item.svg',
      thumbnail: {
        cellComponentFactory: this.channelComponentFactory,
      },
      title: transaction.customer_name,
      type: PeGridItemType.Item,
      data: {
        ...transaction,
        text: this.currencyPipe.transform(transaction.total_left || 0, transaction.currency, undefined, undefined, this.locale),
      },
      itemLoader$: new BehaviorSubject<boolean>(false),
      action: {
        label: this.translateService.translate('transactions.actions.open'),
        more: true,
      },
      badge: {
        backgroundColor: '#3a3941',
        color: '#a6a5ac',
        cellComponentFactory: this.statusComponentFactory,
      },
      columns: [
        {
          name: FiltersFieldType.CreatedAt,
          value:  moment(transaction.created_at, undefined, this.locale).format('DD MMMM YYYY HH:mm'),
          customStyles: {
            opacity: '.6',
          },
        },
        {
          name: FiltersFieldType.Status,
          value: transaction.status,
        },
        {
          name: FiltersFieldType.SpecificStatus,
          value: transaction.specific_status,
        },
        {
          name: FiltersFieldType.Channel,
          value: transaction.channel,
          label: this.getChannelTranslate(transaction.channel),
        },
        {
          name: FiltersFieldType.Total,
          value: this.currencyPipe.transform(transaction.total_left || 0, transaction.currency, undefined, undefined, this.locale),
          customStyles: {
            'font-weight': 'bold',
          },
        },
        {
          name: FiltersFieldType.Currency,
          value: transaction.currency,
        },
        {
          name: FiltersFieldType.SellerEmail,
          value: transaction.seller_email,
        },
        {
          name: FiltersFieldType.SellerName,
          value: transaction.seller_name,
        },
        {
          name: FiltersFieldType.SellerId,
          value: transaction.seller_id,
        },
        {
          name: FiltersFieldType.CustomerEmail,
          value: transaction.customer_email,
        },
        {
          name: FiltersFieldType.CustomerName,
          value: transaction.customer_name,
        },
        {
          name: FiltersFieldType.MerchantEmail,
          value: transaction.merchant_email,
        },
        {
          name: FiltersFieldType.MerchantName,
          value: transaction.merchant_name,
        },
        {
          name: FiltersFieldType.Type,
          value: transaction.type,
          label: this.translateService.translate(`integrations.payments.${transaction.type}.title`),
        },
        {
          name: FiltersFieldType.OriginalId,
          value: transaction.original_id,
          customStyles: {
            opacity: '.6',
          },
        },
        {
          name: FiltersFieldType.Reference,
          value: transaction.reference,
        },
      ],
    };
  }

  onChangePage(page: number) {
    this.paginator.page = page;
    this.listService.loadTransactionsTrigger$.next(true);
  }

  private getChannelTranslate(channelName: string): string {
    const channel = this.valuesService.channels[channelName];

    return this.translateService.translate(channel?.label);
  }
}

