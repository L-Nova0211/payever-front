import { PaymentMethodEnum } from '@pe/checkout-wrapper-sdk-types';
import { AddressInterface } from '@pe/forms-core';

import { GuarantorTypeEnum } from '../enums';

import { ActionUploadType } from './action-upload.type';
import { UIActionInterface } from './action.interface';
import { ActionTypeEnum } from './action.type';
import { PaymentType } from './payment.type';
import { SantanderAppSpecificStateType, StatusType } from './status.type';


export interface BusinessVatInterface {
  country: string;
  // id: string|number;
  // uuid: string;
  value: number;
}

export interface ActionInterface {
  action: ActionTypeEnum;
  enabled: boolean;
  partialAllowed: boolean;
  isOptional: boolean;
  label?: string;
  description?: string;
}

export interface ActionMapInterface {
  mainActions: UIActionInterface[];
  optionalActions: UIActionInterface[];
}

export interface MailActionInterface extends ActionInterface {
  mailEvent?: MailEventInterface;
}

export interface MailEventInterface {
  id: string;
}

export interface RefundItemsInterface {
  count: number;
  payment_item_id: string;
  item_uuid?: string;
  identifier?: string;
}

export interface OrderHistoryInterface {
  action: ActionTypeEnum;
  created_at: string;
  id: string;
  refund_items: RefundItemInterface[];
  upload_items: any[];
  payment_status: string;
  reason: string;
  is_items_restocked: boolean;
  user: any;
  amount?: string;
  reference?: string;
  custom_data?: any;
  psp_status?: string;
  requirements_state?: string;
}

export interface PaymentDetailsInterface extends PaymentSecurityInterface {
  // Common
  // delivery_fee?: number | string;
  prefilled?: boolean;

  // Credit cart & Paymill Credit Card
  card_last_digits?: string;
  card_name?: string;
  card_number?: string;
  charge_id?: string;
  cvc?: string;
  exp_month?: string;
  exp_year?: string;
  paymill_payment_id?: string;
  paymill_pre_auth_id?: string;
  token?: string;

  // PayEx Financing Invoice
  accept_conditions?: boolean;
  annual_fee?: string;
  annual_interest?: string;
  application_token?: string;
  applied_amount?: string;
  billing_fee?: string;
  campaign_code?: string;
  contract_sign_bank_i_d_code?: string;
  contract_sign_status_code?: number;
  details_token?: string;
  effective_interest?: string;
  employed_from?: string;
  employed_to?: string;
  employment_type?: string;
  monthly_cost?: string;
  months?: string;
  phone_number?: string;
  social_security_number?: string;
  startup_fee?: string;
  taxable_income?: string;
  total_cost?: string;

  // Santander
  accept_terms_credit_europe?: boolean;
  accept_terms_santander?: string;
  address_cell_phone?: string;
  address_phone?: string;
  address_resident_since?: string;
  guarantor_type?: GuarantorTypeEnum;
  // application_number?: string;
  application_status?: string;
  // bank_i_b_a_n?: string;
  click_and_collect?: boolean;
  comfort_card_issued?: boolean;
  comment?: string;
  commodity_group?: string;
  condition?: string;
  condition_name?: string;
  credit_accepts_requests_to_credit_agencies?: boolean;
  credit_calculation?: string;
  credit_confirms_self_initiative?: boolean;
  credit_due_date?: number;
  credit_duration_in_months?: string;
  credit_protection_insurance?: boolean;
  employed_since?: string;
  employed_until?: string;
  employer?: string;
  employment?: number;
  employment_limited?: boolean;
  freelancer?: boolean;
  freelancer_company_name?: string;
  freelancer_employed_since?: string;
  freelancer_industry?: string;
  freelancer_legal_form?: string;
  housing_costs?: string;
  identification_date_of_expiry?: string;
  identification_date_of_issue?: string;
  identification_number?: string;
  identification_place_of_issue?: string;
  income_residence?: string;
  initial_payment?: number;
  monthly_amount?: number;
  monthly_maintenance_payments?: string;
  net_income?: string;
  net_income_partner?: string;
  other_income?: string;
  personal_birth_name?: string;
  personal_date_of_birth?: string;
  personal_marital_status?: string;
  personal_nationality?: string;
  personal_other_nationality?: string;
  personal_place_of_birth?: string;
  personal_residence_permit?: string;
  personal_salutation?: string;
  personal_title?: string;
  prev_address?: boolean;
  prev_address_city?: string;
  prev_address_resident_since?: string;
  prev_address_street_and_number?: string;
  prev_address_zip?: string;
  prev_employed_since?: string;
  prev_employer?: string;
  prev_employment_details?: string;
  rental_income?: string;
  sort_of_income?: string;
  total_credit_amount?: number;
  type_of_identification?: string;
  pos_verify_type?: number;
  posVerifyType?: number;
  week_of_delivery?: string;
  _e_u?: number[];

  // Santander POS Installment (DE)
  credit_answer?: string;
  customer_signed?: boolean;
  guarantor_signed?: boolean;
  is_customer_signing_triggered?: boolean;
  is_fully_signed?: boolean;
  is_guarantor_signing_triggered?: boolean;
  is_santander_notified_about_customer_signing?: boolean;
  is_santander_notified_about_guarantor_signing?: boolean;
  is_verified?: boolean;

}

export type PaymentSecurityInterface = {
  // Zinia
  otp_value?: string;

  // POS Installments DE
  idNumber?: string;
}

export interface PaymentSecurityCode {
  name: string;
  type: 'string' | 'number' | 'boolean';
  actions: ActionTypeEnum[],
  mask?: string;
}

export const VERIFY_PAYMENTS_CONTROLS: { [key: string]: PaymentSecurityCode } = {
  [PaymentMethodEnum.ZINIA_POS]: { name: 'otp_value', type: 'string', mask: 'AAAAA', actions: [ActionTypeEnum.ShippingGoods] },
  [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: { name: 'idNumber', type: 'string', mask: 'AAAAA', actions: [ActionTypeEnum.Verify] },
};

export interface PaymentDetailsWithOrderInterface extends PaymentDetailsInterface {
  order: {
    finance_id?: string;
    application_no?: string;
    reference?: string;
    usage_text?: string; // Santander Invoice (DE)
    pan_id?: string;
    iban?: string;
  };
}

export interface ItemOptionInterface {
  name: string;
  value: string;
}

export interface ItemInterface {
  uuid: string;
  description: string;
  fixed_shipping_price: number;
  identifier: string;
  item_type: string;
  name: string;
  price: number;
  price_net: number;
  product_variant_uuid: string;
  quantity: number;
  shipping_price: number;
  shipping_settings_rate: number;
  shipping_settings_rate_type: string;
  shipping_type: string;
  thumbnail: string;
  updated_at: string;
  url: string;
  vat_rate: number;
  weight: number;
  created_at: string;
  options?: ItemOptionInterface[];
}

export interface RefundItemInterface {
  count: number;
  item_uuid?: string;
  identifier?: string;
}

export interface RefundProductInterface {
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  quantity: number;
}

export interface DetailsTransactionInterface {
  id: string;
  original_id: string;
  uuid: string;
  currency: string;
  amount: number;
  amount_refunded: number;
  amount_rest: number;
  amount_left: number;
  amount_refund_rest: number;
  amount_capture_rest: number;
  total: number;
  total_left: number;
  created_at: string;
  updated_at: string;

  example: boolean;

  // For Invoice DE
  amount_refund_rest_with_partial_capture?: number;
  amount_cancel_rest?: number;
  amount_capture_rest_with_partial_cancel?: number;
  delivery_fee_left?: number;
}

export interface DetailsStatusInterface {
  general: StatusType;
  specific: SantanderAppSpecificStateType;
  place: string;
  color: string;
}
export interface DetailInterface {
  actions: ActionInterface[];

  transaction: DetailsTransactionInterface;
  billing_address: AddressInterface;
  details: PaymentDetailsWithOrderInterface;
  payment_option: {
    id: string,
    type: PaymentType,
    down_payment: number | string;
    payment_fee: number | string;
    fee_accepted: boolean;
  };
  status: DetailsStatusInterface;
  channel_set: {
    uuid: string;
  };
  user: {
    uuid: string;
  };
  business: {
    uuid: string;
  };
  payment_flow: {
    id: string;
  };
  channel: {
    name: string;
    uuid: string;
  };
  customer: {
    email: string;
    name: string;
  };
  history: OrderHistoryInterface[];
  cart: {
    items: ItemInterface[];
    available_refund_items: RefundItemInterface[];
  };
  merchant: {
    email: string;
    name: string;
  };
  seller: {
    email: string;
    name: string;
  };
  shipping: {
    address: AddressInterface;
    category: string;
    method_name: string;
    option_name: string;
    delivery_fee: number | string;
    example_label: string;
    order_id: string;
  };
  store: {
    id: string,
    name: string
  };

  _shippingActions?: ActionInterface[];
  _mailerActions?: MailActionInterface[];

  _itemsArray?: { [propName: string]: ItemInterface };
  _refundFixedAmount?: number;
  _refundItems?: RefundItemsInterface[];
  _refundReason?: string;

  _isCash?: boolean;
  _isInvoice?: boolean;
  _isPayex?: boolean;
  _isSwedbank?: boolean;
  _isPaymill?: boolean;
  _isPaypal?: boolean;
  _isSantander?: boolean;
  _isSantanderDe?: boolean;
  _isSantanderAt?: boolean;
  _isSantanderDk?: boolean;
  _isSantanderNo?: boolean;
  _isSantanderNl?: boolean;
  _isSantanderPosDeFactInvoice?: boolean;
  _hideUpdateStatusAction?: boolean;
  _isSantanderDeInvoice?: boolean;
  _isSantanderPosDe?: boolean;
  _isSantanderNoInvoice?: boolean;
  _isForceHideUpdateStatus?: boolean;
  _isSofort?: boolean;
  _isStripe?: boolean;
  _showSantanderContract?: boolean;
  _showSantanderPosDeContract?: boolean;
  _showSantanderFactoringContract?: boolean;
  _showSantanderInvoiceContract?: boolean;
  _showSantanderDeQr?: boolean;
  _santanderApplicationNo?: string;
  _applicationNo?: string;
  _panId?: string;
  _statusColor?: string;
}

export interface ActionRequestRefundItemsInterface {
  identifier: string;
  count: number;
  price: number;
  quantity: number;
}

export interface ActionRequestUpdateDataInterface {
  deliveryFee?: string;
  productLine?: ItemInterface[];
}

export interface ActionRequestVerifyInterface {
  idNumber: string;
  applicant: number;
};

export interface ActionRequestInterface {
  amount?: number;
  dunningCosts?: number;
  customerId?: string;
  invoiceDate?: string;
  itemsRestocked?: boolean;
  reason?: string;
  delivery_fee?: number;
  refundCollectedBySepa?: boolean;
  payment_items?: ActionRequestRefundItemsInterface[];
  refundGoodsReturned?: boolean;
  refundInvoiceNumber?: string;
  status?: string;
  updateData?: ActionRequestUpdateDataInterface;
  identification?: ActionRequestVerifyInterface[]
}

export interface UploadActionRequestInterface {
  uploadType: ActionUploadType;
  file: File;
}

export interface ProcessShippingOrderInterface {
  businessName: string;
  transactionId: string;
  transactionDate: string;
  legalText: string;
  billingAddress: ProcessShippingBillingAddressInterface;
  shipmentDate: string; // YYYY-MM-DD
}

export interface ProcessShippingBillingAddressInterface {
  name: string;
  streetName: string;
  streetNumber: string;
  city: string;
  stateProvinceCode: string;
  zipCode: string;
  countryCode: string;
  phone: string;
}
