import { PaymentMethodEnum } from '@pe/checkout-wrapper-sdk-types';

export const PAYMENTS_HAVE_PARTIAL: PaymentMethodEnum[] = [
  PaymentMethodEnum.SANTANDER_INVOICE_NO,
  PaymentMethodEnum.ZINIA_BNPL,
  PaymentMethodEnum.ZINIA_BNPL_DE,
  PaymentMethodEnum.ZINIA_INSTALMENT,
  PaymentMethodEnum.ZINIA_INSTALMENT_DE,
  PaymentMethodEnum.ZINIA_POS,
  PaymentMethodEnum.ZINIA_POS_DE,
  PaymentMethodEnum.ZINIA_SLICE_THREE,
  PaymentMethodEnum.ZINIA_SLICE_THREE_DE,
];
