import { AppInstanceEnum } from './app.enum';
import { ChannelTypes } from './product.enum';

export interface ChannelSetInterface {
  id: string | number;
  type: ChannelTypes | AppInstanceEnum;
  name?: string;
}
