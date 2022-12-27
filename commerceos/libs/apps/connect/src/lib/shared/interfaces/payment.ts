import { PaymentMethodEnum } from './payment-method.enum';

export type Status = 'enabled' | 'new';

export enum StepEnum {
  missingExternalAuthentication = 'missing-external-authentication',
  externalTips= 'external-tips',
  registerUrl = 'register-url',
  // missingCredentials = 'missing-credentials',
  additionalInfo = 'additional-info',

  uploadCommercialExcerpt = 'upload-commercial-excerpt',
  uploadOnboardingContractFile = 'upload-onboarding-contract-file',
  uploadSepaContractFile = 'upload-sepa-contract-file',
  uploadPassport= 'upload-passport',

  _missingCredentials = 'missing-credentials', // Should be removed in future
}

export enum PanelEnum {
  account = 'account',
  externalRegister = 'externalRegister',
  documents= 'documents',
  settings = 'settings',
  authentication = 'authentication',
  registration = 'registration'
}

export const STEP_UPLOAD_TYPES: StepEnum[] = [
  StepEnum.uploadCommercialExcerpt,
  StepEnum.uploadOnboardingContractFile,
  StepEnum.uploadSepaContractFile,
  StepEnum.uploadPassport,
];

export const STEP_UPLOAD_TYPE_TO_OPTION_KEY: {[StepEnum: string]: string} = {
  'upload-onboarding-contract-file': 'onboarding_contract',
  'upload-sepa-contract-file': 'sepa_contract',
  'upload-passport': 'passport',
};

export const STEP_UPLOAD_TYPE_TO_BUSINESS_KEY: {[StepEnum: string]: string} = {
  'upload-commercial-excerpt': 'commercialRegisterExcerptFilename',
};

export const STEP_DOWNLOAD_TYPE_TO_BUSINESS_KEY: {[StepEnum: string]: string} = {
  'upload-commercial-excerpt': 'commercialRegisterExcerptFilename',
  'upload-onboarding-contract-file': 'onboarding_contract',
  'upload-sepa-contract-file': 'sepa_contract',
  'upload-passport': 'passport',
};

export interface StepInterface {
  filled: boolean;
  message: string;
  open_dialog: boolean;
  type: StepEnum;
  url: string;
}

export interface VariantListItemInterface {
  name?: string;
  accept_fee?: boolean;
  completed?: boolean;
  credentials?: {[key: string]: string};
  options?: any; // TODO
  fixed_fee?: number;
  general_status?: string; // TODO
  id: number;
  max?: number;
  min?: number;
  payment_option_id: number;
  shop_redirect_enabled?: boolean;
  status?: Status;
  variable_fee: number;

  default: boolean;
  credentials_valid: boolean; // instead of missing_steps
}

export interface MissingStepsInterface {
  success_message: string;
  missing_steps: StepInterface[];
}

export interface MappedVariantListItemInterface {
  [key: string]: {
    missing_steps: MissingStepsInterface,
    variants: VariantListItemInterface[]
  };
}

export interface PaymentOptionExInterface {
  contract_length: number;
  description_fee?: string;
  description_offer?: string;
  fixed_fee?: number;
  id?: number;
  info_url?: string;
  instruction_text?: string;
  max?: number;
  merchant_allowed_countries: string[];
  min?: number;
  name?: string;
  payment_method?: PaymentMethodEnum;
  position: number;
  related_country?: string;
  slug?: string;
  status?: string;
  thumbnail1?: string;
  thumbnail2?: string;
  variable_fee?: number;
}

export interface PaymentWithVariantInterface {
  businessUuid: string; // TODO Maybe not base place for it
  option: PaymentOptionExInterface;
  missing_steps: MissingStepsInterface;
  variants: VariantListItemInterface[]; // TODO Rename variants to variants
}

export interface SantanderDkStoreProductDataInterface {
  Id: number;
  Name: string;
  EstablishmentFee: number;
  AccountFee: number;
  NominalInterest: number;
  MinAmount: number;
  MaxAmount: number;
  MinMonth: number;
  MaxMonth: number;
  IsSafeInsuranceAllowed: boolean;
  SafeInsurancePercentOfMonthlyPayment: number;
  PaymentFreePeriod: {
    TermsInMonths: number,
    InterestRate: number,
    payLaterType: boolean
  };
  isSelected: boolean;
}

export interface BusinessOptionConditionOptionInterface {
  label: string;
  value: string;
  options: {
    isCCPRate: boolean,
    isSFRate: boolean
  };
}

export interface BusinessOptionConditionsInterface {
  nationalities?: BusinessOptionConditionOptionInterface[];
  residence_types?: BusinessOptionConditionOptionInterface[];
  identification_types?: BusinessOptionConditionOptionInterface[];
  employment_choices?: BusinessOptionConditionOptionInterface[];
  marital_statuses?: BusinessOptionConditionOptionInterface[];
  freelancer_branches?: BusinessOptionConditionOptionInterface[];
  condition?: BusinessOptionConditionOptionInterface[];
  commodity_groups?: BusinessOptionConditionOptionInterface[];
  salutations?: BusinessOptionConditionOptionInterface[];
  guarantor_relations?: BusinessOptionConditionOptionInterface[];
  credit_insurance_protection_choices?: BusinessOptionConditionOptionInterface[];
}
