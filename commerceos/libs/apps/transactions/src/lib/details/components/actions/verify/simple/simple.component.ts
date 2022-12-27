import { Component, Injector } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { PaymentMethodEnum } from '@pe/checkout-wrapper-sdk-types';
import { PeDestroyService } from '@pe/common';

import { AbstractVerifyAction } from '../../../../../shared/abstractions/verify-action.abstract';

@Component({
  selector: 'pe-verify-action-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.scss'],
  providers: [
    PeDestroyService,
  ],
})

export class ActionVerifySimpleComponent extends AbstractVerifyAction {
  errorKeyValue = 'transactions.action-errors.verify.simple';

  constructor(
    public injector: Injector,
  ) {
    super(injector);
  }

  get isShowSignedField(): boolean {
    return this.order && this.order.payment_option &&
      [PaymentMethodEnum.SANTANDER_POS_INVOICE_DE].indexOf(this.order.payment_option.type) < 0;
  }

  onSubmit(): void {
    this.form.updateValueAndValidity();
    this.isSubmitted = true;

    if (this.form.invalid) {
      return;
    }

    this.verify.emit({
      data: true as any,
      dataKey: 'approved',
    });
  }

  createForm(): void {
    this.form = new FormGroup(this.isShowSignedField ? {
      _confirm: new FormControl('', [Validators.requiredTrue]),
      _signed: new FormControl('', [Validators.requiredTrue]),
    } : {
      _confirm: new FormControl('', [Validators.requiredTrue]),
    });
  }
}
