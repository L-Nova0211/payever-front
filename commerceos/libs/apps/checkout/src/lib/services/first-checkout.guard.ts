import { Injectable, Injector } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap, tap, take } from 'rxjs/operators';

import { CheckoutInterface } from '../interfaces';
import { StorageService } from '../services/storage.service';

@Injectable()
export class FirstCheckoutGuard implements CanActivate {
  constructor(private injector: Injector,
              private activatedRoute: ActivatedRoute,
              private storageService: StorageService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.storageService.getCheckouts().pipe(
      filter(d => !!d),
      take(1),
      switchMap((checkouts: CheckoutInterface[]) => {
        if (checkouts.length === 0) {
          return this.storageService.addNewCheckout({ name: 'Unknown checkout' } as CheckoutInterface);
        } else {
          return of(null);
        }
      }),
      tap((newCheckout: CheckoutInterface) => {
        if (newCheckout) {
          const businessUuid: string = this.storageService.businessUuid;
          const app: string = route.params['app'];
          const appId: string = route.params['appId'];

          if (newCheckout) {
            this.router.navigate([`business/${businessUuid}/checkout/modal/${app}/${appId}/${newCheckout._id}/view`]);
          }
        }
      }),
      map((newCheckout: CheckoutInterface) => !newCheckout)
    );
  }

}
