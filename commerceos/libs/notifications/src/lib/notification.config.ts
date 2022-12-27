import { NotificationIcon } from './notification-icons';

export interface NotificationConfig {
  [key: string]: { routerLink: string; iconName: NotificationIcon; }
}

export const notificationConfig: NotificationConfig = {
  'notification.builder.theme.editTheme': {
    routerLink: '/builder/shop/{id}/builder/editor',
    iconName: NotificationIcon.theme,
  },
  'notification.shops.live.goLive': {
    routerLink: '/shop/{id}/settings',
    iconName: NotificationIcon.launch,
  },
  'notification.shops.url.setUrlName': {
    routerLink: '/shop/{id}/settings',
    iconName: NotificationIcon.payment,
  },
  'notification.shops.url.selectBilling': {
    routerLink: '/shop/{id}/settings',
    iconName: NotificationIcon.payment,
  },
  'notification.shops.url.addLogo': {
    routerLink: '/shop/{id}/edit/general-details',
    iconName: NotificationIcon.logo,
  },
  'notification.shops.theme.addTheme': {
    routerLink: '/builder/shop/{id}/builder/themes/list/my?themeType=business',
    iconName: NotificationIcon.theme,
  },
  'notification.shops.url.tour': {
    routerLink: '/shop',
    iconName: NotificationIcon.theme,
  },
  'notification.products.chooseProducts': {
    routerLink: '/products/list',
    iconName: NotificationIcon.products,
  },
  'notification.pos.url.tour': {
    routerLink: '/pos',
    iconName: NotificationIcon.theme,
  },
  'notification.pos.theme.addTheme': {
    routerLink: '/pos',
    iconName: NotificationIcon.theme,
  },
  'notification.product.newProduct': {
    routerLink: '/products/products-editor?addExisting=true&prevProductsPath=list',
    iconName: NotificationIcon.products,
  },
  'notification.products.missingImage': {
    routerLink: '/products/products-editor/{id}',
    iconName: NotificationIcon.theme,
  },
  'notification.products.url.tour': {
    routerLink: '/products/list',
    iconName: NotificationIcon.theme,
  },
  'notification.checkout.url.tour': {
    routerLink: '/checkout',
    iconName: NotificationIcon.theme,
  },
  'notification.checkout.payment.addOption': {
    routerLink: '/checkout/{id}/panel-payments',
    iconName: NotificationIcon.theme,
  },
  'notification.checkout.settings.setStyles': {
    routerLink: '/checkout/{id}/settings/color-and-style',
    iconName: NotificationIcon.theme,
  },
  'notification.connect.url.tour': {
    routerLink: '/connect',
    iconName: NotificationIcon.theme,
  },
  'notification.connect.payment.installPayment': {
    routerLink: '/connect/payments',
    iconName: NotificationIcon.theme,
  },
  'notification.transactions.url.tour': {
    routerLink: '/transactions',
    iconName: NotificationIcon.theme,
  },
  'notification.transactions.title.new_transaction': {
    routerLink: '/transactions/{id}',
    iconName: NotificationIcon.theme,
  },
  'notification.legalDocuments.review': {
    routerLink: '/settings/policies',
    iconName: NotificationIcon.invoice,
  },
}
