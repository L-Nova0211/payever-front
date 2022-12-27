import { Injectable } from '@angular/core';
import { Action, createSelector, State, StateContext } from '@ngxs/store';
import produce from 'immer';
import cloneDeep from 'lodash/cloneDeep';
import flatten from 'lodash/flatten';

import { FolderItem } from '@pe/folders';

import { PeGridItem, PeGridItemType } from '../misc/interfaces';

import { DEFAULT_NAME, PeFoldersActions, PeGridItemsActions, PeGridStoreActions } from './grid.actions';

const DEFAULT_VALUES = { folders: [], gridItems: [] };

interface PeGridStateInterface {
  [key: string]: {
    folders: FolderItem[];
    gridItems: PeGridItem[];
  };
}

@State<PeGridStateInterface>({
  name: 'Grid',
  defaults: {
    [DEFAULT_NAME]: DEFAULT_VALUES,
  },
})

@Injectable()
export class PeGridState {

  static folders(appName = DEFAULT_NAME) {
    return createSelector([PeGridState], (state: PeGridStateInterface) => {
      return state[appName].folders;
    });
  }

  static gridItems(appName = DEFAULT_NAME) {
    return createSelector([PeGridState], (state: PeGridStateInterface) => {
      return state[appName].gridItems;
    });
  }

  @Action(PeGridStoreActions.Create)
  createAppState(
    { patchState }: StateContext<PeGridStateInterface>,
    { appName }: PeGridStoreActions.Create,
  ) {
    patchState({ [appName]: DEFAULT_VALUES });
  }

  @Action(PeGridStoreActions.Clear)
  clearStore(
    { getState, setState }: StateContext<PeGridStateInterface>,
    { appName }: PeGridStoreActions.Clear,
  ) {
    const state = produce(getState(), (draft) => {
      draft[appName].gridItems = [];
      draft[appName].folders = [];
      appName !== DEFAULT_NAME && delete draft[appName];
    });
    setState(state);
  }

  // Folders actions
  @Action(PeFoldersActions.InitFoldersTree)
  initFoldersTree(
    { patchState, getState }: StateContext<PeGridStateInterface>,
    { tree, currentFolderId, appName }: PeFoldersActions.InitFoldersTree,
  ) {
    const state = produce(getState(), (draft: PeGridStateInterface) => {
      const folders = this.flatFoldersTree(tree);
      draft[appName].folders = [...this.sortFoldersByPositions(folders)];
      const childrenOfCurrentFolder = draft[appName].folders.filter(folder => folder.parentFolderId === currentFolderId);
      const gridFolders = this.foldersToGridItemMapper(childrenOfCurrentFolder);
      const gridItems = draft[appName].gridItems.filter(gridItem => gridItem.type === PeGridItemType.Item);
      draft[appName].gridItems = [...gridFolders, ...gridItems];
    });
    patchState(state);
  }

  private flatFoldersTree(folders: FolderItem[]): FolderItem[] {
    return folders.some(folder => folder?.children && folder.children.length)
      ? [...folders, ...this.flatFoldersTree(flatten(folders.map(folder => folder?.children ?? [])))]
      : folders;
  }

  private sortFoldersByPositions(folders: FolderItem[]): FolderItem[] {
    return folders.sort((prev, curr) => prev.position - curr.position);
  }

  private foldersToGridItemMapper(folders: FolderItem[]): PeGridItem[] {
    return folders.map((folder: FolderItem): PeGridItem => {
      return {
        action: {
          label: 'grid.actions.open',
          more: true,
        },
        columns: [
          {
            name: 'name',
            value: 'name',
          },
          {
            name: 'action',
            value: 'action',
          },
        ],
        data: {
          children: cloneDeep(folder?.children ?? []),
          isHeadline: folder.isHeadline,
          parentFolderId: folder.parentFolderId,
          position: folder.position,
        },
        id: folder._id,
        image: folder.image,
        isDraggable: true,
        title: folder.name,
        type: PeGridItemType.Folder,
      };
    });
  }

  @Action(PeFoldersActions.Create)
  createFolders(
    { patchState, getState }: StateContext<PeGridStateInterface>,
    { newFolder, currentFolderId, appName }: PeFoldersActions.Create
  ) {
    const state = produce(getState(), (draft: PeGridStateInterface) => {
      draft[appName].folders = [...draft[appName].folders, newFolder];
      if (currentFolderId === newFolder.parentFolderId) {
        const gridFolders = draft[appName].gridItems.filter(gridItem => gridItem.type === PeGridItemType.Folder);
        const gridItems = draft[appName].gridItems.filter(gridItem => gridItem.type === PeGridItemType.Item);
        const gridFolder = this.foldersToGridItemMapper([newFolder]);
        draft[appName].gridItems = [...gridFolders, ...gridFolder, ...gridItems];
      }
    });
    patchState(state);
  }

  @Action(PeFoldersActions.Delete)
  deleteFolders(
    { patchState, getState }: StateContext<PeGridStateInterface>,
    { folderToDelete, appName }: PeFoldersActions.Delete
  ) {
    const state = produce(getState(), (draft: PeGridStateInterface) => {
      draft[appName].folders = draft[appName].folders.filter(existFolder => existFolder._id !== folderToDelete._id);
      draft[appName].gridItems = draft[appName].gridItems.filter(existItem => existItem.id !== folderToDelete._id);
    });
    patchState(state);
  }

  @Action(PeFoldersActions.Update)
  updateFolder(
    { patchState, getState }: StateContext<PeGridStateInterface>,
    { folderToUpdate, currentFolderId, appName }: PeFoldersActions.Update
  ) {
    const state = produce(getState(), (draft: PeGridStateInterface) => {
      const folderIndex = draft[appName].folders.findIndex(existFolder => existFolder._id === folderToUpdate._id);
      if (folderIndex !== -1) {
        const prevPosition = draft[appName].folders[folderIndex].position;
        folderToUpdate.position = prevPosition;
        draft[appName].folders[folderIndex] = folderToUpdate;
      }

      const itemIndex = draft[appName].gridItems.findIndex(gridItem => gridItem.id === folderToUpdate._id);
      if (itemIndex !== -1) {
        draft[appName].gridItems[itemIndex] = this.foldersToGridItemMapper([folderToUpdate])[0];
      }
    });
    patchState(state);
  }

  // Grid actions
  @Action(PeGridItemsActions.AddItem)
  addItem(
    { patchState, getState }: StateContext<PeGridStateInterface>,
    { newItem, appName }: PeGridItemsActions.AddItem
  ) {
    const state = produce(getState(), (draft: PeGridStateInterface) => {
      draft[appName].gridItems = [...draft[appName].gridItems, newItem];
    });
    patchState(state);
  }

  @Action(PeGridItemsActions.DeleteItems)
  deleteItems(
    { patchState, getState }: StateContext<PeGridStateInterface>,
    { itemsIds, appName }: PeGridItemsActions.DeleteItems
  ) {
    const state = produce(getState(), (draft: PeGridStateInterface) => {
      draft[appName].gridItems = draft[appName].gridItems.filter(gridItem => !itemsIds.includes(gridItem.id));
    });
    patchState(state);
  }

  @Action(PeGridItemsActions.EditItem)
  editItem(
    { patchState, getState }: StateContext<PeGridStateInterface>,
    { itemToUpdate, appName }: PeGridItemsActions.EditItem
  ) {
    const state = produce(getState(), (draft: PeGridStateInterface) => {
      const index = draft[appName].gridItems
        .findIndex(gridItem => gridItem.id === itemToUpdate.id || gridItem.serviceEntityId === itemToUpdate.id);
      if (index !== -1) {
        draft[appName].gridItems[index] = itemToUpdate;
      }
    });
    patchState(state);
  }

  @Action(PeGridItemsActions.OpenFolder)
  openFolder(
    { patchState, getState }: StateContext<PeGridStateInterface>,
    { folderItems, appName }: PeGridItemsActions.OpenFolder
  ) {
    const state = produce(getState(), (draft: PeGridStateInterface) => {
      draft[appName].gridItems = folderItems;
    });
    patchState(state);
  }
}
