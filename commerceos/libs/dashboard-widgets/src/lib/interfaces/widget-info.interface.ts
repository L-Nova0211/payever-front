import { WidgetNotification } from '@pe/widgets';

export enum WidgetTypeEnum {
  Affiliates = 'affiliates',
  Apps = 'apps',
  Appointments = 'appointments',
  Tutorial = 'tutorial',
  Transactions = 'transactions',
  Shipping = 'shipping',
  Connect = 'connect',
  Coupons = 'coupons',
  Products = 'products',
  Checkout = 'checkout',
  Shop = 'shop',
  Social = 'social',
  Blog = 'blog',
  Invoice = 'invoice',
  Subscriptions = 'subscriptions',
  Marketing = 'marketing',
  Contacts = 'contacts',
  Settings = 'settings',
  Pos = 'pos',
  Studio = 'studio',
  Site = 'site',
  Ads = 'ads',
  Message = 'message',
}

export interface WidgetInfoInterface {
  installedApp: boolean;
  defaultApp: boolean;

  _id: string;
  icon: string;
  title: string;
  type: WidgetTypeEnum;
  installed: boolean;
  installByDefault: boolean,
  default?: boolean;
  order?: number;
  disabled?: boolean;


  setupStatus?: 'notStarted' | 'started' | 'completed'; // TODO enum
  helpUrl?: string;
  showOnTutorial?: boolean;

  notificationCount?: number;
  notifications?: WidgetNotification[];
  onInstallAppClick: (appName: string) => any;
}
