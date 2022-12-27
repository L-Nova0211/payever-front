/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { isNumber } from 'lodash-es';

import { PeDestroyService } from '@pe/common';
import { LocaleConstantsService } from '@pe/i18n';

import { AbstractAction } from '../../../../shared/abstractions/action.abstract';
import { RefundTypeEnum } from '../../../../shared/enums/refund-type.enum';
import { ActionTypeEnum } from '../../../../shared/interfaces/action.type';
import {
  ActionRequestInterface,
  ActionRequestRefundItemsInterface,
  DetailInterface,
  ItemInterface,
  RefundItemInterface,
  RefundItemsInterface,
  RefundProductInterface,
} from '../../../../shared/interfaces/detail.interface';

@Component({
  selector: 'pe-refund-action',
  templateUrl: './refund.component.html',
  styles: [`
    .hide {
      display: none;
    }
    .second-section {
      display: block;
      margin-top: 12px;
    }
  `],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionRefundTransactionComponent extends AbstractAction implements OnInit {

  readonly RefundTypeEnum = RefundTypeEnum;

  form: FormGroup = null;
  order: DetailInterface = null;
  itemsDeliveryFee = 0;
  products: RefundProductInterface[] = [];

  private action: ActionTypeEnum = ActionTypeEnum.Refund;

  constructor(
    private formBuilder: FormBuilder,
    private localeConstantsService: LocaleConstantsService,
    public injector: Injector
  ) {
    super(injector)
  }

  get orderId() {
    return this.route.snapshot.params.uuid;
  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  get hideProductPicker(): boolean {
    return !(this.order.cart.available_refund_items?.length > 0 && this.form.get('type').value == RefundTypeEnum.Items);
  }

  get refundGoodsReturned(): AbstractControl {
    return this.form.get('refundInvoiceNumber');
  }

  get refundInvoiceNumber(): AbstractControl {
    return this.form.get('refundInvoiceNumber');
  }

  get refundDeliveryFee(): AbstractControl {
    return this.form.get('refundDeliveryFee');
  }

  ngOnInit(): void {
    this.getData();
  }

  onKeyPress(e: KeyboardEvent) {
    if (!`${this.form.get('amount').value}${e.key}`.match(/^(\d+((\.|\,)\d{0,2})?)$/g)) {
      e.preventDefault();
    }
  }

  onSubmit(): void {
    if (this.isLoading$.value) {
      // To prevent double submit
      return;
    }
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      console.error('Form is invalid!');

      return;
    }
    const data: ActionRequestInterface = { amount: this.amountValue };
    const itemsRestocked: boolean = this.itemsRestockedValue;
    const reason: string = this.form.get('reason').value;
    const refundItemsArr: ActionRequestRefundItemsInterface[] = this.form.get('refundItems') ? this.form.get('refundItems').value : [];
    if (itemsRestocked) {
      data.itemsRestocked = true;
    }
    if (reason) {
      data.reason = reason;
    }
    if (refundItemsArr?.length > 0 && this.form.get('type').value === RefundTypeEnum.Items) {
      const refundItems: ActionRequestRefundItemsInterface[] = [];
      refundItemsArr.forEach((restockItem: ActionRequestRefundItemsInterface) => {
        if (restockItem.quantity > 0) {
          refundItems.push(restockItem);
        }
      });
      if (refundItems.length > 0) {
        data.payment_items = refundItems;
      }
    }
    if (this.order._isSantanderDe) {
      data.refundGoodsReturned = this.form.get('refundGoodsReturned').value;
      data.refundInvoiceNumber = this.form.get('refundInvoiceNumber').value;
    }

    if (this.refundDeliveryFee.value) {
      data.delivery_fee = this.deliveryFee;
    }

    this.sendAction(data, this.action, null, false);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      amount: ['', [
        (control: AbstractControl): ValidationErrors | null => {
          const value = this.parseAmount(control.value);
          const amount = Number.isNaN(value) ? 0 : Number(value);

          return (amount < 0 || amount > this?.refundTotal) ? {
            invalid: true,
          } : null;
        },
      ]],
      itemsRestocked: true,
      reason: '',
      refundItems: [],
      refundDeliveryFee: false,
      refundPaymentFee: this.order.payment_option.fee_accepted,
      type: RefundTypeEnum.Full,
      refundGoodsReturned: { value: false, disabled: true },
      refundInvoiceNumber: { value: '', disabled: true },
    });
    if (this.order.cart.available_refund_items.length > 0) {
      this.order.cart.available_refund_items.forEach(
        (item: RefundItemsInterface, index: number) => {
          const product: ItemInterface = this.order._itemsArray[this.order.cart.available_refund_items[index].identifier];
          this.products.push({
            id: item.identifier,
            name: product.name,
            image: product.thumbnail,
            price: product.price,
            currency: this.order.transaction.currency,
            quantity: item.count,
          });
        }
      );
      const refundItemsFormArray: FormArray = this.formBuilder.array([]);
      this.form.setControl('refundItems', refundItemsFormArray);
    }
    if (this.order._isSantanderDe) {
      this.form.get('refundGoodsReturned').enable();
      this.form.get('refundInvoiceNumber').enable();
    }
    this.cdr.detectChanges();
  }

  get refundTotal(): number {
    let total = this.order.transaction.amount_left;
    if (this.order._isSantanderDeInvoice && isNumber(this.order.transaction.amount_refund_rest_with_partial_capture)) {
      total = this.order.transaction.amount_refund_rest_with_partial_capture;
    }

    return total;
  }

  get refundFullTotal(): number {
    return this.order.transaction.total_left;
  }

  get paymentFee(): number {
    return Number.isNaN(this.order.payment_option.payment_fee) ? 0 : Number(this.order.payment_option.payment_fee);
  }

  get deliveryFee(): number {
    const delivery_fee = this.order.transaction?.delivery_fee_left ?? this.order.shipping.delivery_fee;

    return Number.isNaN(delivery_fee) ? 0 : Number(delivery_fee);
  }

  get refundItems(): FormArray {
    return this.form.get('refundItems') as FormArray;
  }

  get amountValue(): number {
    let result = this.refundTotal;

    if (this.form.get('type').value === RefundTypeEnum.Full) {
      return +Number(this.order.transaction.total_left).toFixed(2);
    }

    if (this.form.get('type').value === RefundTypeEnum.Items) {
      result = this.calcAmountFromProducts();
    } else if (this.form.get('type').value === RefundTypeEnum.Partial) {
      result = this.parseAmount(this.form.get('amount')?.value);
    }

    if (this.form.get('type').value !== RefundTypeEnum.Items) {
      if (this.refundDeliveryFee.value) {
        result += this.deliveryFee;
      }

      if (this.form.get('refundPaymentFee').value) {
        result += this.paymentFee;
      }
    }

    return +result.toFixed(2);
  }

  get isCustomAmountEnabled(): boolean {
    return this.form.get('type')?.value === RefundTypeEnum.Partial;
  }

  get itemsRestockedValue(): boolean {
    return this.isItemsRestockedEnabled ? Boolean(this.form.get('itemsRestocked')?.value) : false;
  }

  get isItemsRestockedEnabled(): boolean {
    return this.form.get('type')?.value !== RefundTypeEnum.Partial && this.order.cart.items.length > 0;
  }

  get isShowSecondSection(): boolean {
    return !(this.deliveryFee === 0) ||
      !(this.paymentFee === 0) ||
      this.order._isSantanderDe;
  }

  private parseAmount(val: string): number {
    return Number(val.replace(',', '.'));
  }

  private getItemsDeliveryFee(): number {
    let deliveryFee = 0;
    if (this.deliveryFee > 0) {
      deliveryFee = this.calcDeliveryFee();
    }
    this.itemsDeliveryFee = deliveryFee;

    return deliveryFee;
  }

  private calcAmountFromProducts(): number {
    let amount = 0;
    const items: RefundItemInterface[] = this.order.cart.available_refund_items;
    this.refundItems.controls.forEach(
      (formRestockItem: FormGroup, index: number) => {
        const value = Number(formRestockItem.get('quantity')?.value);
        amount += value * Number(this.order._itemsArray[items[index].identifier].price);
      }
    );
    amount += this.form.get('refundDeliveryFee')?.value ? this.getItemsDeliveryFee() : 0;
    amount += this.form.get('refundPaymentFee')?.value ? this.paymentFee : 0;

    return +amount.toFixed(2);
  }

  private calcDeliveryFee(): number {
    return parseFloat(`${this.deliveryFee}`);
  }
}
