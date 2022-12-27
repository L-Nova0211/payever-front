export interface SiteAccessConfigInterface {
  approvedCustomersAllowed: boolean;
  createdAt: string;
  id: string;
  internalDomain: string;
  internalDomainPattern: string;
  isLive: boolean;
  isLocked: boolean;
  isPrivate: boolean;
  ownDomain: any;
  privateMessage: any;
  site: string;
  socialImage: any;
  updatedAt: string;
  version: string;
  _id: string;
};

export interface SiteInterface {
  accessConfig: SiteAccessConfigInterface;
  businessId: string;
  channelSet: string;
  createdAt: string;
  domain: []
  id: string;
  isDefault: boolean;
  name: string;
  updatedAt: string;
  _id: string;
  picture?: string;
}
