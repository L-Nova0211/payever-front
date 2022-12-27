import { PeDataGridSortByActionIcon } from '@pe/common';
import {
  PeDataToolbarOptionIcon,
  PeFilterConditions,
  PeFilterKeyInterface,
  PeFilterType,
  PeGridContextMenuActionsEnum,
  PeGridMenu,
  PeGridOptionsMenuActionsEnum,
  PeGridSortingDirectionEnum,
  PeGridSortingOrderByEnum,
  PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns,
  PeGridTableTitleCellComponent,
} from '@pe/grid';

import { PeAppointmentsTypesEnum } from '../../enums';

export const VIEWPORT_CONTEXT_MENU: PeGridMenu = {
  title: 'grid.context_menu.title',
  items: [
    {
      label: 'grid.context_menu.paste',
      value: PeGridContextMenuActionsEnum.Paste,
      disabled: true,
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
      label: 'grid.context_menu.delete',
      value: PeGridContextMenuActionsEnum.Delete,
    },
  ],
};

export const AVAILABILITY_ITEM_CONTEXT_MENU: PeGridMenu = {
  title: 'grid.context_menu.title',
  items: [
    {
      label: 'grid.context_menu.edit',
      value: PeGridContextMenuActionsEnum.Edit,
    },
    {
      label: 'grid.context_menu.duplicate',
      value: PeGridContextMenuActionsEnum.Duplicate,
    },
    {
      label: 'grid.context_menu.delete',
      value: PeGridContextMenuActionsEnum.Delete,
    },
  ],
};

const FILTER_BY_NAME: PeFilterKeyInterface = {
  fieldName: 'name',
  filterConditions: [
    PeFilterConditions.Contains,
    PeFilterConditions.DoesNotContain,
  ],
  label: 'appointments-app.type_editor.name.label',
  type: PeFilterType.String,
};

const FILTER_BY_TYPE: PeFilterKeyInterface = {
  fieldName: 'type',
  filterConditions: [
    PeFilterConditions.Is,
    PeFilterConditions.IsNot,
  ],
  label: 'appointments-app.type_editor.type.label',
  options: [
    {
      label: 'appointments-app.type_editor.type.one_on_one',
      value: PeAppointmentsTypesEnum.OneOnOne,
    },
    {
      label: 'appointments-app.type_editor.type.group',
      value: PeAppointmentsTypesEnum.Group,
    },
  ],
  type: PeFilterType.Option,
};

const TOOLBAR_FILTERS: PeFilterKeyInterface[] = [
  FILTER_BY_NAME,
  FILTER_BY_TYPE,
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
        orderBy: PeGridSortingOrderByEnum.Name,
      },
    },
    {
      defaultIcon: PeDataGridSortByActionIcon.Descending,
      label: 'grid.toolbar.sort_menu.z_a',
      value: {
        direction: PeGridSortingDirectionEnum.Descending,
        orderBy: PeGridSortingOrderByEnum.Name,
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
    title: 'appointments-app.grid_table_columns.type',
  },
  {
    name: 'duration',
    title: 'appointments-app.grid_table_columns.duration',
  },
  {
    name: 'action',
    title: 'grid.table_displayed_columns.action',
    cellComponent: PeGridTableActionCellComponent,
  },
];
