import { ChangeDetectionStrategy, Component, HostBinding, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { isNumber } from 'lodash-es';

import { AppThemeEnum } from '@pe/common';
import { LocaleConstantsService } from '@pe/i18n';

import { ActionRequestInterface, AbstractAction, DetailInterface, ActionInterface, ActionTypeEnum } from '../../../../shared';
import { CancelTypeEnum } from '../../../../shared/enums/cancel-type.enum';
import { PAYMENTS_HAVE_PARTIAL } from '../settings';

@Component({
  selector: 'pe-cancel-action',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss', '../actions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionCancelTransactionComponent extends AbstractAction implements OnInit {
  @HostBinding('class') get themeClass(): AppThemeEnum {
    return this.theme;
  }

  loading = false;
  form: FormGroup = null;
  error: string = null;

  readonly CancelTypeEnum = CancelTypeEnum;

  get orderId(): string {
    return this.route.snapshot.params.uuid;
  }

  get actionData(): ActionInterface {
    return this.getActionData(ActionTypeEnum.Cancel);
  }

  order: DetailInterface = this.detailService.orderData;

  validateAmount = (control: AbstractControl): ValidationErrors | null => {
    const value = Number(control.value.replace(',', '.'));
    const amount = Number.isNaN(value) ? 0 : Number(value);

    return (amount < 0 || amount > this?.maxAmount) ? {
      invalid: true,
    } : null;
  };

  constructor(
    private formBuilder: FormBuilder,
    private localeConstantsService: LocaleConstantsService,
    public injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getData();
  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  get maxAmount(): number {
    let amount = this.order.transaction.amount_left || 0;
    if (
      (PAYMENTS_HAVE_PARTIAL.includes(this.order.payment_option.type) || this.actionData?.partialAllowed)
      && isNumber(this.order.transaction.amount_cancel_rest)
    ) {
      amount = this.order.transaction.amount_cancel_rest;
    }

    return amount;
  }

  onSubmit(): void {
    this.loading = true;
    if (this.form.valid) {
      const data: ActionRequestInterface = {};
      const reason: string = this.form.get('reason').value;
      if ( reason ) {
        data.reason = reason;
      }
      if (this.form.get('amount') && this.form.get('amount').value) {
        data.amount = this.form.get('amount').value.replace(',', '.');
      }
      this.sendAction(
        data,
        ActionTypeEnum.Cancel,
        'payment_cancel',
        false
      );
    }
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      reason: '',
      amount: ['', [this.validateAmount]],
      type: CancelTypeEnum.Full,
    });
  }

  public amountChanged(event: KeyboardEvent): void {
    if (!`${this.form.get('amount').value}${event.key}`.match(/^(\d+((\.|\,)\d{0,2})?)$/g)) {
      event.preventDefault();
    }
  }
}
