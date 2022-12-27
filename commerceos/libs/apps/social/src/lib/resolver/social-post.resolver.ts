import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { PeSocialApiService } from '../services'

@Injectable()
export class PeSocialPostResolver implements Resolve<any> {
  constructor(
    private router: Router,
    private envService: EnvService,
    private peSocialApiService: PeSocialApiService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const postId: string = route.params.postId;
      return !postId
        ? of(null)
        : this.peSocialApiService.getSocialPost(postId)
          .pipe(
            tap(post => {
              !post && this.navigateToList();
            }),
            catchError((error: HttpErrorResponse) => {
              console.error('RESOLVE SOCIAL / ERROR', error);
              this.navigateToList();

              return [null];
            }));
  }

  private navigateToList(): void {
    const url: string[] = ['business', this.envService.businessId, 'social'];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  }
}
