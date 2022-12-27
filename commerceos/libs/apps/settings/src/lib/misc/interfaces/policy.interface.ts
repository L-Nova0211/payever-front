export enum PoliciesTypes {
  legal = 'legal',
  disclaimer = 'disclaimer',
  refund_policy = 'refund_policy',
  shipping_policy = 'shipping_policy',
  privacy = 'privacy'
}

export interface PolicyInterface  {
  business: {
      id: string;
  };
  content: string;
  type: PoliciesTypes;
}
