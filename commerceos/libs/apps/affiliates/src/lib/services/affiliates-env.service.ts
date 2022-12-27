import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BusinessInterface, EnvService } from '@pe/common';


Injectable()
export class PeAffiliatesEnvService extends EnvService {

  public affiliateId: string;
  public applicationId: string;
  public businessData: BusinessInterface;
  public businessId: string;
  public businessName: string;
  public businessData$: Observable<BusinessInterface>;
  public businessId$: Observable<string>;
  public shopId: string;
}
