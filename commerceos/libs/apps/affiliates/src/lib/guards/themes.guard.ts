import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, delay, filter, map, repeatWhen, take } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebEnvService } from '@pe/builder-core';

import { BAD_REQUEST } from '../constants';
import { PeAffiliatesRequestsErrorsEnum } from '../enums';
import { PeErrorsHandlerService } from '../services';

@Injectable({ providedIn: 'any' })
export class PeAffiliatesThemesGuard implements CanActivate {
  constructor(
    private pebEditorApi: PebEditorApi,
    private pebEnvService: PebEnvService,

    private peErrorsHandlerService: PeErrorsHandlerService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const applicationId = this.pebEnvService.applicationId || route.parent.params.applicationId;
    
    if (!applicationId || applicationId === BAD_REQUEST) {
      throw new Error('There is no network ID in the url path');
    }

    return this.pebEditorApi
      .getShopActiveTheme()
      .pipe(
        delay(2000),
        repeatWhen(getActiveTheme => getActiveTheme),
        filter(activeTheme => !!activeTheme),
        take(1),
        map(() => true),
        catchError(error => {
          const description = applicationId === BAD_REQUEST
            ? PeAffiliatesRequestsErrorsEnum.NoApplicationId
            : PeAffiliatesRequestsErrorsEnum.GetShopActiveTheme;
          this.peErrorsHandlerService.errorHandler(description, error, true);

          return of(true);
        }));
  }
}
