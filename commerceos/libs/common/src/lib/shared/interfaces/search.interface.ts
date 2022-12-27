export interface SpotlightSearch {
  heading: string,
  items: SearchGroupItems[],
}

export interface SearchGroup {
  total?: object;
}
  
export interface SearchGroupItems {
  app: string;
  businessId: string;
  description: string;
  title: string;
  icon?: string;
  _id?: string;
  serviceEntityId: string;
  url?: any[];
  imageIconSrc?: string;
  logo?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  subType?: string;
}