export const REQUIRED_FIELDS_CASH: string[] = [
  'bankAccount.country',
  'bankAccount.bic',
  'bankAccount.iban',
];

export const REQUIRED_FIELDS_SANTANDER_DE: string[] = [
  'companyDetails.foundationYear',
  'taxes.taxId',
  'bankAccount.country',
  'bankAccount.city',
  'bankAccount.bankName',
  'companyAddress.country',
  'companyAddress.city',
  'companyAddress.street',
  'companyAddress.zipCode',
];

export const REQUIRED_FIELDS_SANTANDER_NO: string[] = REQUIRED_FIELDS_SANTANDER_DE;

export const REQUIRED_FIELDS_SANTANDER_DK: string[] = [
  // companyName - it's never blank
  'contactDetails.salutation',
  'contactDetails.firstName',
  'contactDetails.lastName',
  'taxes.companyRegisterNumber',
  'companyDetails.legalForm',
  'companyDetails.urlWebsite',
  'bankAccount.country',
  'bankAccount.bic',
  'bankAccount.iban',
];

export const REQUIRED_FIELDS_SANTANDER_SE: string[] = [
  // companyName - it's never blank
  'contactDetails.firstName',
  'contactDetails.lastName',
  'contactDetails.phone',
  'companyDetails.urlWebsite',
];
