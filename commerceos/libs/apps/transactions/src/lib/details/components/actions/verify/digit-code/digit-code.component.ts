import { Component, Injector } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AbstractVerifyAction } from '../../../../..//shared/abstractions/verify-action.abstract';

@Component({
  selector: 'pe-verify-action-digit-code',
  templateUrl: './digit-code.component.html',
  styleUrls: ['./digit-code.component.scss'],
})

export class ActionVerifyDigitCodeComponent extends AbstractVerifyAction {
  errorKeyValue = 'transactions.action-errors.verify.digit_code';

  constructor(
    public injector: Injector,
  ) {
    super(injector);
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
    this.form = new FormGroup({
      code: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }
}
