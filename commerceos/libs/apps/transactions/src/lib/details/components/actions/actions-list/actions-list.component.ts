/* eslint-disable no-underscore-dangle */
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { forEach, cloneDeep } from 'lodash';
import moment from 'moment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, map, skip, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvironmentConfigInterface, EnvService, PeDestroyService, PE_ENV } from '@pe/common';
import { AddressInterface } from '@pe/forms-core';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import { ApiService } from '../../../../services/api.service';
import { SettingsService } from '../../../../services/settings.service';
import { StatusUpdaterService } from '../../../../services/status-updater.service';
import {
  ActionInterface,
  DetailInterface,
  MailActionInterface,
  PaymentDetailsWithOrderInterface,
  ProcessShippingBillingAddressInterface,
  ProcessShippingOrderInterface,
  ActionTypeEnum,
} from '../../../../shared';
import { ActionTypeUIEnum } from '../../../../shared/enums/action-type.enum';
import { UIActionInterface } from '../../../../shared/interfaces/action.interface';
import { DetailService } from '../../../services/detail.service';
import { MoreActionsComponent } from '../more/more.component';

import { ActionsListService, MAX_MAIN } from '../../../services/actions-list.service';

@Component({
  selector: 'pe-actions-list',
  template: `
    <pe-actions-container
      [uiActions]="mainActions"
      [theme]="theme"
      typeView="column"
      [isShowMore]="optionalActions?.length"
      [moreIcon]="moreIcon"
      (selected)="onSelected($event)"
      (clickMore)="openMoreActions()"
    ></pe-actions-container>
  `,
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsListComponent implements OnInit {
  get order(): DetailInterface {
    return this.detailService.orderData;
  }

  set order(val) {
    this.detailService.orderData = val;
  }

  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] :
    AppThemeEnum.default;

  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();

  optionalActions: UIActionInterface[] = [];
  mainActions: UIActionInterface[] = [];
  isReadyToGetActions = false;

  onSelectedSubject$ = new BehaviorSubject<number>(1)

  private orderId: string = null;
  private businessId: string = null;
  private shippingLabelData = null;

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private detailService: DetailService,
    private router: Router,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    private envService: EnvService,
    private destroy$: PeDestroyService,
    private overlay: PeOverlayWidgetService,
    private statusUpdaterService: StatusUpdaterService,
    private actionsListService: ActionsListService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
    of([]).pipe(
      switchMap(() => this.onSelectedSubject$.pipe(
        tap((actionIndex: number) => {
          if (this.optionalActions[actionIndex]) {
            this.optionalActions[actionIndex].onClick();
          }
        }))
      ),
      switchMap(() => this.detailService.loading$.pipe(
        tap((loaded: boolean) => {
          if (!loaded) {
            this.prepareActionsForUI();
          }
        }),
        takeUntil(this.destroy$)
      )),
      switchMap(() => this.detailService.isReady$.pipe(
        skip(1),
        filter((val: boolean) => val),
        tap(() => {
          this.ngOnInit();
        })
      )),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onSelected(actionIndex: number): void {
    this.mainActions[actionIndex].onClick();
  }

  ngOnInit(): void {
    this.isReadyToGetActions = true;
    this.activatedRoute.params.pipe(
      switchMap((params: Params) => {
        this.businessId = this.envService.businessId;
        this.orderId = params['uuid'];
        this.actionsListService.orderId = this.orderId;
        this.actionsListService.actions = [];

        return this.loadActions();

      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  openMoreActions(): void {
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: MoreActionsComponent,
      data: { uiActions: this.optionalActions, onSelected$: this.onSelectedSubject$ },
      backdropClass: 'settings-backdrop',
      panelClass: 'more-widget-panel',
      headerConfig: {
        title: this.translateService.translate('transactions.details.actions.more'),
        backBtnTitle: this.translateService.translate('transactions.actions.cancel'),
        theme: this.theme,
        doneBtnTitle: this.translateService.translate('transactions.actions.done'),
      },
    };

    this.overlay.open(
      config,
    );
  }

  get santanderDeQrUrl(): string {
    const customerAddress: AddressInterface = this.order.shipping.address;
    const billing_address: AddressInterface = this.order.billing_address;
    const paymentDetails: PaymentDetailsWithOrderInterface = this.order.details;
    let resultingUrl: string;
    if (paymentDetails.credit_answer) {
      const referenceNumber: string = this.parseReferenceNumber(paymentDetails.credit_answer);
      const firstName: string = customerAddress ? customerAddress.first_name : billing_address.first_name;
      const lastName: string = customerAddress ? customerAddress.last_name : billing_address.last_name;
      resultingUrl = this.settingsService.externalUrls.getSantanderDeQr(firstName, lastName, referenceNumber);
    } else {
      resultingUrl = '';
    }

    return resultingUrl;
  }

  get showSantanderDeQr(): boolean {
    return Boolean(this.order)
      && Boolean(this.order._showSantanderDeQr)
      && Boolean(this.order.details.credit_answer);
  }

  get moreIcon() {
    return this.actionsListService.getCDNIcon('more');
  }

  private loadActions(): Observable<any> {
    if (this.settingsService.isPersonal || this.settingsService.isAdmin) {
      return of([]);
    }

    return this.apiService.getTransactionActions(this.orderId).pipe(
      switchMap((actions: ActionInterface[]) => {
        if (actions?.length && actions?.findIndex(
          (action: ActionInterface) => (action.action === 'shipping_goods' && action.enabled)
        ) === -1) {
          return of(actions);
        }

        return this.apiService.getShippingActions(this.order).pipe(
          map((shippingActions) => {
            this.order = { ...this.order, _shippingActions: shippingActions };

            return actions;
          })
        );
      }),
      switchMap((actions: ActionInterface[]) => {
        if (actions?.length && actions?.findIndex(
          (action: ActionInterface) => (action.action === 'resend_shipping_order_template' && action.enabled)
        ) === -1) {
          return of(actions);
        }

        return this.apiService.getMailerActions(this.order).pipe(
          map((mailerActions) => {
            this.order = { ...this.order, _mailerActions: mailerActions };

            return actions;
          })
        );
      }),
      tap((actions: ActionInterface[]) => {
        this.order = { ...this.order, actions };

        this.rebuildOrders();
        this.prepareActionsForUI();
        this.cdr.detectChanges();

        if (this.order?._shippingActions?.find(a => ['download_shipping_label', 'download_return_label'].indexOf(a.action) >= 0)) {
          this.apiService.downloadLabel(this.businessId, this.order.shipping.order_id)
            .subscribe(
              (res) => {
                this.shippingLabelData = res;
              },
              () => {
                this.detailService.loading = false;
              }
            );
        }
      })
    );
  }

  private rebuildOrders(): void {
    const order = cloneDeep(this.order);
    const baseActions: ActionInterface[] = order.actions || [];
    const actions: ActionInterface[] = [];
    forEach(baseActions, (actionData: ActionInterface) => {
      actionData = cloneDeep(actionData);
      if (order._isSantanderNoInvoice && actionData.action === ActionTypeEnum.Edit) {
        actionData.action = ActionTypeEnum.Update;
        actions.push(actionData);
      } else if (actionData.action === ActionTypeEnum.Edit && (
        order._isSantanderPosDeFactInvoice ||
        order._isSantanderNo)) {
        actionData.action = ActionTypeEnum.Change_Amount;
        actions.push(actionData);
        if (order._isSantanderPosDeFactInvoice) {
          actionData = cloneDeep(actionData);
          actionData.action = ActionTypeEnum.EditReference;
          actions.push(actionData);
        }
      } else {
        actions.push(actionData);
      }
    });

    forEach(actions, (action: ActionInterface) => {
      if (action.enabled) {
        action.label = this.translateService.translate(`transactions.details.actions.labels.${action.action}`);
      }
    });
    this.order.actions = actions;
  }

  private prepareBillingAddressForPost(billingAddress: AddressInterface): ProcessShippingBillingAddressInterface {
    const streetName: string = billingAddress.street_name || this.extractStreetNameAndNumber(billingAddress.street)[0];
    const streetNumber: string = billingAddress.street_number || this.extractStreetNameAndNumber(billingAddress.street)[1];

    return {
      streetName,
      streetNumber,
      name: billingAddress.first_name,
      city: billingAddress.city,
      stateProvinceCode: billingAddress.stateProvinceCode,
      zipCode: this.order.billing_address.zip_code,
      countryCode: this.order.billing_address.country,
      phone: this.order.billing_address.phone,
    };
  }

  private extractStreetNameAndNumber(street: string): string[] {
    const arr: string[] = street.split(' ');
    const last: string = arr.pop();
    if (arr.length > 0 && /\d/.test(last)) { // If last part has digits - last part is street number
      return [arr.join(' '), last];
    }

    return [street, ''];
  }

  private get actionsEnabled(): ActionInterface[] {
    return this.order.actions?.filter((action: ActionInterface) => action.enabled);
  }

  private get shippingActionsEnabled(): ActionInterface[] {
    return this.order._shippingActions?.filter((action: ActionInterface) => action.enabled);
  }

  private get mailerActionsEnabled(): MailActionInterface[] {
    return this.order._mailerActions?.filter((action: MailActionInterface) => action.enabled);
  }

  private prepareActionsForUI(): void {
    if (!this.isReadyToGetActions || !this.order) {
      return;
    }

    this.actionsListService.actions = this.actionsEnabled;

    if (
      this.actionsEnabled?.length ||
      this.shippingActionsEnabled?.length ||
      this.mailerActionsEnabled?.length
    ) {
      let uiActions: UIActionInterface[] = [];
      const { mainActions, optionalActions } = this.actionsListService.actionsMapper(this.actionsEnabled, this.order);

      if (mainActions?.length > MAX_MAIN) {
        this.mainActions = cloneDeep(mainActions).slice(0, MAX_MAIN);
        uiActions = cloneDeep(mainActions).slice(MAX_MAIN);
      } else {
        this.mainActions = mainActions;
      }

      uiActions = [...uiActions, ...optionalActions];

      // TODO: remove false once BE node is ready
      if (false && this.showSantanderDeQr) {
        uiActions.push({
          icon: this.actionsListService.getCDNIcon('link', 'icons-transactions/more'),
          type: ActionTypeUIEnum.Link,
          href: this.santanderDeQrUrl,
          label: this.getActionLabel('create_label_ship'),
        });
      }

      if (this.order._shippingActions) {
        forEach(this.order._shippingActions, action => {
          uiActions.push({
            icon: this.actionsListService.getCDNIcon(action.action, 'icons-transactions/more'),
            type: ActionTypeUIEnum.Button,
            onClick: () => {
              this.onClickOrderShippingAction(action);
            },
            label: this.getActionLabel(action.action),
          });
        });
      }

      if (this.order._mailerActions) {
        forEach(this.order._mailerActions, action => {
          uiActions.push({
            icon: this.actionsListService.getCDNIcon(action.action, 'icons-transactions/more'),
            type: ActionTypeUIEnum.Button,
            onClick: () => {
              this.onClickOrderMailerAction(action);
            },
            label: this.getActionLabel(action.action),
          });
        });
      }

      this.optionalActions = uiActions;
      this.cdr.markForCheck();
    }
  }

  private onClickOrderShippingAction(order: ActionInterface): void {
    if (order.action === ActionTypeEnum.DownloadShippingSlip) {
      this.actionsListService.onClickOrderAction(ActionTypeEnum.DownloadShippingSlip);
    }
    if (order.action === ActionTypeEnum.DownloadShippingLabel && this.shippingLabelData) {
      window.open(this.shippingLabelData.label, '__blank');
    }
    if (order.action === ActionTypeEnum.DownloadReturnLabel && this.shippingLabelData) {
      window.open(this.shippingLabelData.returnLabel, '__blank');
    }
    if (order.action === ActionTypeEnum.ProcessShippingOrder) {
      this.detailService.loading = true;
      const billingAddress: ProcessShippingBillingAddressInterface = this.prepareBillingAddressForPost(this.order.billing_address);
      const order: ProcessShippingOrderInterface = {
        businessName: this.envService.businessData.name,
        transactionId: this.order.transaction.uuid,
        transactionDate: this.order.transaction.created_at,
        legalText: `${this.envService.businessData.name} ${billingAddress.streetName} ${billingAddress.streetNumber}`,
        billingAddress,
        shipmentDate: moment().format('YYYY-MM-DD'),
      };
      this.apiService.processShippingOrder(order, this.order.shipping.order_id)
        .subscribe(
          () => {
            this.detailService.loading = false;
          },
          (err: HttpErrorResponse) => {
            this.detailService.loading = false;
          }
        );
    }
  }

  private onClickOrderMailerAction(order: MailActionInterface): void {
    if (order.action === ActionTypeEnum.ResendShippingOrderTemplate) {
      this.detailService.loading = true;
      this.apiService.resendShippingConfirmation(this.settingsService.businessUuid, order.mailEvent.id)
        .subscribe(
          () => {
            this.detailService.loading = false;
          },
          (err: HttpErrorResponse) => {
            this.detailService.loading = false;
          }
        );
    }
  }

  private getActionLabel(action: string): string {
    const labelPayment = `transactions.details.actions.labels.${action}`;
    const labelDefault = `transactions.actions.${action}`;

    return this.translateService.hasTranslation(labelPayment) ? labelPayment : labelDefault;
  }

  private parseReferenceNumber(creditAnswer: string): string {
    const matchedValue: RegExpMatchArray = creditAnswer.match(/Referenznummer:\s+[0-9]*/);

    return matchedValue ? matchedValue[0].replace(/^\D+/g, '') : '';
  }
}
