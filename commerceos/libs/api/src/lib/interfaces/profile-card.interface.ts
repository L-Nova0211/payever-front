export enum ProfileCardType {
  Personal = 'Personal',
  Business = 'Business'
}

export interface ProfileCardInterface {
  _id: string;
  type: ProfileCardType;
  cardButtonText: string;
  cardTitle?: string;
  images: string[];
  placeholderTitle?: string;
}
