import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BusinessInterface, EnvService } from '@pe/common';

@Injectable()
export class PeAppointmentsEnvService extends EnvService {
  public applicationId: string;
  public appointmentId: string;
  public businessData: BusinessInterface;
  public businessData$: Observable<any>;
  public businessId: string;
  public businessId$: Observable<string>;
  public businessName: string;
  public shopId: string;
}
