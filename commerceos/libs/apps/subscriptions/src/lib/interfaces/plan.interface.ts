import {
  PeSubscriptionsPlanAppliesToEnum,
  PeSubscriptionsPlanBillingIntervalsEnum,
  PeSubscriptionsPlanEligibilityEnum,
  PeSubscriptionsPlanStatusEnum,
} from '../enums';

export interface PeSubscriptionsPlanInterface {
  _id?: string;
  applicationScopeElasticId?: string;
  appliesTo?: PeSubscriptionsPlanAppliesToEnum;
  billingPeriod: number;
  categories?: any[];
  interval: PeSubscriptionsPlanBillingIntervalsEnum;
  name: string;
  planType: string;
  products: any[];
  serviceEntityId?: string;
  shortName: string;
  status?: PeSubscriptionsPlanStatusEnum;
  subscribedChannelSets: string[];
  subscribers: any[];
  subscribersEligibility?: PeSubscriptionsPlanEligibilityEnum;
  subscribersGroups?: any[];
  subscribersTotals: number;
  subscriptionNetwork?: string;
  targetFolderId?: string;
  totalPrice: number;
}
