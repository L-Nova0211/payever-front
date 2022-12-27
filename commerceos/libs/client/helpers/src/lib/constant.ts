import pick from 'lodash/pick';

import { PebPageVariant, PebShopData, PebShopRoute } from '@pe/builder-core';
import { AppType } from '@pe/common';

export const AppsEventThemePublished = {
  [AppType.Affiliates]: 'affiliate.events.theme.published.all.pages',
  [AppType.Blog]: 'blog.event.theme.published.all.pages',
  [AppType.Invoice]: 'invoice.event.theme.published.all.pages',
  [AppType.Mail]: 'mail.event.theme.published.all.pages',
  [AppType.Shop]: 'shops.event.theme.published.all.pages',
  [AppType.Site]: 'sites.event.theme.published.all.pages',
  [AppType.Subscriptions]: 'subscriptions.event.theme.published.all.pages',
};

export const ClientAppsEventThemePublished = {
  [AppType.Affiliates]: 'client-affiliate.event.theme.published',
  [AppType.Blog]: 'client-blog.event.theme.published',
  [AppType.Invoice]: 'client-invoice.event.theme.published',
  [AppType.Mail]: 'client-mail.event.theme.published',
  [AppType.Shop]: 'client-shops.event.theme.published',
  [AppType.Site]: 'client-sites.event.theme.published',
  [AppType.Subscriptions]: 'client-subscriptions.event.theme.published',
};

export const AZURE_BLOB_NAME = 'cdn';

export enum AzureAppFolderEnum {
  Affiliates = 'affiliates',
  Blog = 'blog',
  Default = 'app',
  Email = 'emails',
  Invoice = 'invoice',
  Pos = 'pos',
  Shop = 'shops',
  Site = 'sites',
  Subscriptions = 'subscriptions',
}

export interface ShortPageData {
  createdAt: string;
  id: string;
  name: string;
  updatedAt: string;
  variant: PebPageVariant;
}

export interface ShortAppData {
  app: any;
  data: PebShopData;
  pages: ShortPageData[];
  routing: PebShopRoute[];
  theme: any;
  version: string;
}

export function getShortAppData(app, theme): ShortAppData {
  return {
    app,
    data: theme.data ?? {},
    pages: theme.pages?.map(page => pick(page, ['id', 'variant', 'name', 'updatedAt', 'createdAt'])) ?? [],
    routing: theme.routing ?? [],
    theme,
    version: app.accessConfig?.version,
  };
}

export function getPageUrl(url: string, variant: PebPageVariant, appData: ShortAppData): string {
  let result = url;
  if (variant === PebPageVariant.Category && appData.data?.categoryPages) {
    result = appData.data.categoryPages.replace('/:categoryId', '');
  }
  if (variant === PebPageVariant.Product && appData.data?.productPages) {
    result = appData.data.productPages.replace('/:productId', '');
  }

  return result;
}

export function getHost(appType: AppType | string, env): string {
  switch (appType) {
    case AppType.Affiliates:
      return env.primary.affiliatesHost;
    case AppType.Blog:
      return env.primary.blogHost;
    case AppType.Invoice:
      return env.primary.invoiceHost;
    case AppType.Mail:
      return env.primary.emailHost;
    case AppType.Pos:
      return env.primary.posHost;
    case AppType.Shop:
      return env.primary.shopHost;
    case AppType.Site:
      return env.primary.siteHost;
    case AppType.Subscriptions:
      return env.primary.subscriptionHost;
    default:
      return env.primary.mainHost;
  }
}

export function getBuilderApiPath(appType: AppType | string, env): string {
  switch (appType) {
    case AppType.Affiliates:
      return env.backend.builderAffiliate;
    case AppType.Appointments:
      return env.backend.builderAppointments;
    case AppType.Blog:
      return env.backend.builderBlog;
    case AppType.Invoice:
      return env.backend.builderInvoice;
    case AppType.Mail:
      return env.backend.builderMail;
    case AppType.Shop:
      return env.backend.builderShop;
    case AppType.Site:
      return env.backend.builderSite;
    case AppType.Subscriptions:
      return env.backend.builderSubscription;
  }
}
