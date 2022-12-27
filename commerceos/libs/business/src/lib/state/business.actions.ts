import { HttpErrorResponse } from '@angular/common/http';

import { BusinessInterface } from '../business.interface';

export enum BusinessActions {
  LoadBusinessData = '[@pe/business] LoadBusinessData',
  BusinessDataLoaded = '[@pe/business] BusinessDataLoaded',

  LoadBusinesses = '[@pe/business] LoadBusinesses',
  BusinessesLoaded = '[@pe/business] BusinessesLoaded',

  LoadFailed = '[@pe/business] LoadFailed',

  ResetBusinessState = '[@pe/business] ResetBusinessState',
  DefaultBusinessesLoaded ='[@pe/business] DefaultBusinessesLoaded',
}

export class LoadBusinessData {
  static type = BusinessActions.LoadBusinessData;

  constructor(public uuid: string) { }
}

export class BusinessDataLoaded {
  static type = BusinessActions.BusinessDataLoaded;

  constructor(public payload: BusinessInterface) { }
}

export class LoadBusinesses {
  static type = BusinessActions.LoadBusinesses;
  constructor(public active?:string, public page?: string, public limit?: string, public reload?:boolean) {

  }
}

export class BusinessesLoaded {
  static type = BusinessActions.BusinessesLoaded;

  constructor(public payload: { businesses:BusinessInterface[],total:number}, public reload?:boolean) { }
}

export class DefaultBusinessesLoaded {
  static type = BusinessActions.DefaultBusinessesLoaded;

  constructor(public payload: BusinessInterface, public reload?:boolean) { }
}
export class ResetBusinessState {
  static type = BusinessActions.ResetBusinessState;
}

export class LoadFailed {
  static type = BusinessActions.LoadFailed;

  constructor(public payload: HttpErrorResponse) { }
}
