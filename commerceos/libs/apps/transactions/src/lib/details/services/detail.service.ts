/* eslint-disable no-underscore-dangle */
import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { findLast, forEach, forIn } from 'lodash-es';
import { Observable, Subject, of, throwError, ReplaySubject, BehaviorSubject } from 'rxjs';
import { catchError, map, share } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout-wrapper-sdk-types';
import { AddressService } from '@pe/forms-core';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { ApiService } from '../../services/api.service';
import { SettingsService } from '../../services/settings.service';
import { BodyDataInterface } from '../../shared';
import { ActionTypeEnum } from '../../shared/interfaces/action.type';
import {
  ActionRequestInterface,
  ActionRequestRefundItemsInterface,
  DetailInterface,
  ItemInterface,
  OrderHistoryInterface,
  RefundItemsInterface,
} from '../../shared/interfaces/detail.interface';
import { SantanderAppSpecificStateType, StatusType } from '../../shared/interfaces/status.type';


export interface PaymentCodeInterface {
  _id: string;
  code: string;
}

export const constants: { [propName: string]: string | number } = {
  SANTANDER_DE_POS_ALLOW_CONTRACT_DOWNLOAD_TIMEOUT: 28 * 24 * 60 * 60 * 1000, // 28 days in ms
  SANTANDER_DE_POS_SHOW_CREDIT_ANSWER_TIMEOUT: 28 * 24 * 60 * 60 * 1000,
};

@Injectable()
export class DetailService {

  welcomeShown = false;
  sectionsSubTitles = null;
  timelineItems: any[] = [];
  isReady$ = new BehaviorSubject<boolean>(true);

  private orderId: string = null;
  private order: DetailInterface = null;
  private order$: Observable<DetailInterface> = null;
  private resetSubject$: Subject<boolean> = new Subject<boolean>();
  private loadingSubject$ = new ReplaySubject<boolean>();

  constructor(
    private apiService: ApiService,
    private localeConstantsService: LocaleConstantsService,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    private addressService: AddressService,
    private currency: CurrencyPipe,
    private snackbarService: SnackbarService
  ) {
    this.resetSubject$.next(false);
  }

  set loading(value: boolean) {
    this.loadingSubject$.next(value);
  }

  get loading$(): Observable<boolean> {
    return this.loadingSubject$.asObservable();
  }

  set reset(value: boolean) {
    this.resetSubject$.next(value);
  }

  get reset$(): Observable<boolean> {
    return this.resetSubject$.asObservable();
  }

  get orderData(): DetailInterface {
    return this.order;
  }

  set orderData(val) {
    this.order = val;
  }

  get quantity(): number {
    return this.order.cart.items?.reduce((acc, item) => acc += item.quantity, 0) ?? 0;
  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  getData(orderId: string, reset: boolean = false): Observable<DetailInterface> {
    if (!reset && this.order$ && this.orderId === orderId) {
      return this.order$;
    } else if (reset || this.orderId !== orderId) {

      this.isReady$.next(false);
      this.loading = true;
      this.reset = false;
      this.orderId = orderId;
      this.order$ = this.apiService.getTransactionDetails(this.orderId).pipe(
        map((order) => {
          this.order = order;
          this.makeItemsArray();
          this.compileData();
          this.initOrderPaymentType();
          this.initSantander();
          this.initTimeline(this.order.history);
          this.initSectionsSubTitle(this.order);
          this.order$ = null;
          this.loading = false;
          this.isReady$.next(true);

          return this.order;
        }),
        catchError((error: any) => {
          this.showError();

          return throwError(error);
        }),
        share());

      return this.order$;
    }
    else {
      return of(this.order);
    }
  }

  private initTimeline(historyItems: OrderHistoryInterface[]): void {
    this.timelineItems = [];
    const translationsScope = 'transactions.sections.timeline';

    historyItems.forEach(item => {
      const by = this.translateService.translate(`${translationsScope}.by`);
      const reason = this.translateService.translate(`${translationsScope}.reason`);
      const byUser = item?.user ? `${by} ${item?.user?.email}` : '';
      switch (item.action) {
        case ActionTypeEnum.ChangeAmount:
        case ActionTypeEnum.Change_Amount:
          this.timelineItems.push({
            date: item.created_at,
            text: this.translateService.translate(`${translationsScope}.action.` + item.action, {
              amount: this.currency.transform(item.amount, this.order.transaction.currency, undefined, undefined, this.locale),
              byUser,
            }),
          });
          break;
        case ActionTypeEnum.EditReference:
          this.timelineItems.push({
            date: item.created_at,
            text: this.translateService.translate(`${translationsScope}.action.change_reference`, {
              reference: item.reference,
              byUser,
            }),
          });
          break;
        case ActionTypeEnum.Upload:
          this.timelineItems.push({
            date: item.created_at,
            text: this.translateService.translate(`${translationsScope}.action.` + item.action, {
              byUser,
            }),
          });
          break;
        case ActionTypeEnum.StatusChanged:
        case ActionTypeEnum.StatusChangedOld:
          this.timelineItems.push({
            date: item.created_at,
            text: this.translateService.translate(`${translationsScope}.action.` + item.action, {
              payment_status: this.translateService.translate(`${translationsScope}.statuses.general.` + item.payment_status),
              byUser,
            }),
          });
          break;
        case ActionTypeEnum.PSPStatusChanged:
            this.timelineItems.push({
              date: item.created_at,
              text: this.translateService.translate(`${translationsScope}.action.` + item.action, {
                pspStatus: this.translateService.hasTranslation(`${translationsScope}.statuses.psp.` + item.psp_status)
                  ? this.translateService.translate(`${translationsScope}.statuses.psp.` + item.psp_status)
                  : item.psp_status,
                requirementsState: this.translateService.hasTranslation(`${translationsScope}.requirements.${item.requirements_state}`)
                  ? this.translateService.translate(`${translationsScope}.requirements.${item.requirements_state}`)
                  : '',
              }),
            });
            break;
        case ActionTypeEnum.Refund:
          item.refund_items?.forEach(refundItem => {
            this.timelineItems.push({
              date: item.created_at,
              text: this.translateService.translate(`${translationsScope}.action.` + item.action + '.items', {
                count: refundItem.count,
                item: this.order._itemsArray[refundItem.item_uuid].name,
                reason: item.reason ? `. ${reason}: ${item.reason}` : '',
                byUser,
              }),
            });
          });
          if (!item.refund_items.length) {
            this.timelineItems.push({
              date: item.created_at,
              text: this.translateService.translate(`${translationsScope}.action.` + item.action + '.amount', {
                amount: this.currency.transform(item.amount, this.order.transaction.currency, undefined, undefined, this.locale),
                reason: item.reason ? `. ${reason}: ${item.reason}` : '',
                byUser,
              }),
            });
          }
          break;
        case ActionTypeEnum.Capture:
          this.timelineItems.push({
            date: item.created_at,
            text: item.amount ?
              this.translateService.translate(`${translationsScope}.action.capture_with_amount`, {
                amount: this.currency.transform(item.amount, this.order.transaction.currency, undefined, undefined, this.locale),
                byUser,
              }) :
              this.translateService.translate(`${translationsScope}.action.capture`, { byUser }),
          });
          break;
        case ActionTypeEnum.ApplicationUpdated:
          this.timelineItems.push({
            date: item.created_at,
            text: this.translateService.translate(`${translationsScope}.action.application_updated`, { byUser }),
          });
          break;
        case ActionTypeEnum.Edit:
          this.timelineItems.push({
            date: item.created_at,
            text: this.translateService.translate(`${translationsScope}.action.edit`, { byUser }),
          });
          break;
        case ActionTypeEnum.Cancel:
          this.timelineItems.push({
            date: item.created_at,
            text: this.translateService.translate(`${translationsScope}.action.` + item.action, {
              amount: this.currency.transform(item.amount, this.order.transaction.currency, undefined, undefined, this.locale),
              reason: item.reason ? `. ${reason}: ${item.reason}` : '',
              byUser,
            }),
          });
          break;
        case ActionTypeEnum.ShippingGoods:
          this.timelineItems.push({
            date: item.created_at,
            text: this.translateService.translate(`${translationsScope}.action.` + item.action, {
              amount: this.currency.transform(item.amount, this.order.transaction.currency, undefined, undefined, this.locale),
              byUser,
            }),
          });
          break;
        case ActionTypeEnum.ContractSigned:
          this.timelineItems.push({
            date: item.created_at,
            text: this.translateService.translate(`${translationsScope}.action.` + item.action, {
              byUser,
            }),
          });
          break;
        case ActionTypeEnum.ContractDownloaded:
          this.timelineItems.push({
            date: item.created_at,
            text: this.translateService.translate(`${translationsScope}.action.` + item.action, {
              byUser,
            }),
          });
          break;
          case ActionTypeEnum.SignatureWithdrawn:
            this.timelineItems.push({
              date: item.created_at,
              text: this.translateService.translate(`${translationsScope}.action.` + item.action, {
                byUser,
              }),
            });
            break;
        default: {
          this.timelineItems.push({
            date: item.created_at,
            text: this.translateService.translate(`${translationsScope}.action.` + item.action, { byUser }),
          });
        }

      }
    });
  }

  private initSectionsSubTitle(order: DetailInterface): void {
    this.sectionsSubTitles = {
      products: this.translateService.translate('transactions.sections.products.subtitle', { amount: this.quantity }),
      order: this.translateService.translate('transactions.sections.order.subtitle', { id: order?.transaction.original_id }),
      shipping: order?.shipping?.method_name?.toUpperCase()
        || this.order.shipping?.address ? this.addressService.getNameString(this.order.shipping?.address) : '-',
      billing: this.addressService.getNameString(this.order.billing_address),
      payment: this.translateService.translate('integrations.payments.' + order.payment_option.type + '.title'),
      timeline: this.timelineItems[0]?.text,
      details: this.translateService.translate('transactions.sections.details.subtitle', {
        total: this.currency.transform(order.transaction.total_left || 0, order.transaction.currency, undefined, undefined, this.locale),
      }),
    };
  }

  actionOrder(
    orderId: string,
    data: ActionRequestInterface,
    action: ActionTypeEnum,
    dataKey: string,
    serialize: boolean = false,
    bodyData?: BodyDataInterface,
  ): Observable<DetailInterface> {
    let requestBody: { [propName: string]: ActionRequestInterface } | ActionRequestInterface | string;

    let requestData: { [propName: string]: ActionRequestInterface } | ActionRequestInterface = {};
    if (serialize) {
      requestData[dataKey] = data;
      requestBody = this.makeFormData(requestData as any);
      if (!requestBody) {
        requestBody = dataKey === 'payment_shipping_goods' ? ({ payment_shipping_goods: {} } as any) : dataKey;
      }
    }
    else {
      if (dataKey) {
        requestData[dataKey] = data;
      } else {
        requestData = data;
      }

      requestBody = {
        ...bodyData,
        fields: requestData,
      };
    }

    return this.apiService.postAction(this.settingsService.businessUuid, orderId, action, requestBody).pipe(
      map((response: any) => {
        this.reset = true;

        return response;
      }),
      catchError(error => {
        return throwError({
          message: this.translateService.hasTranslation(`transactions.action-errors.${action}`)
            ? this.translateService.translate(`transactions.action-errors.${action}`)
            : this.translateService.translate('transactions.errors.unknown'),
        });
      })
    );
  }

  private makeItemsArray(): void {
    this.order._itemsArray = {};
    forEach(this.order.cart.items, (item: ItemInterface) => this.order._itemsArray[item.identifier] = item);
  }

  private compileData(): void {
    this.order.payment_option.down_payment = +this.order.payment_option.down_payment || 0;
    this.order._refundItems = [];
    this.order._refundFixedAmount = 0;
    this.order._refundReason = null;
    this.order._showSantanderDeQr = false;
    const refundReason: string[] = [];
    if (this.order.history) {
      forEach(this.order.history, (historyItem: OrderHistoryInterface) => {
        if (historyItem.action === 'refund') {
          if (historyItem.refund_items.length > 0) {
            forEach(historyItem.refund_items, (refundItem: RefundItemsInterface) => {
              let counted = false;
              forEach(this.order._refundItems, (item: RefundItemsInterface, index: number) => {
                if (item.payment_item_id === refundItem.payment_item_id) {
                  this.order._refundItems[index].count += refundItem.count;
                  counted = true;
                }
              });
              if (!counted) {
                this.order._refundItems.push(refundItem);
              }
            });
          }
          else {
            this.order._refundFixedAmount += (+historyItem.amount);
          }
          if (historyItem.reason) {
            refundReason.push(historyItem.reason);
          }
        }
      });
    } else {
      this.order.history = [];
    }
    if (refundReason.length > 0) {
      this.order._refundReason = refundReason.join(', ');
    }

    if (this.order.details) {
      // masking iban
      if (this.order.details.order.iban) {
        this.order.details.order.iban = `**** ${this.order.details.order.iban.replace(/\s/g, '').slice(-4)}`;
      }
    }
  }

  private initOrderPaymentType(): void {
    switch (this.order.payment_option.type) {
      case PaymentMethodEnum.CASH:
        this.order._isCash = true;
        break;
      case PaymentMethodEnum.INVOICE:
        this.order._isInvoice = true;
        break;
      case PaymentMethodEnum.PAYEX_CREDITCARD:
      case PaymentMethodEnum.PAYEX_FAKTURA:
        this.order._isPayex = true;
        break;
      case PaymentMethodEnum.SWEDBANK_CREDITCARD:
      case PaymentMethodEnum.SWEDBANK_INVOICE:
        this.order._isSwedbank = true;
        break;
      case PaymentMethodEnum.PAYMILL_CREDITCARD:
      case PaymentMethodEnum.PAYMILL_DIRECTDEBIT:
        this.order._isPaymill = true;
        break;
      case PaymentMethodEnum.PAYPAL:
        this.order._isPaypal = true;
        break;
      case PaymentMethodEnum.SOFORT:
        this.order._isSofort = true;
        break;
      case PaymentMethodEnum.STRIPE:
      case PaymentMethodEnum.STRIPE_DIRECTDEBIT:
        this.order._isStripe = true;
        break;
      case PaymentMethodEnum.SANTANDER_INVOICE_DE:
        this.order._isSantanderDeInvoice = true;
        break;
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT:
        this.order._isSantanderPosDe = true;
        break;
      case PaymentMethodEnum.SANTANDER_INVOICE_NO:
        this.order._isSantanderNoInvoice = true;
        break;
      default:
        break;
    }
  }

  private initSantander(): void {
    let isRegularSantanderDe = false;
    switch (this.order.payment_option.type) {
      case PaymentMethodEnum.SANTANDER_INSTALLMENT:
      case PaymentMethodEnum.SANTANDER_CPP_INSTALLMENT:
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT:
        this.order._isSantander = true;
        this.order._isSantanderDe = true;
        this.order._santanderApplicationNo = this.order.details.order.application_no;
        isRegularSantanderDe = true;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_AT:
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_AT:
        this.order._isSantander = true;
        this.order._isSantanderAt = true;
        this.order._santanderApplicationNo = this.order.details.order.application_no;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_DK:
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_DK:
        this.order._isSantander = true;
        this.order._isSantanderDk = true;
        this.order._santanderApplicationNo = this.order.details.order.application_no;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_NO:
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_NO:
        this.order._isSantander = true;
        this.order._isSantanderNo = true;
        this.order._santanderApplicationNo = this.order.details.order.application_no;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_NL:
        this.order._isSantander = true;
        this.order._isSantanderNl = true;
        this.order._santanderApplicationNo = this.order.details.order.application_no;
        break;
      case PaymentMethodEnum.SANTANDER_INVOICE_NO:
      case PaymentMethodEnum.SANTANDER_POS_INVOICE_NO:
        this.order._isSantander = true;
        this.order._isSantanderNo = true;
        this.order._applicationNo = this.order.details.order.pan_id;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_SE:
        this.order._isSantander = true;
        break;
      case PaymentMethodEnum.SANTANDER_INVOICE_DE:
      case PaymentMethodEnum.SANTANDER_POS_INVOICE_DE:
        this.order._isSantanderPosDeFactInvoice = this.order.payment_option.type === PaymentMethodEnum.SANTANDER_POS_INVOICE_DE;
        this.order._isSantander = true;
        this.order._isSantanderDe = true;
        this.order._panId = this.order.details.order.pan_id;
        break;
      case PaymentMethodEnum.SANTANDER_FACTORING_DE:
      case PaymentMethodEnum.SANTANDER_POS_FACTORING_DE:
        this.order._isSantanderPosDeFactInvoice = this.order.payment_option.type === PaymentMethodEnum.SANTANDER_POS_FACTORING_DE;
        this.order._isSantander = true;
        this.order._panId = this.order.details.order.pan_id;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_FI:
        this.order._isSantander = true;
        this.order._santanderApplicationNo = this.order.details.order.application_no;
        this.order._panId = this.order.details.order.pan_id;
        break;
      default:
        break;
    }

    const statusContractAvailable: StatusType[] = [
      'STATUS_ACCEPTED',
      'STATUS_IN_PROCESS',
      'STATUS_PAID',
    ];

    if (isRegularSantanderDe && this.order.status.general === 'STATUS_PAID') {
      this.order._isForceHideUpdateStatus = true;
    }

    if (this.order.payment_option.type === 'santander_pos_installment') {
      const specificStatusAvailable: SantanderAppSpecificStateType[] = [
        'STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS',
        'STATUS_SANTANDER_DEFERRED',
      ];
      this.order._showSantanderDeQr = specificStatusAvailable.indexOf(this.order.status.specific) >= 0;

      const allowDownloadFunctionalityStates: SantanderAppSpecificStateType[] = [
        'STATUS_SANTANDER_APPROVED',
        'STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS',
        'STATUS_SANTANDER_ACCOUNT_OPENED',
      ];
      if (allowDownloadFunctionalityStates.indexOf(this.order.status.specific) >= 0) {
        let historyItem: OrderHistoryInterface;
        if (this.order.status.specific === 'STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS') {
          historyItem = findLast(
            this.order.history,
            (historyItem: OrderHistoryInterface) => historyItem.payment_status === 'STATUS_IN_PROCESS');
        }
        else {
          historyItem = findLast(
            this.order.history,
            (historyItem: OrderHistoryInterface) => historyItem.payment_status === 'STATUS_ACCEPTED');
        }
        if (Boolean(historyItem)) {
          const timeout: number = constants['SANTANDER_DE_POS_ALLOW_CONTRACT_DOWNLOAD_TIMEOUT'] as number;
          this.order._showSantanderContract = this.getCurrentTimeout(historyItem) < timeout;
        }
      }
    }
    if (this.order.payment_option.type === 'santander_pos_installment') {
      const enableStatus = this.order.status.general === 'STATUS_IN_PROCESS';
      const enableSpecificStatus = ['GENEHMIGT', 'SIGNED', 'ZURÜCKGESTELLT'].includes(this.order.status.specific);
      this.order._showSantanderPosDeContract = enableStatus && enableSpecificStatus;
    }
    if (this.order.payment_option.type === 'santander_pos_factoring_de') {
      this.order._showSantanderFactoringContract = statusContractAvailable.indexOf(this.order.status.general) >= 0;
    }
    if (this.order.payment_option.type === 'santander_pos_invoice_de') {
      this.order._showSantanderInvoiceContract = statusContractAvailable.indexOf(this.order.status.general) >= 0;
    }
  }

  private getCurrentTimeout(historyItem: OrderHistoryInterface): number {
    return (new Date()).getTime() - (new Date(historyItem.created_at)).getTime();
  }

  private makeFormData(data: { [propName: string]: ActionRequestInterface }): string {
    let serializedData = '';
    forIn(data, (dataValue: ActionRequestInterface, dataKey: string) => {
      forIn(dataValue, (value: number | string | boolean | ActionRequestRefundItemsInterface[], key: string) => {
        const formKey: string = encodeURIComponent(`${dataKey}[${key}]`);
        if (typeof value === 'string' || typeof value === 'number') {
          serializedData += `&${formKey}=${encodeURIComponent(value as string)}`;
        }
        else if (typeof value === 'boolean') {
          serializedData += `&${formKey}=${value ? '1' : '0'}`;
        }
      });
    });

    return serializedData.replace(/^&/, '');
  }

  private showError(): void {
    this.snackbarService.toggle(true, {
      content: this.translateService.translate('transactions.errors.unknown'),
    });
  }
}
