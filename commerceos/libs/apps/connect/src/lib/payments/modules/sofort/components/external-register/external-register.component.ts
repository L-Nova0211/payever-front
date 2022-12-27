import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { Validators } from '@angular/forms';

import { FormScheme } from '@pe/forms';

import { PaymentMethodEnum } from '../../../../../shared';
import { BasePaymentFormComponent } from '../../../shared/components/base-payment-form.component';
import { ConstantsService } from '../../../shared/services';

interface FormInterface {
  basic: {
    type: string
  };
}

const SOFORT_REGISTER_LINK = `https://www.sofort.com/register/`;

@Component({
  selector: 'external-register',
  templateUrl: './external-register.component.html',
  styleUrls: ['./../../../shared/components/base-account-santander/base-account-santander.component.scss'],
})
export class SofortExternalRegisterComponent extends BasePaymentFormComponent<FormInterface> {

  @Output() onExternalRegisterDone: EventEmitter<void> = new EventEmitter();

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SOFORT;
  formStorageKey: string = 'payment-account-' + this.paymentMethod; // TODO Make more unique

  formScheme: FormScheme;

  private constantsService: ConstantsService = this.injector.get(ConstantsService);

  constructor(injector: Injector) {
    super(injector);
  }

  createFormDeferred(initialData: FormInterface) {

    this.form = this.formBuilder.group({
      basic: this.formBuilder.group({
        type: ['', Validators.required],
      }),
    });
    this.formScheme = {
      fieldsets: {
        basic: [
          {
            name: 'type',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-12 true-height no-border-radius',
              label: this.translateService.translate('categories.payments.form.registrationType.label'),
              required: true,
            },
            selectSettings: {
              panelClass: 'mat-select-dark',
              options: this.constantsService.getRegistrationTypeList(this.paymentMethod),
              placeholder: this.translateService.translate('categories.payments.form.registrationType.placeholder'),
            },
          },
        ],
      },
    };
  }

  onSuccess(): void {
    window.open(SOFORT_REGISTER_LINK + this.form.get('basic').get('type').value, '_blank');
    this.paymentsStateService.setSectionExternalRegisterFilled(this.payment.option);
    this.onExternalRegisterDone.emit();
  }
}
