import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BusinessInterface, EnvService } from '@pe/common';


@Injectable()
export class SiteEnvService extends EnvService {
    businessId: string;
    businessData: BusinessInterface;
    applicationId: string;
    businessName: string;
    businessId$: Observable<string>;
    businessData$: Observable<BusinessInterface>
}
