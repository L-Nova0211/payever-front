import {
  PeAffiliatesProgramAppliesToEnum,
  PeAffiliatesProgramCommissionTypesEnum,
  PeAffiliatesProgramStatusesEnum,
} from './enums';
import {
  PeAffiliatesNetworkInterface,
  PeAffiliatesProgramInterface,
} from './interfaces';

export const ICONS = {
  bag: '../assets/icons/bag.svg',
  bank: '../assets/icons/bank.svg',
  business: '../assets/icons/business.svg',
  calendar: '../assets/icons/calendar.svg',
  connect: '../assets/icons/connect.svg',
  dashboard: '../assets/icons/dashboard.svg',
  edit: '../assets/icons/edit.svg',
  settings: '../assets/icons/settings.svg',
  themes: '../assets/icons/themes.svg',
  'settings-arrow-open': '../assets/icons/settings-arrow-open.svg',
  'settings-livestatus': '../assets/icons/settings-livestatus.svg',
  'settings-owndomain': '../assets/icons/settings-owndomain.svg',
};

export const PE_AFFILIATES_CONTAINER = 'affiliates';
export const PE_AFFILIATES_FIRST_PROGRAM: PeAffiliatesProgramInterface = {
  affiliateBranding: '',
  appliesTo: PeAffiliatesProgramAppliesToEnum.AllProducts,
  assets: 0,
  categories: [],
  commission: [],
  commissionType: PeAffiliatesProgramCommissionTypesEnum.Amount,
  cookie: 0,
  currency: 'usd',
  defaultCommission: 10,
  inviteLink: '',
  startedAt: new Date().toISOString(),
  name: 'Start program',
  products: [],
  programApi: 'start-program',
  status: PeAffiliatesProgramStatusesEnum.Active,
  url: '',
};

export const PE_AFFILIATES_FIRST_NETWORK: PeAffiliatesNetworkInterface = {
  favicon: '',
  isDefault: true,
  logo: '',
  name: '',
};

export const PE_EG_AFFILIATE = {
  email: 'frodo.baggins@lotr.hell',
  firstName: 'Frodo',
  lastName: 'Baggins',
};

export const BAD_REQUEST = 'bad_request';
export const REQUIRED_MESSAGE = 'affiliates-app.notify.firstly_create_network';
