import { BusinessInterface } from './models/business';

export abstract class PebEnvService {

  abstract businessId: string;

  abstract businessData: BusinessInterface;

  abstract channelId: string;

  abstract shopId: string;

  abstract terminalId: string;

  abstract applicationId: string;

}
