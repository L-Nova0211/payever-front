export interface CampaignInterface {
  _id: string;
  name: string;
  contactsCount: number;
  channelSet: CampaignChannelSetInterface;
}

export interface CampaignChannelSetInterface {
  _id: string;
  sells: number;
  revenue: number;
  business: string;
  type: string;
}
