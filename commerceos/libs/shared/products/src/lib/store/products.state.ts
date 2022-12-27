import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { PeGridItem, PeGridItemType } from '@pe/common';
import produce from 'immer';
import findLastIndex  from 'lodash/findLastIndex';

import {
  InitLoadFolders,
  AddItem,
  EditItem,
  OpenFolder,
  DeleteItems,
  ClearStore,
  SortStore,
  GroupStore,
  AddItems,
  AddFolder,
  AddProducts,
  PopupMode,
} from './folders.actions';

@State<any>({
  name: 'appProducts',
  defaults: { folders: [], gridItems: [], productIndustries: [], products: [], trigger: false },
})

@Injectable()
export class ProductsAppState {

  @Selector()
  static folders(state: any) {
    return state.folders;
  }

  @Selector()
  static productIndustries(state: any) {
    return state.productIndustries;
  }

  @Selector()
  static gridItems(state: any) {
    return state.gridItems;
  }

  @Selector()
  static products(state: any) {
    return state.products;
  }

  @Selector()
  static popupMode(state: any) {
    return state.trigger;
  }

  @Action(InitLoadFolders)
  loadAlbums({ patchState, getState }: StateContext<any>, { data, group }: any) {
    const state = produce(getState(), (draft) => {
      draft.folders = data.tree;
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

  @Action(GroupStore)
  GroupItems({ patchState, getState }: StateContext<any>, { order, group }: GroupStore) {

    const state = produce(getState(), (draft) => {
      draft.gridItems = [...draft.gridItems];
    });
    patchState(state);
  }

  sortItemsFunc(gridItems: any[], group: boolean, order: string = 'desc'){
    // group items in list view only
    if(group) {
      gridItems = gridItems.sort((a, b) => (!!a.data?.isFolder < !!b.data?.isFolder) ? 1 : -1);
    } else {
      gridItems = gridItems.sort((a, b) => (order === 'asc' ? (a.title < b.title) : (a.title > b.title)) ? 1 : -1);
    }

    return gridItems;
  }

  @Action(SortStore)
  SortItems({ patchState, getState }: StateContext<any>, { group }: SortStore) {

    const state = produce(getState(), (draft) => {
      draft.gridItems = this.sortItemsFunc(draft.gridItems, group);
    });
    patchState(state);
  }

  @Action(DeleteItems)
  deleteItems({ patchState, getState }: StateContext<any>, { items }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = draft.gridItems.filter(i => !items.includes(i.id));
    });
    patchState(state);

  }

  @Action(ClearStore)
  clearStore({ patchState, getState }: StateContext<any>, { items }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = [];
      draft.folders = [];
      draft.productIndustries = [];
    });
    patchState(state);

  }

  @Action(AddItem)
  addItem({ patchState, getState }: StateContext<any>, { item }: any) {
    if (item) {
      const state = produce(getState(), (draft) => {
        const addIndex = this.lastInsertIndexByType(draft.gridItems, PeGridItemType.Folder);
        draft.gridItems?.length ? draft.gridItems.splice(addIndex, 0, item) : draft.gridItems.push(item);
      });
      patchState(state);
    }

  }

  @Action(AddFolder)
  addFolder({ patchState, getState }: StateContext<any>, { item }: any) {
    const state = produce(getState(), (draft) => {
      const addIndex = this.lastInsertIndexByType(draft.gridItems, PeGridItemType.Folder);
      draft.gridItems?.length ? draft.gridItems.splice(addIndex, 0, item) : draft.gridItems.push(item);
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

  @Action(EditItem)
  EditItem({ setState }: StateContext<any>, { item }: any) {
    setState(
      produce((draft) => {
        const index = draft.gridItems.findIndex(i => i.id === item.id);
        if(index !== -1) {
          draft.gridItems[index] = item;
        }
      }),
    );
  }

  @Action(AddProducts)
  addProduct({ patchState, getState }: StateContext<any>, { items }: AddProducts) {
    const state = produce(getState(), (draft) => {
      draft.products = [...items];
    });
    patchState(state);
  }

  @Action(PopupMode)
  popupMode({ patchState, getState }: StateContext<any>, { trigger }: PopupMode) {
    const state = produce(getState(), (draft) => {
      draft.trigger = trigger;
    });
    patchState(state);
  }

  private lastInsertIndexByType(gridItems: PeGridItem[], type: PeGridItemType): number {
    const lastIndexFolder = findLastIndex(gridItems, (item: PeGridItem) => item.type === type);

    return lastIndexFolder !== -1 ? lastIndexFolder + 1 : 0;
  }
}
