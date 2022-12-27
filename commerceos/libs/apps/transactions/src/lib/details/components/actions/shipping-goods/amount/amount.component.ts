import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { LocaleConstantsService } from '@pe/i18n';

import { BaseShippingComponent } from '../base.component';

@Component({
  selector: 'pe-amount',
  templateUrl: './amount.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountComponent extends BaseShippingComponent {
  @Input() refundTotal: number;

  form: FormGroup;

  private localeConstantsService = this.injector.get(LocaleConstantsService);

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  amountChanged(event: KeyboardEvent): void {
    if (!`${this.form.get('amount').value}${event.key}`.match(/^(\d+((\.|\,)\d{0,2})?)$/g)) {
      event.preventDefault();
    }
  }
}
