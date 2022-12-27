import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import produce from 'immer';

import {
  AddAppointment,
  InitAppointments,
  LazyLoadedAppointments,
  UpdateAppointment,
} from './actions';

@State<any>({
  name: 'appAppointments',
  defaults: { appointments: [], newItem: null, updateItem: null },
})

@Injectable()
export class AppointmentsAppState {

  @Selector()
  static appointments(state: any) {
    return state.appointments;
  }

  @Selector()
  static newItem(state: any) {
    return state.newItem;
  }

  @Selector()
  static updateItem(state: any) {
    return state.updateItem;
  }

  @Action(InitAppointments)
  initAppointments({ patchState, getState }: StateContext<any>, { items }: InitAppointments) {
    const state = produce(getState(), (draft) => {
      draft.appointments = items;
    });
    patchState(state);
  }

  @Action(LazyLoadedAppointments)
  lazyLoadedAppointments({ patchState, getState }: StateContext<any>, { items }: LazyLoadedAppointments) {
    const state = produce(getState(), (draft) => {
      draft.appointments = items;
    });
    patchState(state);
  }

  @Action(AddAppointment)
  addAppointment({ patchState, getState }: StateContext<any>, { item }: AddAppointment) {
    const state = produce(getState(), (draft) => {
      draft.newItem = item;
    });
    patchState(state);
  }

  @Action(UpdateAppointment)
  updateAppointment({ patchState, getState }: StateContext<any>, { item }: UpdateAppointment) {
    const state = produce(getState(), (draft) => {
      draft.updateItem = item;
    });
    patchState(state);
  }
}
