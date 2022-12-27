import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import * as PreloaderActions from './preloader.action';

const preloaderState = 'preloaderState';

export interface PreloaderStateModel {
  loading: {
    [key: string]: boolean
  };
}

@State<PreloaderStateModel>({
  name: preloaderState,
  defaults: {
    loading: {},
  },
})
@Injectable()
export class PreloaderState {
  @Selector()
  static loading(state: PreloaderStateModel): any {
    return state.loading;
  }

  @Action(PreloaderActions.StartLoading)
  startLoading(
    ctx: StateContext<PreloaderStateModel>,
    action: PreloaderActions.StartLoading
  ) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      loading: { ...state.loading, [action.payload]: true },
    });
  }

  @Action(PreloaderActions.StopLoading)
  stopLoading(
    ctx: StateContext<PreloaderStateModel>,
    action: PreloaderActions.StartLoading
  ) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      loading: {  ...state.loading, [action.payload]: false },
    });
  }
}
