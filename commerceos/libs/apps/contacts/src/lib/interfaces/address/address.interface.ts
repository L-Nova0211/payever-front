export enum SalutationEnum {
  SALUTATION_MR = 'Mr.',
  SALUTATION_MRS = 'Mrs.'
}

export interface AddressInterface {
  email?: string;
  city?: string;
  country?: string;
  country_name?: string;
  discr?: string;
  extra_phone?: string;
  fax?: string;
  first_name?: string;
  id?: string | number;
  last_name?: string;
  mobile_phone?: string;
  phone?: string;
  salutation?: SalutationEnum;
  social_security_number?: string;
  street?: string;
  street_name?: string;
  street_number?: string;
  type?: string;
  zip_code?: string;
  apartment?: string;
  stateProvinceCode?: string;
}
