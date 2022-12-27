import { Injectable } from '@angular/core';

import { SelectOptionInterface } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { PaymentMethodEnum } from '../../../../shared';

@Injectable()
export class ConstantsService {

  constructor(private translateService: TranslateService) {}

  getCartSoftwareList(paymentMethod: PaymentMethodEnum): SelectOptionInterface[] {
    return [
      { value: '', label: this.translate('software_cards.use_cart_software') },
      { value: 'Nein', label: this.translate('software_cards.dont_use_cart_software') },
    ];
  }

  getAcceptFeeList(paymentMethod: PaymentMethodEnum): SelectOptionInterface[] {
    return [
      { value: true, label: this.translate('accept_fee.merchant_covers_fee') },
      { value: false, label: this.translate('accept_fee.customer_covers_fee') },
    ];
  }

  getPaymentActionList(paymentMethod: PaymentMethodEnum): SelectOptionInterface[] {
    return [
      { value: 'Sale', label: this.translate('payment_action.sale') },
      { value: 'Authorization', label: this.translate('payment_action.authorization') },
      { value: 'Order', label: this.translate('payment_action.order') },
    ];
  }

  getRegistrationTypeList(paymentMethod: PaymentMethodEnum): SelectOptionInterface[] {
    return [
      {
        label: this.translate('registration_types.payever_0_8_owg_spezial'),
        value: 'payever_0_8_owg_spezial',
      },
      {
        label: this.translate('registration_types.payeverdigital'),
        value: 'payeverdigital',
      },
      {
        label: this.translate('registration_types.payeveradult'),
        value: 'payeveradult',
      },
    ];
  }

  private translate(key: string): string {
    return this.translateService.translate(`categories.payments.lists.${key}`);
  }
}

