import { BehaviorSubject } from 'rxjs';

import { FolderItem } from '@pe/folders';

export enum IntegrationCategory {
  Payments = 'payments',
  Accountings = 'accountings',
  Shippings = 'shippings',
  Messaging = 'messaging',
  Products = 'products',
  ShopSystems = 'shopsystems',
  Communications = 'communications'
}

export interface IntegrationShortStatusInterface {
  name: string;
  installed: boolean;
}

export interface IntegrationSubscriptionInterface {
  _id: string;
  installed: boolean;
  integration: IntegrationInfoInterface;
}

export interface IntegrationStatusInterface {
  installed: boolean;
}

export  interface IntegrationsListResponseInterface {
  integrations: IntegrationSubscriptionInterface[];
  total: number;
}

export interface IntegrationInfoInterface {
  _id: string;
  subscriptionId?: string;
  name: string;
  enabled: boolean;
  category: IntegrationCategory;
  displayOptions: IntegrationDisplayOptionsInterface;
  installationOptions: IntegrationInstallationOptionsInterface;
  timesInstalled: number;
  reviews: IntegrationReviewInterface[];
  ratingsPerRate: [];
  ratingsCount: number;
  avgRating: number;
  latestVersion: IntegrationVersionInterface;
  isFolder: boolean;
  parentFolderId: string;
  extension?: { // For third party
    formAction: {
      endpoint: string,
      method: string
    },
    url: string
  };
  connect?: { // For third party
    formAction: {
      actionEndpoint: string,
      initEndpoint: string
    },
    url: string,
    sendApiKeys: boolean,
  };
  loadImageLazy?: boolean;
  installed?: boolean;
  badge?: IntegrationInfoBadgeInterface;
  isLoading$?: BehaviorSubject<boolean>;
}

export interface IntegrationInfoBadgeInterface {
  label: string;
  backgroundColor: string;
  color: string;
}

export interface IntegrationInfoWithStatusInterface extends IntegrationInfoInterface {
  _status: IntegrationStatusInterface;
  status: IntegrationStatusInterface;
}

export interface IntegrationReviewInterface {
  title: string;
  text: string;
  rating?: number;
  userFullName?: string;
  reviewDate: string;
  userId?: string;
}

export interface IntegrationDisplayOptionsInterface {
  icon: string;
  title: string;
}

export interface IntegrationInstallationOptionsInterface {
  countryList: string[];
  links: IntegrationInstallationOptionsLinksInterface[];
  optionIcon: string;
  price: string;
  category: string;
  developer: string;
  languages: string;
  description: string;
  appSupport: string;
  website: string;
  pricingLink: string;
}

export interface IntegrationInstallationOptionsLinksInterface {
  type: string;
  url: string;
}

export interface IntegrationVersionInterface {
  _id: string;
  version: string;
  description: string;
  versionDate: string;
}

export interface CustomIntegrationsFolder {
  _id: string;
  folderId?: string;
  businessId: string;
  name: string;
  image?: string;
  icon?: string;
  description?: string;
  parent: string;
  tags: string[];
  integrations?: string[];
}

export interface PeCategoryIntegrations {
  [key: string]: {
    processed: boolean
  }
}

export interface PeIntegrationsCache {
  [key: string]: {
    subject: BehaviorSubject<IntegrationInfoWithStatusInterface>,
    processed: boolean
  }
}

export interface PeFoldersCache {
  [key: string]: {
    subject: BehaviorSubject<FolderItem[]>,
    processed: boolean
  }
}
