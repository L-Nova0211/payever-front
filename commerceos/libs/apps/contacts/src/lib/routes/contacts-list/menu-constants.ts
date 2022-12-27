import { PeDataGridSortByActionIcon } from '@pe/common';
import {
  GridSkeletonColumnType,
  GridTitleImageStyle,
  PeDataGridLayoutByActionIcon,
  PeDataToolbarOptionIcon,
  PeFilterConditions,
  PeFilterType,
  PeGridMenu,
  PeGridMenuDivider,
  PeGridSortingDirectionEnum,
  PeGridSortingOrderByEnum,
  PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns,
  PeGridTableTitleCellComponent,
  PeGridView,
} from '@pe/grid';

export enum ContextMenu {
  AddFolder = 'ADD_FOLDER',
  Approve = 'APPROVE',
  Copy = 'COPY',
  Delete = 'DELETE',
  Deny = 'DENY',
  Duplicate = 'DUPLICATE',
  Edit = 'EDIT',
  Paste = 'PASTE',
  Rename = 'RENAME',
  Settings = 'SETTINGS',
};

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
      label: 'grid.context_menu.paste',
      value: ContextMenu.Paste,
      disabled: true,
    },
    {
      label: 'contacts-app.menu.items.approve',
      value: ContextMenu.Approve,
    },
    {
      label: 'contacts-app.menu.items.deny',
      value: ContextMenu.Deny,
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

export enum SideNavMenuActions {
  NewFolder = 'NEW_FOLDER',
  NewHeadline = 'NEW_HEADLINE',
  Rules = 'MANAGE_RULES',
};

export const FOLDERS_SIDENAV_MENU: PeGridMenu = {
  title: 'folders.context_menu.title',
  showCloseButton: false,
  items: [
    {
      label: 'folders.context_menu.add_folder',
      value: SideNavMenuActions.NewFolder,
    },
    {
      label: 'folders.context_menu.add_headline',
      value: SideNavMenuActions.NewHeadline,
    },
    {
      label: 'folders.context_menu.rules',
      value: SideNavMenuActions.Rules,
    },
  ],
};

const TOOLBAR_FILTERS = [
  {
    fieldName: 'firstName',
    filterConditions: [
      PeFilterConditions.Contains,
      PeFilterConditions.DoesNotContain,
    ],
    label: 'contacts-app.filter.first_name',
    type: PeFilterType.String,
  },
  {
    fieldName: 'lastName',
    filterConditions: [
      PeFilterConditions.Contains,
      PeFilterConditions.DoesNotContain,
    ],
    label: 'contacts-app.filter.last_name',
    type: PeFilterType.String,
  },
  {
    fieldName: 'email',
    filterConditions: [
      PeFilterConditions.Contains,
      PeFilterConditions.DoesNotContain,
    ],
    label: 'contacts-app.filter.email',
    type: PeFilterType.String,
  },
  {
    fieldName: 'name',
    filterConditions: [
      PeFilterConditions.Contains,
      PeFilterConditions.DoesNotContain,
    ],
    label: 'contacts-app.filter.folder_name',
    type: PeFilterType.String,
  },
];

export enum OptionsMenu {
  SelectAll = 'SELECT_ALL',
  DeselectAll = 'DESELECT_ALL',
  Delete = 'DELETE',
  Duplicate = 'DUPLICATE',
};

const TOOLBAR_OPTIONS: PeGridMenu = {
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

const TOOLBAR_SORTING_MENU = {
  title: 'grid.toolbar.sort_menu.title',
  activeValue: {
    direction: PeGridSortingDirectionEnum.Descending,
    orderBy: PeGridSortingOrderByEnum.CreationDate,
  },
  items: [
    {
      defaultIcon: PeDataGridSortByActionIcon.Ascending,
      label: 'grid.toolbar.sort_menu.a_z',
      value: {
        direction: PeGridSortingDirectionEnum.Ascending,
        orderBy: PeGridSortingOrderByEnum.FirstName,
      },
    },
    {
      defaultIcon: PeDataGridSortByActionIcon.Descending,
      label: 'grid.toolbar.sort_menu.z_a',
      value: {
        direction: PeGridSortingDirectionEnum.Descending,
        orderBy: PeGridSortingOrderByEnum.FirstName,
      },
    },
    {
      defaultIcon: PeDataGridSortByActionIcon.Ascending,
      label: 'grid.toolbar.sort_menu.oldest',
      value: {
        direction: PeGridSortingDirectionEnum.Ascending,
        orderBy: PeGridSortingOrderByEnum.CreationDate,
      },
    },
    {
      defaultIcon: PeDataGridSortByActionIcon.Descending,
      label: 'grid.toolbar.sort_menu.newest',
      value: {
        direction: PeGridSortingDirectionEnum.Descending,
        orderBy: PeGridSortingOrderByEnum.CreationDate,
      },
    },
  ],
};

export const TOOLBAR_CONFIG = {
  filterConfig: TOOLBAR_FILTERS,
  optionsMenu: TOOLBAR_OPTIONS,
  sortMenu: TOOLBAR_SORTING_MENU,
};

export const TABLE_DISPLAYED_COLUMNS: PeGridTableDisplayedColumns[] = [
  {
    name: 'name',
    title: 'grid.table_displayed_columns.name',
    cellComponent: PeGridTableTitleCellComponent,
    data:{
      titleImageStyle:GridTitleImageStyle.Circle,
    },
    skeletonColumnType: GridSkeletonColumnType.ThumbnailCircleWithName,
  },
  {
    name: 'country',
    title: 'contacts-app.displayed_columns.country',
  },
  {
    name: 'action',
    title: '',
    cellComponent: PeGridTableActionCellComponent,
    skeletonColumnType: GridSkeletonColumnType.Rectangle,
  },
];

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
      value: PeGridView.BigListCover,
      defaultIcon: PeDataGridLayoutByActionIcon.GridLayout,
      minItemWidth: 290,
      maxColumns: 5,
    },
  ],
};

export enum FileType {
  CSV,
  XML,
}

export const MORE_MENUS = {
  items: [
    {
      label: 'contacts-app.menu.items.approve',
      value: ContextMenu.Approve,
    },
    {
      label: 'contacts-app.menu.items.deny',
      value: ContextMenu.Deny,
    },
    {
      label: 'grid.context_menu.delete',
      value: ContextMenu.Delete,
      color: '#eb4653',
    },
  ],
};
