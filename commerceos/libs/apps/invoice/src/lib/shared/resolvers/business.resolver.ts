import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { InvoiceEnvService } from '../../services/invoice-env.service';


@Injectable()
export class BusinessResolver implements Resolve<any> {
  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private envService: InvoiceEnvService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | any {
    const uuid = state.url.split('business/')[1]?.split('/')[0];
    this.envService.businessUuid = uuid;

    return;
  }
}
