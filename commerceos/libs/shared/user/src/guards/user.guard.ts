import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { ActionCompletion, Actions, ofActionCompleted, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { RegistrationService } from '@pe/shared/registration';
import { LoadUser, UserLoaded, UserState, PeUser } from '@pe/user';


@Injectable({ providedIn: 'any' })
export class UserGuard  implements CanActivate {
  @SelectSnapshot(UserState.loading) loading: boolean;
  @SelectSnapshot(UserState.user) user: PeUser;

  constructor(
    private store: Store,
    private router:Router,
    private actions$: Actions,
    private registrationService: RegistrationService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean|UrlTree> | Promise<boolean> | boolean|UrlTree {
    if (this.user?._id) {
      if(this.user.hasUnfinishedBusinessRegistration){
        this.router.navigate(['./registration/business']);
        this.registrationService.registrationStep$.next(2);
      }

      return true
    }

    this.store.dispatch(new LoadUser());

    return this.actions$.pipe(
      ofActionCompleted(UserLoaded),
      take(1),
      map((action: ActionCompletion<UserLoaded, Error>) => {
        if(action.action.payload.hasUnfinishedBusinessRegistration){
          this.router.navigate(['./registration/business']);
          this.registrationService.registrationStep$.next(2);
        }

        return true
      }),
    );
  }
}
