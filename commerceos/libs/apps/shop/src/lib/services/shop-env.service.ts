import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BusinessInterface, EnvService } from '@pe/common';


@Injectable()
export class ShopEnvService extends EnvService {
    businessId: string;
    businessData: BusinessInterface;
    shopId: string;
    businessName: string;
    businessData$: Observable<BusinessInterface>;
    businessId$: Observable<string>
}
