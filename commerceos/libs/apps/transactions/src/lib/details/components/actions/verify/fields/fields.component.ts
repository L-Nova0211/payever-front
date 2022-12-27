import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import moment from 'moment';

import { AddressService } from '@pe/forms';
import { LocaleConstantsService } from '@pe/i18n';

import { DetailInterface } from '../../../../../shared';


@Component({
  selector: 'pe-verify-action-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionVerifyFieldsComponent {
  @Input() order: DetailInterface;

  constructor(
    private addressService: AddressService,
    private localeConstantsService: LocaleConstantsService
  ) { }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  get birthday(): string {
    const date: Date = this.order?.details['birthday'] ? new Date(this.order.details['birthday']) : null;

    return date ? moment(date).format('DD.MM.YYYY') : null;
  }

  get billingAddressName(): string {
    return this.addressService.getNameString(this.order.billing_address);
  }

  get billingAddressLine(): string {
    return this.addressService.getAddressString(this.order.billing_address);
  }
}
