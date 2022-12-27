import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';

import { BusinessInterface } from '../business.interface';
import { BusinessApiService } from '../services/business-api.service';

import * as BusinessActions from './business.actions';

const businessStateName = 'peBusinessState';

export interface PeBusinessState {
  loading: boolean;
  businessData: BusinessInterface;
  businesses: { businesses:BusinessInterface[],total:number};
  defaultBusiness:BusinessInterface;
}

export const initialBusinessData: BusinessInterface = {
  active: null,
  bankAccount: null,
  companyAddress: null,
  companyDetails: null,
  contactDetails: null,
  contactEmails: [],
  createdAt: null,
  cspAllowedHosts: [],
  currency: null,
  currentWallpaper: null,
  defaultLanguage: null,
  documents: null,
  hidden: null,
  logo: null,
  name: null,
  owner: null,
  taxes: null,
  themeSettings: null,
  updatedAt: null,
  _id: null,
};

@State<PeBusinessState>({
  name: businessStateName,
  defaults: {
    loading: false,
    businessData: initialBusinessData,
    businesses: { businesses:[],total:0 },
    defaultBusiness: initialBusinessData,

  },
})
@Injectable()
export class BusinessState {
  @Selector()
  static loading(state: PeBusinessState): boolean {
    return state.loading;
  }

  @Selector()
  static businessData(state: PeBusinessState): BusinessInterface {
    return state.businessData;
  }

  @Selector()
  static defaultBusiness(state: PeBusinessState): BusinessInterface {
    return state.defaultBusiness;
  }


  @Selector()
  static businessUuid(state: PeBusinessState): string {
    return state.businessData?._id ?? '';
  }

  @Selector()
  static businesses(state: PeBusinessState): { businesses:BusinessInterface[],total:number} {
    return state.businesses;
  }

  constructor(private apiService: BusinessApiService) {}

  @Action(BusinessActions.LoadBusinessData)
  loadBusinessData(ctx: StateContext<PeBusinessState>, { uuid }: BusinessActions.LoadBusinessData) {
    ctx.patchState({
      loading: true,
    });

    return this.apiService.getBusinessData(uuid).pipe(
      tap((data: BusinessInterface) => ctx.dispatch(new BusinessActions.BusinessDataLoaded(data))),
      catchError((err: HttpErrorResponse) => ctx.dispatch(new BusinessActions.LoadFailed(err))),
    );
  }

  @Action(BusinessActions.BusinessDataLoaded)
  businessDataLoaded(ctx: StateContext<PeBusinessState>, { payload }: BusinessActions.BusinessDataLoaded) {
    ctx.patchState({
      loading: false,
      businessData: payload,
    });
  }

  @Action(BusinessActions.LoadBusinesses)
  loadBusinesses(ctx: StateContext<PeBusinessState>, { active, page,limit,reload }:BusinessActions.LoadBusinesses) {
    ctx.patchState({
      loading: true,
    });

    return this.apiService.getBusinessesList('true', page, limit,).pipe(
      tap((data:{ businesses:BusinessInterface[],total:number}) => ctx.dispatch(new BusinessActions.BusinessesLoaded(data,reload))),
      catchError((err: HttpErrorResponse) => ctx.dispatch(new BusinessActions.LoadFailed(err))),
    );
  }

  @Action(BusinessActions.BusinessesLoaded)
  businessesLoaded(ctx: StateContext<PeBusinessState>, { payload, reload }: BusinessActions.BusinessesLoaded) {
    const curentState =ctx.getState()
    if (reload){
      ctx.patchState(
        {
          loading: false,
          businesses:payload,
        }
      )

      return
    }
    ctx.patchState({
      loading: false,
      businesses: {
        businesses:[...curentState.businesses.businesses,...payload.businesses],
        total:payload.total,
      },
    });
  }

  @Action(BusinessActions.DefaultBusinessesLoaded)
  defaultBusinessesLoaded(ctx: StateContext<PeBusinessState>, { payload }: BusinessActions.DefaultBusinessesLoaded) {
      ctx.patchState(
        {
          loading: false,
          defaultBusiness:payload,
        }
      )
  }

  @Action(BusinessActions.LoadFailed)
  loadFailed(ctx: StateContext<PeBusinessState>) {
    ctx.patchState({
      loading: false,
    });
  }

  @Action(BusinessActions.ResetBusinessState)
  resetBusinessState(ctx: StateContext<PeBusinessState>) {
    ctx.patchState({
      loading: false,
      businessData: initialBusinessData,
      businesses: { businesses:[],total:0 },
    });
  }

}
