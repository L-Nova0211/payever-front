import { SafeStyle } from '@angular/platform-browser';
import { Observable } from 'rxjs';

import { WidgetType } from './enums';

export interface Widget {
  _id: string;
  type: WidgetType;
  appName: string;
  title: string;
  subTitle?: string;
  icon?: string;
  iconUrl?: string;
  installIconUrl?: string;
  data: WidgetData[];
  noDataTitle?: string;
  installedApp: boolean;
  defaultApp: boolean;
  installed: boolean;
  helpUrl?: string;

  showInstallAppButton: boolean;
  setupStatus?: 'notStarted' | 'started' | 'completed';
  default?: boolean;
  order?: number;
  showOnTutorial?: boolean;

  openButtonLabel?: string;
  openButtonFn?: (data?: any) => Observable<any>;
  onInstallAppClick: (appName: string) => Observable<any>;

  notificationCount?: number;
  notifications?: WidgetNotification[];
  notificationsIcon?: string;
}

export interface WidgetNotification {
  message: string;
  openFn: () => Observable<any>;
  loading?: boolean;
  notProcessLoading?: boolean;
  deleteFn?: () => Observable<any>;
}

export interface WidgetData {
  code?: string;
  title: string;
  titleColor?: 'red' | 'green';
  subtitle?: string;
  imgSrc?: string | SafeStyle;
  link?: string;
  icon?: string;
  iconSize?: number;
  subIcon?: string;
  isButton?: boolean;
  loading?: boolean;
  notProcessLoading?: boolean;
  buttonText?: string;
  buttonIcon?: string;
  onSelect?: (data?: any) => Observable<any>;
  onSelectData?: any;
}
