import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import produce from 'immer';
import isEmpty from 'lodash/isEmpty';
import { tap } from 'rxjs/operators';

import { TreeFilterNode } from '@pe/common';

import {
  ALBUMS,
  mapAlbumToTreeNode,
  mapAttributesToAlbums,
  mapAttributeToCategory,
} from '../../utils/helpers-transform';
import {
  PeStudioAlbum,
  PeAttribute,
  PeStudioCategory,
} from '../interfaces';
import { StudioApiService } from '../services';

import {
  CreateAlbum,
  CreateCategoryAlbum,
  DeleteAlbum,
  EditingUpdateAlbum,
  InitLoadAlbums,
  UpdateAlbum,
} from './albums.actions';
import { CreateUserAttribute, InitLoadAttributes, UpdateUserAttribute } from './attributes.actions';
import {
  ActiveUpdateCategory,
  CreateCategory,
  DeleteActiveCategory,
  EditingUpdateCategory,
  LoadCategories,
  PatchTreeCategory,
  SetTreeCategory,
  Update2TreeCategory,
  UpdateCategory,
  UpdateDeleteAlbumCategory,
  UpdateTreeCategory,
} from './categories.actions';
import { PopupMode } from './popup.actions';

export interface StudioAppModel {
  attributes: PeAttribute[];
  albums: PeStudioAlbum[];
  categories: PeStudioCategory[];
}

@State<StudioAppModel>({
  name: 'studio',
  defaults: { albums: [], attributes: [], categories: [] },
})
@Injectable()
export class StudioAppState {
  constructor(private studioApiService: StudioApiService) { }

  @Selector()
  static studioCategories(state: StudioAppModel) {
    return state.categories;
  }

  @Selector()
  static popupMode(state: any) {
    return state.trigger;
  }

  @Action(PopupMode)
  popupMode({ patchState, getState }: StateContext<any>, { trigger }: PopupMode) {
    const state = produce(getState(), (draft) => {
      draft.trigger = trigger;
    });
    patchState(state);
  }

  @Action(InitLoadAlbums)
  loadAlbums({ patchState, getState }: StateContext<StudioAppModel>, { businessId }: InitLoadAlbums) {
    return this.studioApiService.getUserAlbums().pipe(
      tap((data) => {
        const state = getState();
        patchState({ ...state, albums: data });
      }),
    );
  }

  @Action(InitLoadAlbums)
  loadAttributes({ patchState, getState }: StateContext<StudioAppModel>, { businessId }: InitLoadAttributes) {
    return this.studioApiService.getUserAttributes().pipe(
      tap((data) => {
        const state = getState();
        patchState({ ...state, attributes: data });
      }),
    );
  }

  @Action(LoadCategories)
  loadCategories({ setState, getState }: StateContext<StudioAppModel>, { attributes, albums }: LoadCategories) {
    const state = produce(getState(), (draft) => {
      draft.categories = mapAttributesToAlbums(attributes, albums, ALBUMS);
    });
    setState(state);
  }

  @Action(CreateCategory)
  createCategory({ setState, getState }: StateContext<StudioAppModel>, { businessId, attribute }: CreateCategory) {
    const state = produce(getState(), (draft) => {
      const category = mapAttributeToCategory(attribute, businessId);
      draft.categories.push(category);
    });
    setState(state);
  }

  @Action(EditingUpdateCategory)
  setEditingCategory({ patchState, getState }: StateContext<StudioAppModel>, { category }: EditingUpdateCategory) {
    const state = produce(getState(), (draft) => {
      const index = draft.categories.findIndex(cat => cat._id === category._id);
      draft.categories[index].editing = category.editing;
    });
    patchState(state);
  }

  @Action(ActiveUpdateCategory)
  setActiveCategory({ patchState, getState }: StateContext<StudioAppModel>, { category }: ActiveUpdateCategory) {
    const state = produce(getState(), (draft) => {
      const index = draft.categories.findIndex(cat => cat._id === category._id);
      draft.categories[index].active = category.active;
    });
    patchState(state);
  }

  @Action(DeleteActiveCategory)
  deleteActiveCategory(
    { patchState, getState }: StateContext<StudioAppModel>,
    { payload }: DeleteActiveCategory,
  ) {
    return this.studioApiService.deleteAttribute(payload._id).pipe(
      tap(() => {
        const state = produce(getState(), (draft) => {
          const index = draft.categories.findIndex(cat => cat._id === payload._id);
          draft.categories.splice(index, 1);
          draft.categories.map(category => ({ ...category, active: false }));
        });
        patchState(state);
      }),
    );
  }

  @Action(SetTreeCategory)
  setTreeCategory({ patchState, getState }: StateContext<StudioAppModel>, { category }: SetTreeCategory) {
    const state = produce(getState(), (draft) => {
      const index = draft.categories.findIndex(cat => cat._id === category._id);
      category.editing = false;
      draft.categories[index] = category;
    });
    patchState(state);
  }

  @Action(PatchTreeCategory)
  patchTreeCategory({ patchState, getState }: StateContext<StudioAppModel>, { category }: PatchTreeCategory) {
    const state = produce(getState(), (draft) => {
      let index;
      if (isCategoryType(category)) {
        index = draft.categories.findIndex(cat => cat._id === category._id);
        draft.categories[index].tree = category.listItems;
      } else if (isRootNode(category)) {
        index = draft.categories.findIndex(cat => cat._id === category.data.userAttributes[0].attribute);
        draft.categories[index].listItems.push(category.children.pop());
        draft.categories[index].tree = draft.categories[index].listItems;
      } else {
        index = draft.categories.findIndex(cat => cat._id === category.categoryId);
        draft.categories[index].tree = category.children;
      }
    });
    patchState(state);
  }

  @Action(Update2TreeCategory)
  update2TreeCategory(
    { patchState, getState }: StateContext<StudioAppModel>,
    { category, node, payload }: Update2TreeCategory,
  ) {
    const firstState = getState();

    const state = produce(getState(), (draft) => {
      draft.categories = mapAttributesToAlbums(firstState.attributes, firstState.albums, ALBUMS);
    });
    patchState(state);
  }

  @Action(UpdateTreeCategory)
  updateTreeCategory(
    { patchState, getState }: StateContext<StudioAppModel>,
    { category, node, payload }: UpdateTreeCategory,
  ) {
    const beforeState = getState();
    const categoryIndex = beforeState.categories.findIndex((cat: PeStudioCategory) => cat._id === category._id);
    const nodeIndex = beforeState.categories[categoryIndex].tree.findIndex(treeNode => treeNode.id === 'new_id');

    const state = produce(getState(), (draft) => {
      draft.categories[categoryIndex].tree.splice(nodeIndex, 1);
      draft.categories[categoryIndex].tree.push(mapAlbumToTreeNode(payload, category, draft.albums));
      draft.categories[categoryIndex].editing = false;
    });
    patchState(state);
  }

  @Action(UpdateCategory)
  updateCategory({ patchState, getState }: StateContext<StudioAppModel>, { attribute, businessId }: UpdateCategory) {
    const state = produce(getState(), (draft) => {
      const index = draft.categories.findIndex(cat => cat._id === attribute._id);
      draft.categories[index].name = attribute.name;
      draft.categories[index].editing = false;
    });
    patchState(state);
  }

  @Action(UpdateDeleteAlbumCategory)
  updateDeleteAlbumCategory(
    { patchState, getState }: StateContext<StudioAppModel>,
    { category, node, payload }: UpdateDeleteAlbumCategory,
  ) {
    const state = produce(getState(), (draft) => {
      const index = draft.categories.findIndex(cat => cat._id === category._id);
      const albumIndex = draft.categories[index].tree.indexOf(payload);
      draft.categories[index].tree.splice(albumIndex, 1);
    });
    patchState(state);
  }

  @Action(CreateUserAttribute)
  createUserAttribute(
    { setState, getState, dispatch }: StateContext<StudioAppModel>,
    { businessId, payload }: CreateUserAttribute,
  ) {
    return this.studioApiService.createUserAttribute(payload).pipe(
      tap((data: PeAttribute) => {
        const state = produce(getState(), (draft) => {
          draft.attributes.push(data);
        });
        setState(state);
        dispatch(new CreateCategory(businessId, data));
      }),
    );
  }

  @Action(UpdateUserAttribute)
  updateUserAttribute(
    { setState, getState, dispatch }: StateContext<StudioAppModel>,
    { businessId, payload, id }: UpdateUserAttribute,
  ) {
    return this.studioApiService.updateAttribute(payload, id).pipe(
      tap((data: PeAttribute) => {
        const state = produce(getState(), (draft) => {
          draft.attributes.push(data);
        });
        setState(state);
        dispatch(new UpdateCategory(businessId, data));
      }),
    );
  }

  @Action(CreateCategoryAlbum)
  async createCategoryAlbum(
    { patchState, getState, dispatch }: StateContext<StudioAppModel>,
    { businessId, payload, node, category }: CreateAlbum,
  ) {
    const album = await this.studioApiService.createAlbum(payload).toPromise();
    const state = produce(getState(), (draft) => {
      draft.albums.push(album);
    });
    patchState(state);
    await dispatch(new UpdateTreeCategory(category, node, album)).toPromise();
  }

  @Action(CreateAlbum)
  async createAlbum(
    { patchState, getState, dispatch }: StateContext<StudioAppModel>,
    { payload, node, category }: CreateAlbum,
  ) {
    const album = await this.studioApiService.createAlbum(payload).toPromise();
    const state = produce(getState(), (draft) => {
      draft.albums.push(album);
    });

    patchState(state);
    await dispatch(new UpdateTreeCategory(category, node, album)).toPromise();
  }

  @Action(UpdateAlbum)
  updateAlbum(
    { patchState, getState, dispatch }: StateContext<StudioAppModel>,
    { payload, node }: UpdateAlbum,
  ) {
    const defaultState = getState();
    const catIndex = defaultState.categories.findIndex(cat => cat._id === node[0].data.userAttributes[0].attribute);
    const category = defaultState.categories[catIndex];

    return this.studioApiService.updateAlbum(node.id, payload).pipe(
      tap((data: PeStudioAlbum) => {
        const state = produce(getState(), (draft) => {
          const index = draft.albums.findIndex(album => album._id === node.id);
          draft.albums[index] = data;
        });
        patchState(state);
        dispatch(new UpdateTreeCategory(category, node, data));
      }),
    );
  }

  @Action(DeleteAlbum)
  deleteAlbum(
    { patchState, getState, dispatch }: StateContext<StudioAppModel>,
    { businessId, albumId, node }: DeleteAlbum,
  ) {
    const defaultState = getState();
    const catIndex = defaultState.categories.findIndex(
      category => category._id === node[0].data.userAttributes[0].attribute,
    );
    const singleCategory = defaultState.categories[catIndex];

    return this.studioApiService.deleteAlbum(albumId).pipe(
      tap((data: PeStudioAlbum) => {
        const state = produce(getState(), (draft) => {
          const index = draft.albums.findIndex(albumDelete => albumDelete._id === node.id);
          draft.albums.splice(index, 1);
        });
        patchState(state);
        dispatch(new UpdateTreeCategory(singleCategory, node, data));
      }),
    );
  }

  @Action(EditingUpdateAlbum)
  editingUpdateAlbum({ patchState, getState, dispatch }: StateContext<StudioAppModel>, { node }: EditingUpdateAlbum) {
    const state = getState();
    const index = state.categories.findIndex(category => category._id === node[0].data.userAttributes[0].attribute);
    const folderIndex = state.categories[index].tree.findIndex(treeNode => treeNode.id === node[0].id);

    const upDateState = produce(getState(), (draft) => {
      draft.categories[index].tree[folderIndex].editing = true;
    });
    patchState(upDateState);
  }
}
export const isCategoryType = (data: any): data is PeStudioCategory => {
  return data.hasOwnProperty('tree');
};
export const isRootNode = (data: any): data is TreeFilterNode => {
  return !isEmpty(data.data.userAttributes);
};
