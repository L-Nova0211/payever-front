import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { BusinessState } from '@pe/business';

import { PeUser } from '../../user.interface';

import { LoadUser, UserLoaded, LoadFailed, ResetUser } from './user.actions';

export enum UserModes {
  Business = 'business',
  Personal = 'personal',
}

const userStateName = 'peUserState';

export interface PeUserState {
  loading: boolean;
  user: PeUser;
}

const initialUser: PeUser = {
  birthday: null,
  createdAt: null,
  email: null,
  firstName: null,
  hasUnfinishedBusinessRegistration: null,
  language: null,
  lastName: null,
  logo: null,
  phone: null,
  salutation: null,
  shippingAddresses: [],
  updatedAt: null,
  _id: null,
};

@State<PeUserState>({
  name: userStateName,
  defaults: {
    loading: false,
    user: initialUser,
  },
  children: [BusinessState],
})
@Injectable()
export class UserState {
  static userData(userMode = UserModes.Personal) {
    return createSelector([UserState, BusinessState], (userState, businessState) => {
      return userMode !== UserModes.Business ? userState.user : businessState.businessData;
    });
  }

  @Selector()
  static user(state: PeUserState): PeUser {
    return state.user;
  }

  @Selector()
  static loading(state: PeUserState): boolean {
    return state.loading;
  }

  constructor(private apiService: ApiService) {}

  @Action(LoadUser)
  loadUser(ctx: StateContext<PeUserState>) {
    ctx.patchState({
      loading: true,
    });

    return this.apiService.getUserAccount().pipe(
      tap((user: PeUser) => ctx.dispatch(new UserLoaded(user))),
      catchError((err: HttpErrorResponse) => ctx.dispatch(new LoadFailed(err))),
    );
  }

  @Action(UserLoaded)
  userLoaded(ctx: StateContext<PeUserState>, { payload }: UserLoaded) {
    ctx.patchState({
      loading: false,
      user: payload,
    });
  }

  @Action(LoadFailed)
  loadFailed(ctx: StateContext<PeUserState>) {
    ctx.patchState({
      loading: false,
    });
  }

  @Action(ResetUser)
  resetUser(ctx: StateContext<PeUserState>) {
    ctx.patchState({
      loading: false,
      user: initialUser,
    });
  }
}
