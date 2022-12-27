import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BusinessInterface, EnvService } from '@pe/common';


@Injectable()
export class PosEnvService extends EnvService {
  businessId$: Observable<string>;
  businessData$: Observable<string>;
  businessId: string;
  businessData: BusinessInterface;
  posId: string;
  businessName: string;
}
