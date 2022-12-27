import { Injectable } from '@angular/core';

import { BusinessInterface, PebEnvService } from '@pe/builder-core';

@Injectable()
export class PeAccessEnvService extends PebEnvService {
  applicationId: string;
  businessData: BusinessInterface;
  businessId: string;
  channelId: string;
  shopId: string;
  terminalId: string;
}
