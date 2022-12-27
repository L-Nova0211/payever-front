import { PeDataGridSortByActionIcon } from '@pe/common';
import {
  PeDataGridLayoutByActionIcon,
  PeDataToolbarOptionIcon,
  PeFilterConditions,
  PeFilterKeyInterface,
  PeFilterType,
  PeGridContextMenuActionsEnum,
  PeGridMenu,
  PeGridMenuDivider,
  PeGridOptionsMenuActionsEnum,
  PeGridSideNavMenuActionsEnum,
  PeGridSortingDirectionEnum,
  PeGridSortingOrderByEnum,
  PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns,
  PeGridTableTitleCellComponent,
  PeGridView,
} from '@pe/grid';

import { PeSocialPostStatusesEnum, PeSocialPostTypesEnum } from '../../enums';

export const VIEWPORT_CONTEXT_MENU: PeGridMenu = {
  title: 'grid.context_menu.title',
  items: [
    {
      label: 'grid.context_menu.paste',
      value: PeGridContextMenuActionsEnum.Paste,
      disabled: true,
    },
    {
      label: 'grid.context_menu.add_folder',
      value: PeGridContextMenuActionsEnum.AddFolder,
      dividers: [PeGridMenuDivider.Top],
    },
  ],
};

export const ITEM_CONTEXT_MENU: PeGridMenu = {
  title: 'grid.context_menu.title',
  items: [
    {
      label: 'grid.context_menu.edit',
      value: PeGridContextMenuActionsEnum.Edit,
    },
    {
      label: 'grid.context_menu.copy',
      value: PeGridContextMenuActionsEnum.Copy,
    },
    {
      label: 'grid.context_menu.paste',
      value: PeGridContextMenuActionsEnum.Paste,
      disabled: true,
    },
    {
      label: 'grid.context_menu.duplicate',
      value: PeGridContextMenuActionsEnum.Duplicate,
    },
    {
      label: 'grid.context_menu.add_folder',
      value: PeGridContextMenuActionsEnum.AddFolder,
      dividers: [PeGridMenuDivider.Top, PeGridMenuDivider.Bottom],
    },
    {
      label: 'grid.context_menu.delete',
      value: PeGridContextMenuActionsEnum.Delete,
    },
  ],
};

export const FOLDERS_SIDENAV_MENU: PeGridMenu = {
  title: 'folders.context_menu.title',
  showCloseButton: false,
  items: [
    {
      label: 'folders.context_menu.add_folder',
      value: PeGridSideNavMenuActionsEnum.NewFolder,
    },
    {
      label: 'folders.context_menu.add_headline',
      value: PeGridSideNavMenuActionsEnum.NewHeadline,
    },
  ],
};

const FILTER_BY_DATE: PeFilterKeyInterface = {
  fieldName: 'updatedAt',
  filterConditions: [
    PeFilterConditions.AfterDate,
    PeFilterConditions.BeforeDate,
    PeFilterConditions.BetweenDates,
  ],
  label: 'social-app.post_editor.date.label',
  type: PeFilterType.Date,
};

const FILTER_BY_POST_TYPE: PeFilterKeyInterface = {
  fieldName: 'type',
  filterConditions: [
    PeFilterConditions.Is,
    PeFilterConditions.IsNot,
  ],
  label: 'social-app.post_editor.post_type.label',
  options: [
    {
      label: 'social-app.post_editor.post_type.media',
      value: PeSocialPostTypesEnum.Media,
    },
    {
      label: 'social-app.post_editor.post_type.product',
      value: PeSocialPostTypesEnum.Product,
    },
  ],
  type: PeFilterType.Option,
};

const FILTER_BY_POST_STATUS: PeFilterKeyInterface = {
  fieldName: 'status',
  filterConditions: [
    PeFilterConditions.Is,
    PeFilterConditions.IsNot,
  ],
  label: 'social-app.badges.status',
  options: [
    {
      label: 'social-app.badges.draft',
      value: PeSocialPostStatusesEnum.Draft,
    },
    {
      label: 'social-app.badges.postnow',
      value: PeSocialPostStatusesEnum.PostNow,
    },
    {
      label: 'social-app.badges.schedule',
      value: PeSocialPostStatusesEnum.Schedule,
    },
  ],
  type: PeFilterType.Option,
};

const FILTER_BY_POST_CONTENT: PeFilterKeyInterface = {
  // ':' will be replaced with '.'
  fieldName: 'content:raw',
  filterConditions: [
    PeFilterConditions.Contains,
    PeFilterConditions.DoesNotContain,
  ],
  label: 'social-app.post_editor.content.label',
  type: PeFilterType.String,
};

const TOOLBAR_FILTERS = [
  FILTER_BY_DATE,
  FILTER_BY_POST_TYPE,
  FILTER_BY_POST_STATUS,
  FILTER_BY_POST_CONTENT,
];

const TOOLBAR_OPTIONS: PeGridMenu = {
  title: 'grid.toolbar.items_options_menu.title',
  items: [
    {
      label: 'grid.toolbar.items_options_menu.select_all',
      value: PeGridOptionsMenuActionsEnum.SelectAll,
      defaultIcon: PeDataToolbarOptionIcon.SelectAll,
    },
    {
      label: 'grid.toolbar.items_options_menu.deselect_all',
      value: PeGridOptionsMenuActionsEnum.DeselectAll,
      defaultIcon: PeDataToolbarOptionIcon.DeselectAll,
    },
    {
      label: 'grid.toolbar.items_options_menu.delete',
      value: PeGridOptionsMenuActionsEnum.Delete,
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
        orderBy: PeGridSortingOrderByEnum.Content,
      },
    },
    {
      defaultIcon: PeDataGridSortByActionIcon.Descending,
      label: 'grid.toolbar.sort_menu.z_a',
      value: {
        direction: PeGridSortingDirectionEnum.Descending,
        orderBy: PeGridSortingOrderByEnum.Content,
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
    {
      defaultIcon: PeDataGridSortByActionIcon.Ascending,
      label: 'grid.toolbar.sort_menu.oldest',
      value: {
        direction: PeGridSortingDirectionEnum.Ascending,
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
  },
  {
    name: 'type',
    title: 'social-app.post_editor.post_type.label',
  },
  {
    name: 'condition',
    title: 'grid.table_displayed_columns.condition',
  },
  {
    name: 'action',
    title: 'grid.table_displayed_columns.action',
    cellComponent: PeGridTableActionCellComponent,
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
      value: PeGridView.List,
      defaultIcon: PeDataGridLayoutByActionIcon.GridLayout,
    },
  ],
};
