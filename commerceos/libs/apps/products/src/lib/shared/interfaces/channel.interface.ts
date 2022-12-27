import { ChannelTypes } from '../enums/product.enum';

export interface ChannelInterface {
  id: string;
  name: string;
  type: ChannelTypes;
  active: boolean;
  business: string;
  enabledByDefault: boolean;
  customPolicy: boolean;
  policyEnabled: boolean;
  originalId: string;
}
