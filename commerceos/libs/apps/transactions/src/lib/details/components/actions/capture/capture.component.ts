import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { isNumber } from 'lodash-es';
import { tap } from 'rxjs/operators';

import { ActionTypeEnum, CaptureTypeEnum } from '../../../../shared';
import { AbstractAction } from '../../../../shared/abstractions/action.abstract';
import {
  ActionInterface,
  RefundProductInterface,
} from '../../../../shared/interfaces/detail.interface';
import { PAYMENTS_HAVE_PARTIAL } from '../settings';

@Component({
  selector: 'pe-capture-action',
  templateUrl: './capture.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ActionCaptureComponent extends AbstractAction implements OnInit {
  form: FormGroup = null;
  types: CaptureTypeEnum[] = [CaptureTypeEnum.Partial, CaptureTypeEnum.Items];
  products: RefundProductInterface[] = [];
  isChangeTypeDisabled = false;

  constructor(
    public injector: Injector,
    private formBuilder: FormBuilder
  ) {
    super(injector);
  }

  get orderId(): string {
    return this.route.snapshot.params.uuid;
  }

  get amountField(): AbstractControl {
    return this.form.get('amount');
  }

  get captureTypeField(): AbstractControl {
    return this.form.get('captureType');
  }

  get refundItems(): AbstractControl {
    return this.form.get('refundItems');
  }

  get actionData(): ActionInterface {
    return this.getActionData(ActionTypeEnum.Capture);
  }

  get captureTotal(): number {
    let total = this.order.transaction.amount_capture_rest;
    if (
      (PAYMENTS_HAVE_PARTIAL.includes(this.order.payment_option.type) || this.actionData?.partialAllowed)
      && isNumber(this.order.transaction.amount_capture_rest_with_partial_cancel)
    ) {
      total = this.order.transaction.amount_capture_rest_with_partial_cancel;
    }

    return total;
  }

  ngOnInit(): void {
    this.getData();

    this.amountField.valueChanges.pipe(
      tap(val => val < 0 && this.amountField.setValue(0, {
        emitEvent: false,
      }))
    ).subscribe();
  }

  onSubmit(): void {
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      return;
    }

    let data: any = {};
    if (this.amountField.value && !this.refundItems.value.length) {
      data.amount = Number(this.amountField.value.toString().replace(',', '.')).toFixed(2);
    } else if (this.refundItems.value.length) {
      data.payment_items = [];
      this.refundItems.value.forEach(item => {
        const { name, price } = this.order.cart.items.find(el => {
          return el.identifier == item.identifier;
        });
        data.payment_items.push({ name, price, quantity: item.quantity, identifier: item.identifier });
      });
    }

    this.sendAction(data, ActionTypeEnum.Capture, null, false);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      amount: ['', [
        (control: AbstractControl): ValidationErrors | null => {
          const value = Number(control.value.toString().replace(',', '.'));
          const amount = Number.isNaN(value) ? 0 : Number(value);

          return (amount < 0 || amount > this.captureTotal) ? {
            invalid: true,
          } : null;
        },
      ]],
      captureType: this.types[0].toString(),
      refundItems: this.formBuilder.array([]),
    });

    this.createProducts();
    this.onToggleAmount(!this.actionData?.partialAllowed);
    this.cdr.detectChanges();
  }

  onToggleAmount(checked: boolean): void {
    this.amountField[checked ? 'disable' : 'enable']({
      emitEvent: false,
    });

    if (checked) {
      (this.refundItems as FormArray).clear();
      this.form.reset({
        emitEvent: false,
      });
      this.amountField.setValue(checked ? (this.captureTotal || 0) : '');
      this.captureTypeField.setValue(this.types[0].toString());
    }

    this.isChangeTypeDisabled = checked;
    this.cdr.detectChanges();
  }

  private createProducts(): void {
    this.order.cart?.items?.forEach(
      (item: any) => {
        this.products.push({
          id: item.identifier,
          name: item.name,
          image: item.thumbnail,
          price: item.price,
          currency: this.order.transaction.currency,
          quantity: item.quantity,
        });
      }
    );
  }
}
