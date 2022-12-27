import { Inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { PeInvoiceApi } from '../services/abstract.invoice.api';
import { InvoiceEnvService } from '../services/invoice-env.service';

@Injectable()
export class PebInvoiceGuard implements CanActivate {

  constructor(
    private api: PeInvoiceApi,
    @Inject(EnvService) private envService: InvoiceEnvService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.envService.applicationId = this.envService.businessId;
    if (route?.firstChild?.params.invoiceId) {
      this.envService.invoiceId = route?.firstChild?.params?.invoiceId;

      return of(true);
    }

    return this.api.getInvoiceList().pipe(
      switchMap((invoices) => {
        return of(invoices);
      }),
      map((invoices) => {
        
        if(invoices.length == 0) {
          this.envService.invoiceId = null;
          
          return true;
        }
        const defaultInvoice = invoices.find(invoice => invoice.isDefault === true);

        if (!defaultInvoice) {
          this.envService.invoiceId = invoices[0].id;
          route.data = { ...route.data, invoice: invoices[0] };

          return true;
        }
        this.envService.invoiceId = defaultInvoice.id;
        route.data = { ...route.data, invoice: defaultInvoice };

        return true;
      }),
      catchError(() => {

        return of(false);
      }),
    )
  }
}
