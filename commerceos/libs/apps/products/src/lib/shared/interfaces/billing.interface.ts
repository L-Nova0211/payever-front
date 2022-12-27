export interface RecurringBillingDataInterface {
  interval?: string;
  billingPeriod?: number;
}

export interface RecurringBillingFormInterface extends RecurringBillingDataInterface {
  enabled?: boolean;
}

export interface RecurringBillingInterface extends RecurringBillingFormInterface {
  installed?: boolean;
  url?: string; // For requests
}
