import {
  PeSubscriptionsPlanAppliesToEnum,
  PeSubscriptionsPlanBillingIntervalsEnum,
  PeSubscriptionsPlanEligibilityEnum,
} from './enums';
import {
  PeSubscriptionsNetworkInterface,
  PeSubscriptionsPlanInterface,
} from './interfaces';

export const ICONS = {
  bag: '../assets/icons/bag.svg',
  connect: '../assets/icons/connect.svg',
  dashboard: '../assets/icons/dashboard.svg',
  edit: '../assets/icons/edit.svg',
  group: '../assets/icons/group.svg',
  programs: '../assets/icons/programs.svg',
  settings: '../assets/icons/settings.svg',
  subscriber: '../assets/icons/subscriber.svg',
  themes: '../assets/icons/themes.svg',
  'settings-arrow-open': '../assets/icons/settings-arrow-open.svg',
  'settings-livestatus': '../assets/icons/settings-livestatus.svg',
  'settings-owndomain': '../assets/icons/settings-owndomain.svg',
};

export const PE_SUBSCRIPTIONS_CONTAINER = 'subscriptions';
export const PE_SUBSCRIPTIONS_FIRST_PLAN: PeSubscriptionsPlanInterface = {
  appliesTo: PeSubscriptionsPlanAppliesToEnum.AllProducts,
  billingPeriod: 1,
  categories: [],
  subscribersGroups: [],
  interval: PeSubscriptionsPlanBillingIntervalsEnum.Month,
  name: 'Start plan',
  planType: 'fixed',
  products: [],
  shortName: 'Start plan',
  subscribedChannelSets: [],
  subscribers: [],
  subscribersEligibility: PeSubscriptionsPlanEligibilityEnum.Everyone,
  subscribersTotals: 0,
  subscriptionNetwork: '',
  totalPrice: 0,
};

export const PE_SUBSCRIPTIONS_FIRST_NETWORK: PeSubscriptionsNetworkInterface = {
  favicon: '',
  isDefault: true,
  logo: '',
  name: '',
};

export const BAD_REQUEST = 'bad_request';
export const REQUIRED_MESSAGE = 'subscriptions-app.notify.firstly_create_network';
