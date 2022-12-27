import { SafeStyle } from '@angular/platform-browser';

export interface PopularProductByChannelSetInterface {
  _id: string;
  channelSet: string;
  name: string;
  thumbnail: SafeStyle;
  quantity: number;
  lastSell: Date;
}
export interface PopularProductInterface {
  _id: string;
  id?: string;
  uuid: string;
  business: string;
  name: string;
  thumbnail: string;
  thumbnailSanitized: SafeStyle;
  quantity: number;
  lastSell: Date;
}
