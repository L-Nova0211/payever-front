export interface FeatureConfigurationInterface {
  allowedValues: string[];
  name: string;
}

export interface FeatureTrialInterface {
  _id: string;
  businessId: string;
  createdAt: Date;
}

export interface SubscriptionPlanProductInterface {
  _id: string;
  billingPeriod: number;
  business: string;
  interval: string;
  price: number;
  title: string;
}

export interface PlanSubscriptionPlanInterface {
  _id: string;
  billingPeriod: number;
  business: string;
  interval: string;
  name?: string;
  planType: string;
  product: SubscriptionPlanProductInterface[];
}

export interface SubscriptionPlanInterface {
  _id: string;
  business: string;
  connection: string;
  createdAt: string;
  updatedAt: string;
  subscriptionPlan: PlanSubscriptionPlanInterface[];
}

export interface FeatureSubscriptionInterface {
  _id: string;
  plan: SubscriptionPlanInterface;
  quantity: number;
  reference: string;
  remoteSubscriptionId: string;
  transactionUuid: string;
  trialEnd: Date;
  userId: string;
}

export interface FeaturePlanInterface {
  id: string;
  subscriptions: FeatureSubscriptionInterface[];
}

export interface FeatureProductInterface {
  _id: string;
  id: string;
  features: {
    text?: string;
  }
  createdAt: Date;
  updatedAt: Date;
  plans: FeaturePlanInterface[];
}

export interface FeatureInterface {
  configuration: FeatureConfigurationInterface[];
  product?: FeatureProductInterface[];
  trials?: FeatureTrialInterface[];
}