import { PeMessageIntegration, PeMessageUserStatus } from '../enums';

export interface PeMessageContact {
  _id?: string;
  avatar?: string;
  business?: string;
  communications: [{
    identifier: string;
    integrationName: PeMessageIntegration;
  }];
  lastSeen?: Date;
  name: string;
  status?: PeMessageUserStatus;
}
