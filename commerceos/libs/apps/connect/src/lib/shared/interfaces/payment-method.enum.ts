
export enum PaymentMethodEnum { // TODO Take from checkout wrapper SDK
  CASH = 'cash',
  INVOICE = 'invoice', // Not used
  PAYEX_CREDITCARD = 'payex_creditcard',
  PAYEX_FAKTURA = 'payex_faktura',
  PAYMILL_CREDITCARD = 'paymill_creditcard', // Not used
  PAYMILL_DIRECTDEBIT = 'paymill_directdebit', // Not used
  PAYPAL = 'paypal',
  SANTANDER_CPP_INSTALLMENT = 'santander_ccp_installment',
  SANTANDER_FACTORING_DE = 'santander_factoring_de',
  SANTANDER_POS_FACTORING_DE = 'santander_pos_factoring_de',
  SANTANDER_INSTALLMENT = 'santander_installment',
  SANTANDER_INSTALLMENT_AT = 'santander_installment_at',
  SANTANDER_INSTALLMENT_DK = 'santander_installment_dk',
  SANTANDER_INSTALLMENT_NO = 'santander_installment_no',
  SANTANDER_INSTALLMENT_SE = 'santander_installment_se',
  SANTANDER_INSTALLMENT_NL = 'santander_installment_nl',
  SANTANDER_INVOICE_DE = 'santander_invoice_de',
  SANTANDER_INVOICE_NO = 'santander_invoice_no',
  SANTANDER_POS_INSTALLMENT = 'santander_pos_installment',
  SANTANDER_POS_INSTALLMENT_DK = 'santander_pos_installment_dk', // Not used
  SANTANDER_POS_INSTALLMENT_NO = 'santander_pos_installment_no', // Not used
  SANTANDER_POS_INSTALLMENT_SE = 'santander_pos_installment_se',
  SANTANDER_POS_INVOICE_DE = 'santander_pos_invoice_de',
  SANTANDER_POS_INVOICE_NO = 'santander_pos_invoice_no', // Not used
  SOFORT = 'sofort',
  STRIPE = 'stripe',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  STRIPE_DIRECTDEBIT = 'stripe_directdebit' // Not used
}
