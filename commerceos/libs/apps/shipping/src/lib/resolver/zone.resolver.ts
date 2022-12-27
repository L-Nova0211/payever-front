import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { PebShippingZoneService } from '../services/shipping-zone.service';


@Injectable()
export class ZoneResolver implements Resolve<any> {
  constructor(
    private api: PebShippingZoneService,
    private router: Router,
    private envService: EnvService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const zoneId: string = route.params.zoneId;
    if (zoneId) {
      return this.api.getShippingZoneById(zoneId).pipe(
        tap((zone) => {
          if (!zone) {
            this.navigateToList();
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('RESOLVE ZONE / ERROR', error);
          this.navigateToList();

          return [null];
        }),
      );
    } else {
      return of(null);
    }
  }

  private navigateToList(): void {
    const url: string[] = ['business', this.envService.businessId, 'zone'];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  }
}