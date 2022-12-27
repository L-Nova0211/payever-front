import { ChannelTypes } from './product.enum';

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
];
