import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { ContactsGQLService } from '../services'

@Injectable()
export class ContactsResolver implements Resolve<any> {
  constructor(
    private api: ContactsGQLService,
    private router: Router,
    private envService: EnvService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const contactId: string = route.params.contactId;
    if (contactId) {
      return this.api.getContactById(contactId).pipe(
        tap((contact) => {
          if (!contact) {
            this.navigateToList();
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('RESOLVE CONTACTS / ERROR', error);
          this.navigateToList();

          return [null];
        }),
      );
    } else {
      return of(null);
    }
  }

  private navigateToList(): void {
    const url: string[] = ['business', this.envService.businessId, 'contacts'];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  }
}