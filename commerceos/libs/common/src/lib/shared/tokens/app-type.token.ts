import { InjectionToken } from '@angular/core';

export enum AppType {
  Affiliates = 'affiliates',
  Appointments = 'appointments',
  Blog = 'blog',
  Connect = 'connect',
  Contacts = 'contacts',
  Coupons = 'coupons',
  Invoice = 'invoice',
  Mail = 'mail',
  Message = 'message',
  MessageEmbed = 'message-embed',
  Pos = 'pos',
  Products = 'products',
  Settings = 'settings',
  Shipping = 'shipping',
  Shop = 'shop',
  Site = 'site',
  Social = 'social',
  Studio = 'studio',
  Subscriptions = 'subscriptions',
  Transactions = 'transactions',
}

export const APP_TYPE = new InjectionToken<AppType>('APP_TYPE');
