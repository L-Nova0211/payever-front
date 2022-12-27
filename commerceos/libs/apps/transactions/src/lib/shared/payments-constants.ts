import { PaymentMethodEnum } from '@pe/checkout-wrapper-sdk-types';

import { PaymentType } from './interfaces';

export const paymentsHaveNoSpecificStatus: PaymentType[] = [
  PaymentMethodEnum.SOFORT,
  PaymentMethodEnum.SANTANDER_FACTORING_DE,
  PaymentMethodEnum.SANTANDER_POS_FACTORING_DE,
  PaymentMethodEnum.SANTANDER_INVOICE_DE,
  PaymentMethodEnum.SANTANDER_POS_INVOICE_DE,
];

export const paymentsHaveCreditAnswer: PaymentMethodEnum[] = [
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT,
  PaymentMethodEnum.SANTANDER_INSTALLMENT,
];

export const paymentsHaveAuthorizeAllowed = [
  PaymentMethodEnum.PAYMILL_CREDITCARD,
  PaymentMethodEnum.PAYMILL_DIRECTDEBIT,
  PaymentMethodEnum.PAYEX_CREDITCARD,
  PaymentMethodEnum.PAYEX_FAKTURA,
  PaymentMethodEnum.SWEDBANK_CREDITCARD,
  PaymentMethodEnum.SWEDBANK_INVOICE,
];

export const paymentsHaveNoSignedField = [
  PaymentMethodEnum.SANTANDER_POS_INVOICE_DE,
];

export const paymentsHaveAmountForCancel: PaymentType[] = [
  PaymentMethodEnum.SANTANDER_INSTALLMENT_NO,
];
