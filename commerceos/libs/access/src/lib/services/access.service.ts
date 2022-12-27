import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';

import { AclOptionEnum, EmployeeStatusEnum, PeAccessApiService } from './api.service';

@Injectable()
export class PeAccessService {
  constructor(
    private authService: PeAuthService,
    private accessApi: PeAccessApiService,
    private router: Router,
  ) {
  }

  navigateToApp(appType: string, businessId: string, applicationId: string): Promise<boolean> {
    return this.router.navigate([
      '/business',
      businessId,
      appType,
      applicationId,
      'edit',
    ]);
  }

  createEmployeeAndNavigate(userId: string, appType: string, businessId: string, applicationId: string): Observable<any> {
    return this.accessApi.getBusinessEmployeeByUser(businessId, userId).pipe(
      catchError((err) => {
        if (err.error?.statusCode === 404) {
          return of(null);
        }

        return throwError(err);
      }),
      switchMap((employee) => employee ?
        this.accessApi.getBusinessEmployeeAclsAndPositions(businessId, employee._id).pipe(
          switchMap(({ acls = [], positions = [] }) => {
            const position = positions.find(pos => pos.businessId === businessId);

            return this.accessApi.createBusinessEmployee(businessId, {
              ...employee,
              position: position?.positionType || 'Others',
              status: EmployeeStatusEnum.active,
              acls: acls.map((acl) => {
                if (acl.microservice === appType) {
                  return {
                    ...acl,
                    ...Object.values(AclOptionEnum).reduce((acc, option) => {
                      acc[option] = true;

                      return acc;
                    }, {}),
                  };
                }

                return acl;
              }),
            });
          }),
        ) :
        this.createEmployeeFromUser(appType, businessId)),
      switchMap(() => this.navigateToApp(appType, businessId, applicationId)),
      tap({
        error: () => this.authService.clearSession(),
      }),
    );
  }

  createEmployeeFromUser(appType: string, businessId: string): Observable<any> {
    const user = this.authService.getUserData();

    return user ? this.accessApi.createBusinessEmployee(businessId, {
      userId: user.uuid,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: EmployeeStatusEnum.active,
      position: 'Others',
      groups: null,
      acls: [
        { microservice: appType, create: true, read: true, update: true, delete: true },
      ] as any,
      logo: null,
      phoneNumber: null,
      companyName: null,
      address: { city: null, country: null, street: null, zipCode: null },
    }) : throwError(new Error('no user data'));
  }
}
