import { Component, Injector, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { GuarantorTypeEnum, PaymentSecurityCode } from '../../../../../shared';
import { AbstractVerifyAction } from '../../../../../shared/abstractions/verify-action.abstract';


export function initFormGroupVerifyById(): FormGroup {
  return;
}

@Component({
  selector: 'pe-verify-action-by-id',
  templateUrl: './verify-by-id.component.html',
  styleUrls: ['./verify-by-id.component.scss'],
})

export class ActionVerifyByIdComponent extends AbstractVerifyAction {
  @Input() field: PaymentSecurityCode;

  errorKeyValue = 'transactions.action-errors.verify.by_id';

  constructor(
    public injector: Injector,
  ) {
    super(injector);
  }

  get isGuarantor (): boolean {
    return this.order?.details?.guarantor_type && this.order?.details?.guarantor_type !== GuarantorTypeEnum.NONE;
  }

  get applicantsControl(): FormArray {
    return (this.form.controls.applicants as FormArray);
  }

  onSubmit(): void {
    this.form.updateValueAndValidity();
    this.isSubmitted = true;

    if (this.form.invalid) {
      return;
    }

    this.verify.emit({
      data: this.applicantsControl.value as any,
      dataKey: 'identification',
    });
  }

  createForm(): void {
    this.form = new FormGroup({
      applicants: new FormArray([this.prepareApplicantControl(1)]),
      _confirm: new FormControl('', Validators.requiredTrue),
    });

    if (this.isGuarantor) {
      this.applicantsControl.push(this.prepareApplicantControl(2));
    }
  }

  makeBorrowerName(personNumber: number): string {
    const label = this.translateService.translate('transactions.form.verify.labels.idNumber');

    if (!this.isGuarantor) {
      return label;
    }

    return this.translateService.translate('transactions.form.verify.labels.borrower', {
      personNumber,
    }) + ' - ' + label;
  }

  private prepareApplicantControl(applicant: number): FormGroup {
    return new FormGroup({
      applicant: new FormControl(applicant),
      idNumber: new FormControl('', [Validators.required, Validators.minLength(5)]),
    });
  }
}
