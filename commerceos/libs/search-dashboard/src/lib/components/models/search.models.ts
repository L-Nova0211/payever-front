import { SearchGroupItems, SpotlightSearch } from '@pe/common';

enum AppSubTypeEnum { 
  ShippingZones = 'shipping-zones',
  ShippingProfiles = 'shipping-profiles',
}

export type PeSpotlightMapper = (item: any) => SearchGroupItems;

export function
  mapSpotlightSearch(
    appName: string,
    data: SearchGroupItems[],
    businessId?: string,
  ): SpotlightSearch {

  const searchItem = {
    heading: appName,
    items: data.map(item => mapperFunc(appName, item, businessId)),
  };

  return searchItem;
}

function mapperFunc(appName: string, groupItem: SearchGroupItems, businessId?: string): SearchGroupItems {
  switch (appName) {
    case 'contact':
      return {
        ...groupItem,
        icon: '#icon-commerceos-contacts',
        url: [`business`,`${businessId || groupItem.businessId}`, `contacts`, groupItem.serviceEntityId, 'details'],
      }
    case 'product':
      return {
        ...groupItem,
        icon: '#icon-commerceos-products',
        url: [
        `business`,
        `${groupItem.businessId}`,
        `products`,
        `list`,          
        { outlets: { editor: ['products-editor','edit', groupItem.serviceEntityId] } }],
      }
    case 'checkout':
      return {
        ...groupItem,
        icon: '#icon-commerceos-checkout',
        url: [`business`,`${groupItem.businessId}`, `checkout`, `${groupItem._id}`, `panel-checkout`],
      }
    case 'transactions':
      return {
        ...groupItem,
        icon: groupItem.icon || '#icon-commerceos-transactions',
        url: [
          `business`,
          `${groupItem.businessId}`,
          `transactions`,
          `list`, 
          { outlets: { details: ['details', groupItem.serviceEntityId] } },
        ],
      }
    case 'users':
      return {
        ...groupItem,
        icon: '#icon-commerceos-contacts',
        url: [''],
      }
    case 'coupon':
      return {
        ...groupItem,
        icon: '#icon-commerceos-coupons',
        url: [`business`,`${groupItem.businessId}`, `coupons`, `${groupItem.serviceEntityId}`, 'details'],
      }
    case 'blog':
      return {
        ...groupItem,
        icon: '#icon-commerceos-blog',
        url: [`business`,`${groupItem.businessId}`, `blog`, `${groupItem._id}`, `dashboard`],
      }
    case 'appointment':
      return {
        ...groupItem,
        icon: '#icon-commerceos-appointments',
        url: [`business`,`${groupItem.businessId}`, `appointments`, `dashboard`],
      }
    case 'invoice':
      return {
        ...groupItem,
        icon: '#icon-commerceos-invoice',
        url: [`business`,`${groupItem.businessId}`, `invoice`, groupItem.serviceEntityId, 'details'],
      }
    case 'message':
      return {
        ...groupItem,
        icon: '#icon-commerceos-message',
        url: [`business`,`${groupItem.businessId}`, `message`,groupItem.serviceEntityId],
      }
    case 'pos':
      return {
        ...groupItem,
        icon: '#icon-commerceos-pos',
        url: [`business`,`${groupItem.businessId}`, `pos`, `${groupItem._id}`, `dashboard`],
      }
    case 'shop':
      return {
        ...groupItem,
        icon: '#icon-commerceos-shop',
        url: [`business`,`${groupItem.businessId}`, `shop`, `${groupItem._id}`, `dashboard`],
      }
    case 'site':
      return {
        ...groupItem,
        icon: '#icon-commerceos-site',
        url: [`business`,`${groupItem.businessId}`, `site`, `${groupItem._id}`, `dashboard`],
      }
    case 'subscriptions':
      return {
        ...groupItem,
        icon: '#icon-commerceos-subscriptions',
        url: [
          `business`,`${groupItem.businessId}`,
          `subscriptions`, `${groupItem._id}` ,
          `details` ,
          `${groupItem.serviceEntityId}`,
        ],
      }
    case 'social':
      return {
        ...groupItem,
        icon: '#icon-commerceos-social',
        url: [`business`,`${groupItem.businessId}`, `social`, `${groupItem.serviceEntityId}`, 'details'],
      }
    case 'affiliate':
      return {
        ...groupItem,
        icon: '#icon-commerceos-affiliate',
        url: [
          `business`,`${groupItem.businessId}`,
          `affiliates`, `default`,
          `programs`, `${groupItem._id}`,
        ],
      }
    case 'connect':
      return {
        ...groupItem,
        icon: '#icon-commerceos-connect',
        url: [`business`,`${groupItem.businessId}`, `connect`],
      }
    case 'shipping':
      const redirectTo: string = groupItem.subType === AppSubTypeEnum.ShippingZones ?
     `zones` :  `profiles`;

      return {
        ...groupItem,
        icon: '#icon-commerceos-shipping',
        url: [`business`,`${groupItem.businessId}`, `shipping`, redirectTo, `${groupItem.serviceEntityId}`, 'details'],
      }

    default:
      return groupItem;
  }
}