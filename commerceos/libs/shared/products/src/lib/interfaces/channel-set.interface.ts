import { AppInstanceEnum } from '../enums/app.enum';
import { ChannelTypes } from '../enums/product.enum';

export interface ChannelSetInterface {
  id: string | number;
  type: ChannelTypes | AppInstanceEnum;
  name?: string;
}
