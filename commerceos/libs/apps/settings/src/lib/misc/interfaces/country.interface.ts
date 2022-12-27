export interface CountryInterface {
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  currencies: string[]
  emoji: string;
  ioc: string;
  languages: string[]
  name: string;
  status: CountryStatusEnum;
}

export enum CountryStatusEnum {
  assigned = 'assigned',
  reserved = 'reserved',
  deleted = 'deleted',
  userAssigned = 'user assigned'
}
