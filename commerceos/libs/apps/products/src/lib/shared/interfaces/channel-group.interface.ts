import { ChannelTypes } from '../enums/product.enum';

export interface PeChannelGroup {
  type: ChannelTypes;
  name: string;
  icon: string;
}

export const PE_CHANNELS_GROUPS: PeChannelGroup[] = [
  {
    type: ChannelTypes.Pos,
    name: 'Point of Sale',
    icon: '#icon-apps-pos',
  },
  {
    type: ChannelTypes.Shop,
    name: 'Shop',
    icon: '#icon-apps-store',
  },
  {
    type: ChannelTypes.Facebook,
    name: 'Facebook',
    icon: '#icon-apps-facebook',
  },
  {
    type: ChannelTypes.Instagram,
    name: 'Instagram',
    icon: '#icon-apps-instagram',
  },
  {
    type: ChannelTypes.Market,
    name: 'Other channels',
    icon: '#icon-apps-market',
  },
  {
    type: ChannelTypes.Mobilede,
    name: 'Mobile de',
    icon: '#icon-apps-mobilede',
  },
  {
    type: ChannelTypes.Ebay,
    name: 'Ebay',
    icon: '#icon-apps-ebay',
  },
  {
    type: ChannelTypes.Autoscout24,
    name: 'Autoscout24',
    icon: '#icon-apps-autoscout24',
  },
  {
    type: ChannelTypes.Amazon,
    name: 'Amazon',
    icon: '#icon-apps-amazon',
  },
  {
    type: ChannelTypes.Marketing,
    name: 'Marketing',
    icon: '#icon-apps-marketing',
  },
  {
    type: ChannelTypes.Link,
    name: 'Link',
    icon: '#icon-apps-marketing',
  },
  {
    type: ChannelTypes.FinanceExpress,
    name: 'Finance Express',
    icon: '#icon-apps-marketing',
  },
  {
    type: ChannelTypes.Dropshipping,
    name: 'payever Dropshipping',
    icon: '#icon-apps-marketing',
  },
  {
    type: ChannelTypes.ShopifyProduct,
    name: 'Shopify',
    icon: '#icon-apps-shopify',
  },
  {
    type: ChannelTypes.GoogleShopping,
    name: 'Google Shopping',
    icon: '#icon-apps-google',
  },
  {
    type: ChannelTypes.Woocommerce,
    name: 'Woocommerce',
    icon: '#icon-apps-woocommerce',
  },
  {
    type: ChannelTypes.Plentymarkets,
    name: 'Plentymarkets',
    icon: '#icon-apps-plentymarkets',
  },
  {
    type: ChannelTypes.DanDomain,
    name: 'DanDomain',
    icon: '#icon-apps-dandomain',
  },
  {
    type: ChannelTypes.xtCommerce,
    name: 'xt:Commerce',
    icon: '#icon-apps-xt_commerce',
  },
  {
    type: ChannelTypes.OXID,
    name: 'OXID',
    icon: '#icon-apps-oxid',
  },
  {
    type: ChannelTypes.JTL,
    name: 'JTL',
    icon: '#icon-apps-jtl',
  },
  {
    type: ChannelTypes.Shopware,
    name: 'Shopware',
    icon: '#icon-apps-shopware',
  },
  {
    type: ChannelTypes.PrestaShop,
    name: 'PrestaShop',
    icon: '#icon-apps-presta',
  },
  {
    type: ChannelTypes.Magento,
    name: 'Magento',
    icon: '#icon-apps-magento',
  },
  {
    type: ChannelTypes.Commercetools,
    name: 'Commercetools',
    icon: '#icon-apps-commercetools',
  },
  {
    type: ChannelTypes.Opencart,
    name: 'Opencart',
    icon: '#icon-apps-opencart',
  },
  {
    type: ChannelTypes.Kaufland,
    name: 'Kaufland',
    icon: '#icon-apps-kaufland',
  },  
];
