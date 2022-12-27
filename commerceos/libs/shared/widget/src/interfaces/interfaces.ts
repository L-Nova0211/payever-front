import { WidgetNotification } from '@pe/widgets';

export enum WidgetTypeEnum {
  Apps = 'apps',
  Tutorial = 'tutorial',
  Transactions = 'transactions',
  Shiping = 'shipping',
  Connect = 'connect',
  Products = 'products',
  Checkout = 'checkout',
  Shop = 'shop',
  Site = 'site',
  Marketing = 'marketing',
  Contacts = 'contacts',
  Settings = 'settings',
  Pos = 'pos',
  Studio = 'studio',
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


  setupStatus?: 'notStarted' | 'started' | 'completed'; // TODO enum
  helpUrl?: string;
  showOnTutorial?: boolean;

  notificationCount?: number;
  notifications?: WidgetNotification[];
  onInstallAppClick: (appName: string) => any;
}

export interface WidgetTutorialInterface {
  _id: string;
  titel: string;
  icon: string;
  url: string;
  urls: [
    {
      language: string,
      url: string
    }
  ]
  type: string;
  watched: boolean;
  order?: number;
}

