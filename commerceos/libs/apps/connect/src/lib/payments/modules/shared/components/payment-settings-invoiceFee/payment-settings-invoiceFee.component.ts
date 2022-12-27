import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take, map, takeUntil } from 'rxjs/operators';

import { AddonPrependStyle, AddonType, FormScheme } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  options: {
    invoiceFee: string
  };
}

@Component({
  selector: 'payment-settings-invoiceFee',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentSettingsInvoiceFeeComponent extends BaseSettingsComponent<FormInterface> implements OnInit {

  currencySubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  fieldsetsKey = 'options';

  formScheme: FormScheme = {
    fieldsets: {
      options: [
        {
          name: 'invoiceFee',
          type: 'input-currency',
          fieldSettings: {
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
          },
          inputCurrencySettings: {
            maxLength: 12,
          },
          addonPrepend: this.currencySubject.asObservable().pipe(map((currency) => {
            return {
              addonPrependStyle: AddonPrependStyle.Inline,
              addonType: AddonType.Text,
              text: currency,
            };
          })),
          // TODO Must be added later
          // tooltipIcon: {
          //   tooltipMessage: 'You can specify a transaction fee here, it will be added to customers amount if you let your customers cover the fee.'
          // }
        },
      ],
    },
  };

  ngOnInit(): void {
    this.paymentReadyFirst$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.paymentsStateService.getUserBusiness(
      this.payment.businessUuid).pipe(filter(d => !!d), take(1), takeUntil(this.destroyed$)).subscribe((data) => {
        if (data.currency) {
          this.currencySubject.next(data.currency);
        } else {
          console.error('Not possible to get currency of business');
          this.currencySubject.next('EUR');
        }
      });
    });
  }

  createFormDeferred(initialData: FormInterface) {
    const extended = this.payment.variants[this.paymentIndex] || ({} as any);
    const options = extended.options || {};
    this.form = this.formBuilder.group({
      options: this.formBuilder.group({
        invoiceFee: [options['invoiceFee']],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
