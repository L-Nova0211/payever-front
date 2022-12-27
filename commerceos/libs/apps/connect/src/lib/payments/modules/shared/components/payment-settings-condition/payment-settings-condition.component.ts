import { Component, OnInit } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';

import { FormScheme } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  credentials: {
    condition: string
  };
}

@Component({
  selector: 'payment-settings-condition',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentSettingsConditionComponent extends BaseSettingsComponent<FormInterface> implements OnInit {

  formScheme: FormScheme;

  ngOnInit(): void {
    this.paymentReadyFirst$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.paymentsStateService.getConditions(this.payment.variants[this.paymentIndex]).pipe(filter(d => !!d),
      takeUntil(this.destroyed$)).subscribe((conditions) => {
        this.formScheme = {
          fieldsets: {
            credentials: [
              {
                name: 'condition',
                type: 'select',
                fieldSettings: {
                  classList: 'col-xs-12 true-height no-border-radius form-fieldset-field-padding-24',
                },
                selectSettings: {
                  panelClass: 'mat-select-dark',
                  options: conditions.condition,
                },
              },
            ],
          },
        };
      });
    });
  }

  createFormDeferred(initialData: FormInterface) {
    initialData.credentials = initialData.credentials || {} as any;
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        condition: [credentials['condition'] || false],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
