import { AddressInterface } from '@pe/forms-core';


export interface ShippingSlipInterface {
  billingAddress: AddressInterface;
  businessName: string;
  from: ShippingAddressInterface;
  legalText: string;
  products: ProductInterface[];
  to: ShippingAddressInterface
  processedAt?: string;
}

export interface ShippingAddressInterface extends AddressInterface {
  address?: string;
  countryCode?: string;
  name?: string;
  stateProvinceCode?: string;
  streetNumber?: string;
  streetName?: string;
  zipCode?: string;
}

export interface ProductInterface {
  currency?: string;
  dimensionUnit?: string;
  height?: number;
  length?: number;
  name?: string;
  price?: number;
  quantity?: number;
  uuid?: string;
  weight?: number;
  weightUnit?: number;
  width?: string;
}

export interface ShippingLabelInterface {
  label: string;
  returnLabel: string;
  shipmentNumber: string;
  status: boolean;
  trackingUrl: string
};
