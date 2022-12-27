import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CheckoutInterface } from '../interfaces';
import { ApiService, EnvService, StorageService } from '../services';

@Injectable()
export class CheckoutResolver implements Resolve<CheckoutInterface[]> { // TODO Not needed

  constructor(private injector: Injector,
              private apiService: ApiService,
              private envService: EnvService,
              private storageService: StorageService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<CheckoutInterface[]> {
    this.envService.businessId = window.location.pathname.split('/')[2];

    return this.storageService.getCheckoutsOnce().pipe(map((checkouts: CheckoutInterface[]) => {
      return checkouts;
    }));
  }

}
