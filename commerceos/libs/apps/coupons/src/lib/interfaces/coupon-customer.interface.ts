export interface PeCouponCustomerFieldValueInterface {
  businessId: string;
  id: string;
  name: string;
  type: string;
  groupId: string;
}

export interface PeCouponCustomerFieldInterface {
  fieldId: string;
  id: string;
  value: string;
  contactId: string;
  field: PeCouponCustomerFieldValueInterface;
}

export interface PeCouponCustomerFieldWrapperInterface {
  nodes: PeCouponCustomerFieldInterface[];
}

export interface PeCouponCustomerInterface {
  businessId: string;
  contactFields: PeCouponCustomerFieldWrapperInterface;
  email: string;
  id: string;
  image?: string;
  type: string;
}

export interface PeCouponCustomersInterface {
  [key: string]: boolean | number | string;
}
