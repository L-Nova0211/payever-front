import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { PeAffiliatesApiService } from '../services';


@Injectable()
export class PeAffiliatesProgramResolver implements Resolve<any> {
  constructor(
    private router: Router,
    
    private envService: EnvService,
    private peAffiliatesApiService: PeAffiliatesApiService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const programId: string = route.params.programId;

    return programId
      ? this.peAffiliatesApiService
          .getProgram(programId)
          .pipe(
            tap(program => {
              !program && this.navigateToList();
            }),
            catchError((error: HttpErrorResponse) => {
              console.error('RESOLVE PROGRAM / ERROR', error);
              this.navigateToList();

              return [null];
            }))
        : of(null);
  }

  private navigateToList(): void {
    const url: string[] = ['business', this.envService.businessId, 'affiliates'];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  }
}