import {
  PeSubscriptionsPlanAppliesToEnum,
  PeSubscriptionsPlanBillingIntervalsEnum,
  PeSubscriptionsPlanEligibilityEnum,
} from '../../enums';

export const APPLIES_TO = [
  {
    label: 'all_products',
    value: PeSubscriptionsPlanAppliesToEnum.AllProducts,
  },
  {
    label: 'specific_products',
    value: PeSubscriptionsPlanAppliesToEnum.SpecificProducts,
  },
  {
    label: 'specific_categories',
    value: PeSubscriptionsPlanAppliesToEnum.SpecificCategories,
  },
];

export const SUBSCRIBERS_ELIGIBILITY = [
  {
    label: 'all_subscribers',
    value: PeSubscriptionsPlanEligibilityEnum.Everyone,
  },
  {
    label: 'specific_subscribers',
    value: PeSubscriptionsPlanEligibilityEnum.SpecificSubscribers,
  },
  {
    label: 'specific_groups_of_subscribers',
    value: PeSubscriptionsPlanEligibilityEnum.SpecificGroupsOfSubscribers,
  },
];

export const INTERVALS = [
  {
    label: 'every_day',
    value: PeSubscriptionsPlanBillingIntervalsEnum.Day,
  },
  {
    label: 'every_week',
    value: PeSubscriptionsPlanBillingIntervalsEnum.Week,
  },
  {
    label: 'every_month',
    value: PeSubscriptionsPlanBillingIntervalsEnum.Month,
  },
  {
    label: 'every_year',
    value: PeSubscriptionsPlanBillingIntervalsEnum.Year,
  },
];
