import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import produce from 'immer';

import {
  AddItems,
  AddPackageItems,
  AddZonesItems,
  ClearStore,
  OpenFolder,
  OpenPackageFolder,
  OpenZonesFolder,
} from './shipping.action';

@State<any>({
  name: 'appShipping',
  defaults: {  gridItems: [], zonesGridItems: [], packageGridItems: [] },
})

@Injectable()
export class ShippingAppState {

  @Selector()
  static profileGridItems(state: any) {
    return state.gridItems;
  }

  @Selector()
  static zonesGridItems(state: any) {
    return state.zonesGridItems;
  }

  @Selector()
  static packageGridItems(state: any) {
    return state.packageGridItems;
  }

  @Action(AddZonesItems)
  addZonesItems({ patchState, getState }: StateContext<any>, { items }: AddItems) {
    const state = produce(getState(), (draft) => {
      draft.zonesGridItems = [...draft.zonesGridItems, ...items];
    });
    patchState(state);
  }

  @Action(AddPackageItems)
  addPackageItems({ patchState, getState }: StateContext<any>, { items }: AddItems) {
    const state = produce(getState(), (draft) => {
      draft.packageGridItems = [...draft.zonesGridItems, ...items];
    });
    patchState(state);
  }

  @Action(AddItems)
  addItems({ patchState, getState }: StateContext<any>, { items }: AddItems) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = [...draft.gridItems, ...items];
    });
    patchState(state);
  }

  @Action(OpenFolder)
  openFolder({ patchState, getState }: StateContext<any>, { items }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = items;
    });
    patchState(state);
  }

  @Action(OpenZonesFolder)
  openZoneFolder({ patchState, getState }: StateContext<any>, { items }: any) {
    const state = produce(getState(), (draft) => {
      draft.zonesGridItems = items;
    });
    patchState(state);
  }

  @Action(OpenPackageFolder)
  openPackageFolder({ patchState, getState }: StateContext<any>, { items }: any) {
    const state = produce(getState(), (draft) => {
      draft.packageGridItems = items;
    });
    patchState(state);
  }

  @Action(ClearStore)
  clearStore({ patchState, getState }: StateContext<any>, { items }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = [];
      draft.zonesGridItems = [];
      draft.packageGridItems = [];
    });
    patchState(state);
  }

}
