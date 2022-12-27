export const FORM_ERRORS = {
  businessStatus: {
    hasError: false,
    errorMessage: '',
    label: 'forms.business_create.businessStatus.label',
  },
  name: {
    hasError: false,
    errorMessage: '',
    label: 'forms.business_create.companyName.label',
  },
  status: {
    hasError: false,
    errorMessage: '',
    label: 'forms.business_create.status.label',
  },
  salesRange: {
    hasError: false,
    errorMessage: '',
    label: 'forms.business_create.sales.label',
  },
  industry: {
    hasError: false,
    errorMessage: '',
    label: 'forms.business_create.industry.label',
  },
  countryPhoneCode: {
    hasError: false,
    errorMessage: '',
    label: 'forms.business_create.countryPhoneCode.label',
  },
  phoneNumber: {
    hasError: false,
    errorMessage: '',
    label: 'forms.business_create.phoneNumber.label',
  },
};

export const SALES: object[] = [
  { label: 'RANGE_1', max: 0 },
  { label: 'RANGE_2', min: 0, max: 5000 },
  { label: 'RANGE_3', min: 5000, max: 50000 },
  { label: 'RANGE_4', min: 50000, max: 250000 },
  { label: 'RANGE_5', min: 250000, max: 1000000 },
  { label: 'RANGE_6', min: 1000000 },
];
