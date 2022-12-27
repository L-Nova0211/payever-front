import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import produce from 'immer';

import { 
  InitLoadInvoiceFolders, 
  FilterInvoiceStore, 
  FilterStore, 
  OrderStore, 
  UpsertItem, 
  DeleteInvoices, 
  InitLoadCurrencies, 
  InitLoadLanguages,
  OpenFolder,
  AddItem,
  DeleteItems,
  InitLoadFolders,
  AddFolder,
  EditItem, 
} from './folders.actions';

@State<any>({
  name: 'appInvoices',
  defaults: { gridItems: [], search: [], order: 'asc', currencies: [], languages: [] },
})

@Injectable()
export class InvoicesAppState {

  @Selector()
  static filteredInvoices(state: any) {
    let filtered = state.gridItems;
    if(state.search.length) {
      state.search.forEach((filter) => {
        filtered = filtered?.filter(item => item[filter.filter].
          toLowerCase().indexOf(filter.searchText.toLowerCase()) != -1 );
      });
    }

    return filtered;
  }

  @Selector()
  static languages(state: any) {

    return state.languages;
  }

  @Selector()
  static folders(state: any) {

    return state.folders;
  }

  @Selector()
  static currencies(state: any) {

    return state.currencies;
  }

  @Selector()
  static gridItems(state: any) {

    return state.gridItems;
  }

  @Action(FilterStore)
  updateFilter({ patchState }: StateContext<any>, { field }: any) {
      patchState({ search: field });
  }

  @Action(InitLoadInvoiceFolders)
  loadInvoiceItems({ patchState, getState }: StateContext<any>, { data, group }: any) {

    const state = produce(getState(), (draft) => {
      draft.gridItems = this.sortItemsFunc(data, group);

    });
    patchState(state);
  }

  @Action(InitLoadCurrencies)
  loadCurrencies({ patchState, getState }: StateContext<any>, { data }: any) {
    const state = produce(getState(), (draft) => {
      draft.currencies = data;

    });
    patchState(state);
  }

  @Action(InitLoadLanguages)
  loadLanguages({ patchState, getState }: StateContext<any>, { data }: any) {
    const state = produce(getState(), (draft) => {
      draft.languages = data;

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

  @Action(OrderStore)
  SortItems({ patchState, getState }: StateContext<any>, { order }: OrderStore) {

    const state = produce(getState(), (draft) => {
      draft.gridItems = this.sortItemsFunc(draft.gridItems, false, order);
    });
    patchState(state);
  }

  @Action(FilterInvoiceStore)
  FilterItems({ patchState, getState }: StateContext<any>, { field, value }: FilterInvoiceStore) {

    const state = produce(getState(), (draft) => {
      if(field && value) {
        draft.gridItems = draft.gridItems.filter(item => item[field].toLowerCase().indexOf(value.toLowerCase()) != -1 );
      }
    });
    patchState(state);
  }

  @Action(UpsertItem)
  upsertItem({ setState, getState }: StateContext<any>, { item }: any) {
    setState(
      produce((draft) => {
        const index = draft.gridItems.findIndex(i => i.id === item.id);
        if(index !== -1) {
          draft.gridItems[index] = item;
        } else {
          draft.gridItems.push(item);
        }
      })
    )
  }

  @Action(DeleteInvoices)
  deleteItem({ patchState, getState }: StateContext<any>, { items }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = draft.gridItems.filter(i => !items.includes(i.id));
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

  @Action(AddItem)
  addItem({ patchState, getState }: StateContext<any>, { item }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = [...draft.gridItems, item];
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

  @Action(InitLoadFolders)
  loadAlbums({ patchState, getState }: StateContext<any>, { data, group }: any) {
    const state = produce(getState(), (draft) => {
      draft.folders = data.tree;
    });
    patchState(state);
  }

  @Action(AddFolder)
  addFolder({ patchState, getState }: StateContext<any>, { item }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = [item, ...draft.gridItems];
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
      })
    )}
}
