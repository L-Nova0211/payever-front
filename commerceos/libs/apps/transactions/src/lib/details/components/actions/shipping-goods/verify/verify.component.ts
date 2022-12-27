import { Component, ChangeDetectionStrategy, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

import { PaymentSecurityCode } from '../../../../../shared';
import { BaseShippingComponent } from '../base.component';

@Component({
  selector: 'pe-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingVerifyComponent extends BaseShippingComponent implements OnInit {
  @Input() isSubmitted = false;
  @Input() securityFormControl: FormControl;
  @Input() securityField: PaymentSecurityCode;

  preparedControls = false;

  private formBuilder = this.injector.get(FormBuilder);

  ngOnInit(): void {
    this.prepareVerification();
  }

  private prepareVerification(): void {
    const validators = this.securityField.type === 'string'
      ? [Validators.minLength(4)]
      : [];
    this.securityFormControl = this.formBuilder.control('', [Validators.required, ...validators]);
    this.form.addControl(this.securityField.name, this.securityFormControl);
    this.form.addControl('_confirm', new FormControl('', Validators.requiredTrue));

    this.preparedControls = true;
    this.cdr.detectChanges();
  }
}
