import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BusinessApiService } from '@pe/business';
import { PeUser, UserState } from '@pe/user';

@Injectable()
export class DefaultBusinessGuard implements CanActivate {

  @SelectSnapshot(UserState.user) user: PeUser;

  constructor(private api: BusinessApiService) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    if (!this.user.hasUnfinishedBusinessRegistration) {
      const storageBusiness = localStorage.getItem('pe_active_business');
      const business = storageBusiness ? JSON.parse(storageBusiness) : null;
      if (business?._id) {return true}

      return this.api.getactiveBusiness().pipe(
        map(data => {
          if (data.businesses?.length > 0) {
            localStorage.setItem('pe_active_business', JSON.stringify(data.businesses[0]));
          }

          return true
        })
      )
    }
  }
}
