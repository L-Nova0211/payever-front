import { EventEmitter, Injector, Input, Output, Directive } from '@angular/core';
import { cloneDeep, isEqual } from 'lodash-es';

import { PaymentMethodEnum } from '../../../../../shared';
import { SettingsOptionsInterface } from '../base-main.component';
import { BasePaymentFormComponent } from '../base-payment-form.component';

@Directive()
export abstract class BaseSettingsComponent<T> extends BasePaymentFormComponent<T> {

  @Input() paymentMethod: PaymentMethodEnum;
  @Input() paymentIndex = 0;
  @Output() changed: EventEmitter<SettingsOptionsInterface> = new EventEmitter();

  startValue: T;
  hideDisabled = false;

  fieldsetsKey = 'credentials';
  isSaveAsFormOptions = false;

  constructor(injector: Injector) {
    super(injector);
  }

  get paymentMethodValue() {
    return this.paymentMethod;
  }

  formStorageKey = 'payment-settings-' + this.paymentMethodValue;

  afterCreateFormDeferred() {
    this.startValue = cloneDeep(this.form.value);
  }

  protected onUpdateFormData(formValues: any): void {
    if (this.startValue && formValues && !isEqual(this.startValue, formValues)) {
      this.startValue = cloneDeep(this.form.value);
      this.changed.emit(
        this.isSaveAsFormOptions ?
          { options:  this.form.value } :
          { settings: this.form.value }
      );
    }
  }

  onSuccess(): void {
    return;
  }
}
