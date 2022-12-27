import { ConnectionPositionPair } from '@angular/cdk/overlay';

import { PebElementStyles, PebElementTransformationDeep, PebStylesheet } from '@pe/builder-core';
import { PeDataGridItem, PeDataGridSortByActionIcon } from '@pe/common';
import { FolderItem, PeFoldersContextMenuEnum } from '@pe/folders';
import { PeDataGridLayoutByActionIcon, PeDataToolbarOptionIcon, PeFilterConditions, PeFilterType, PeGridMenu, PeGridMenuDivider, PeGridSortingDirectionEnum, PeGridSortingOrderByEnum, PeGridTableActionCellComponent, PeGridTableDisplayedColumns, PeGridTableTitleCellComponent, PeGridView } from '@pe/grid';

export const OVERLAY_POSITIONS: ConnectionPositionPair[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
  },
];

export enum ShapeAction {
  Copy = 'copy',
  Move = 'move',
}

export interface ShapesDialogItem {
  shape: PeDataGridItem,
  elm: PebElementTransformationDeep,
  styles: Partial<PebElementStyles>,
  stylesheet: PebStylesheet,
  scale: number
}

export interface TransformationsStore {
  [key: string]: PebElementTransformationDeep,
}

export enum SideNavMenuActions {
  NewFolder = 'NEW_FOLDER',
};

export const FOLDERS_SIDENAV_MENU: PeGridMenu = {
  title: 'folders.context_menu.title',
  showCloseButton: false,
  items: [
    {
      label: 'folders.context_menu.add_folder',
      value: SideNavMenuActions.NewFolder,
    },
  ],
};

export const TOOLBAR_FILTERS = [
  {
    fieldName: 'title',
    filterConditions: [
      PeFilterConditions.Contains,
      PeFilterConditions.DoesNotContain,
    ],
    label: 'Name',
    type: PeFilterType.String,
  },
];

export enum OptionsMenu {
  SelectAll = 'SELECT_ALL',
  DeselectAll = 'DESELECT_ALL',
  Delete = 'DELETE',
  Duplicate = 'DUPLICATE',
};

export const TOOLBAR_OPTIONS: PeGridMenu = {
  title: 'grid.toolbar.items_options_menu.title',
  items: [
    {
      label: 'grid.toolbar.items_options_menu.select_all',
      value: OptionsMenu.SelectAll,
      defaultIcon: PeDataToolbarOptionIcon.SelectAll,
    },
    {
      label: 'grid.toolbar.items_options_menu.deselect_all',
      value: OptionsMenu.DeselectAll,
      defaultIcon: PeDataToolbarOptionIcon.DeselectAll,
    },
    {
      label: 'grid.toolbar.items_options_menu.duplicate',
      value: OptionsMenu.Duplicate,
      defaultIcon: PeDataToolbarOptionIcon.Duplicate,
    },
    {
      label: 'grid.toolbar.items_options_menu.delete',
      value: OptionsMenu.Delete,
      defaultIcon: PeDataToolbarOptionIcon.Delete,
    },
  ],
};

export const TOOLBAR_SORTING_MENU = {
  title: 'grid.toolbar.sort_menu.title',
  activeValue: {
    direction: PeGridSortingDirectionEnum.Ascending,
    orderBy: PeGridSortingOrderByEnum.Title,
  },
  items: [
    {
      defaultIcon: PeDataGridSortByActionIcon.Ascending,
      label: 'grid.toolbar.sort_menu.a_z',
      value: {
        direction: PeGridSortingDirectionEnum.Ascending,
        orderBy: PeGridSortingOrderByEnum.Title,
      },
    },
    {
      defaultIcon: PeDataGridSortByActionIcon.Descending,
      label: 'grid.toolbar.sort_menu.z_a',
      value: {
        direction: PeGridSortingDirectionEnum.Descending,
        orderBy: PeGridSortingOrderByEnum.Title,
      },
    },
  ],
};

export const TOOLBAR_CUSTOM_MENU = [];

export const TOOLBAR_CONFIG = {
  filterConfig: TOOLBAR_FILTERS,
  optionsMenu: TOOLBAR_OPTIONS,
  sortMenu: TOOLBAR_SORTING_MENU,
  customMenus: TOOLBAR_CUSTOM_MENU,
};


export const VIEW_MENU: PeGridMenu = {
  title: 'grid.content.toolbar.layout',
  items: [
    {
      label: 'grid.content.toolbar.list',
      value: PeGridView.Table,
      defaultIcon: PeDataGridLayoutByActionIcon.ListLayout,
    },
    {
      label: 'grid.content.toolbar.grid',
      value: PeGridView.List,
      defaultIcon: PeDataGridLayoutByActionIcon.GridLayout,
    },
  ],
};

export const MIN_ITEM_WIDTH = 230;

export enum ContextMenu {
  Delete = 'DELETE',
  Edit = 'EDIT',
  Rename = 'RENAME',
  Copy = 'COPY',
  Paste = 'PASTE',
  Duplicate = 'DUPLICATE',
  Settings = 'SETTINGS',
  AddFolder = 'ADD_FOLDER'
}

export const VIEWPORT_CONTEXT_MENU: PeGridMenu = {
  title: 'grid.context_menu.title',
  items: [
    {
      label: 'grid.context_menu.paste',
      value: ContextMenu.Paste,
      disabled: true,
    },
    {
      label: 'grid.context_menu.add_folder',
      value: ContextMenu.AddFolder,
      dividers: [PeGridMenuDivider.Top],
    },
  ],
};

export const ITEM_CONTEXT_MENU: PeGridMenu = {
  title: 'grid.context_menu.title',
  items: [
    {
      label: 'grid.context_menu.edit',
      value: ContextMenu.Edit,
    },
    {
      label: 'grid.context_menu.copy',
      value: ContextMenu.Copy,
    },
    {
      label: 'grid.context_menu.duplicate',
      value: ContextMenu.Duplicate,
    },
    {
      label: 'grid.context_menu.paste',
      value: ContextMenu.Paste,
      disabled: true,
    },
    {
      label: 'grid.context_menu.add_folder',
      value: ContextMenu.AddFolder,
      dividers: [PeGridMenuDivider.Top, PeGridMenuDivider.Bottom],
    },
    {
      label: 'grid.context_menu.delete',
      value: ContextMenu.Delete,
    },
  ],
};

export const ROOT_ITEM: FolderItem = {
  _id: null,
  name: 'All Shapes',
  image: 'assets/icons/folder.svg',
  position: 0,
  isHideMenu: false,
  isProtected: false,
}

export const DEFAULT_ORDER_BY = {
  direction: PeGridSortingDirectionEnum.Ascending,
  orderBy: PeGridSortingOrderByEnum.Title,
}

export const TABLE_DISPLAYED_COLUMNS: PeGridTableDisplayedColumns[] = [
  {
    name: 'name',
    title: 'grid.table_displayed_columns.name',
    cellComponent: PeGridTableTitleCellComponent,
  },
  {
    name: 'action',
    title: '',
    cellComponent: PeGridTableActionCellComponent,
  },
];

export const DEFAULT_CONTEXT_MENU_ITEMS = [
  PeFoldersContextMenuEnum.Edit,
  PeFoldersContextMenuEnum.Copy,
  PeFoldersContextMenuEnum.Paste,
  PeFoldersContextMenuEnum.Duplicate,
  PeFoldersContextMenuEnum.AddFolder,
  PeFoldersContextMenuEnum.Delete,
];
