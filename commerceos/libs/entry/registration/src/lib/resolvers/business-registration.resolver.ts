import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { ApiService } from '@pe/api';


@Injectable({ providedIn: 'root' })
export class BusinessRegistrationResolver implements Resolve<any> {

  constructor(private apiService: ApiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.apiService.getBusinessRegistrationData();
  }
}