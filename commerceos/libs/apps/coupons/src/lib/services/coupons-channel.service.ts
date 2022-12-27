import { Injectable } from '@angular/core';

import { PeListSectionIntegrationInterface } from '@pe/ui';

import { ChannelTypes } from '../enums';
import { PeChannelGroup } from '../interfaces';

@Injectable()
export class PeCouponsChannelService {
  public getChannel(channel): PeListSectionIntegrationInterface {
    const channelGroup = PE_CHANNELS_GROUPS.find(group => group.type === channel.type);

    return {
      _id: channel._id,
      enabled: channel.enabled,
      icon: channelGroup ? channelGroup.icon : channel.type,
      title: channelGroup ? channelGroup.name : channel.type,
    };
  }
}

const PE_CHANNELS_GROUPS: PeChannelGroup[] = [
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
    type: ChannelTypes.Internal,
    name: 'Internal',
    icon: '#icon-apps-marketing',
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
];
