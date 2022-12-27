import { IconType } from '@angular/material/icon/testing';

export enum NotificationIcon {
  ellipsis = 'ellipsis',
  invoice = 'invoice',
  launch = 'launch',
  theme = 'theme',
  products = 'products',
  payment = 'payment',
  logo = 'logo'
}

export type NotificationIconSet = { [key in NotificationIcon]: { path: string; type: IconType } };

export const notificationIconSet: NotificationIconSet = {
  [NotificationIcon.ellipsis]: { path: 'ellipsis.svg', type: IconType.SVG },
  [NotificationIcon.invoice]: { path: 'invoice.svg', type: IconType.SVG },
  [NotificationIcon.launch]: { path: 'launch.svg', type: IconType.SVG },
  [NotificationIcon.theme]: { path: 'theme.svg', type: IconType.SVG },
  [NotificationIcon.products]: { path: 'products.svg', type: IconType.SVG },
  [NotificationIcon.payment]: { path: 'payment.svg', type: IconType.SVG },
  [NotificationIcon.logo]: { path: 'logo.svg', type: IconType.SVG },
}
