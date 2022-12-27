export interface BusinessDataInterface {
  // TODO Replace all any
  businessUuid: string;
  panels: {
    accountings: any[],
    communications: any[],
    payments: any[],
    shopSystems: any[],
    shippings: any[],
  };
  userData: {
    accountings: any[],
    communications: any[],
    payments: any[],
    shopSystems: any[],
    shippings: any[],
  };
}

export interface UserBusinessDataInterface {
  businesses: UserBusinessInterface[];
}

export interface UserBusinessInterface {
  _id: string;
  name: string;
  active: boolean;
  companyDetails: any; // TODO Type
  companyAddress: any; // TODO Type
  contactDetails: any; // TODO Type
  bankAccount: any; // TODO Type
  taxes: any; // TODO Type
  currency: string;
  themeSettings?: {
    theme?: string;
  };
}
