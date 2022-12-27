export interface ShippingAddress {
  apartment: string;
  city: string;
  country: string;
  street: string;
  zipCode: string;
  _id: string;
}

export interface RegistrationOrigin {
  account: string;
  url: string;
  source: string;
  id: string;
}

export interface PeUser {
  birthday: string;
  createdAt: string;
  email: string;
  firstName: string;
  hasUnfinishedBusinessRegistration: boolean;
  language: string;
  lastName: string;
  logo: string;
  phone: string;
  salutation: string;
  shippingAddresses: ShippingAddress[];
  updatedAt: string;
  _id: string;
  registrationOrigin?: RegistrationOrigin;
}
