import { PeDataGridSortByActionIcon } from '@pe/common';
import {
  GridTitleImageStyle,
  PeDataGridLayoutByActionIcon,
  PeFilterConditions,
  PeFilterType,
  PeGridTableBadgeCellComponent,
  PeGridTableMoreCellComponent,
  PeGridTableTextInfoCellComponent,
  PeGridTableTitleCellComponent,
  PeGridView,
} from '@pe/grid';

import { FolderEnum } from '../enums/app-acl-form-option.enum';
import { GridSortingFieldsEnum } from '../enums/grid-sorting-fields.enum';
import { EmployeesToolbarIcons, OptionsMenu } from '../enums/navbar-filter-keys.enum';

export const DISPLAYED_COLUMNS = [
  {
    name: 'name',
    title: 'pages.employees.datagrid.common.sort_actions.name',
    cellComponent: PeGridTableTitleCellComponent,
    data: {
      titleImageStyle: GridTitleImageStyle.Circle,
    },
  },
  {
    name: 'position',
    title: 'pages.employees.datagrid.common.sort_actions.positions',
    cellComponent: PeGridTableTextInfoCellComponent,
  },
  {
    name: 'mail',
    title: 'pages.employees.datagrid.common.sort_actions.email',
    cellComponent: PeGridTableTextInfoCellComponent,
  },
  {
    name: 'badge',
    title: 'pages.employees.datagrid.common.sort_actions.status',
    cellComponent: PeGridTableBadgeCellComponent,
  },
  {
    name: 'action',
    title: '',
    cellComponent: PeGridTableMoreCellComponent,
  },
];

export const SIDENAV_MENU = {
  title: 'pages.employees.datagrid.sidebar.menu_title',
  showCloseButton: false,
  items: [
    {
      label: 'pages.employees.datagrid.sidebar.new_group',
      value: FolderEnum.NewGroup,
    },
  ],
};

export const TOOLBAR_CONFIG = {
  filterConfig: [
    {
      fieldName: 'name',
      filterConditions: [PeFilterConditions.Contains, PeFilterConditions.DoesNotContain],
      label: 'pages.employees.datagrid.common.sort_actions.name',
      type: PeFilterType.String,
    },
  ],
  optionsMenu: {
    title: 'pages.employees.datagrid.common.choose_action',
    items: [
      {
        label: 'pages.employees.datagrid.common.select_all',
        value: OptionsMenu.SelectAll,
        defaultIcon: EmployeesToolbarIcons.SelectAll,
      },
      {
        label: 'pages.employees.datagrid.common.unselect',
        value: OptionsMenu.DeselectAll,
        defaultIcon: EmployeesToolbarIcons.DeselectAll,
      },
      {
        label: 'pages.employees.datagrid.common.delete_employees',
        value: OptionsMenu.Delete,
        defaultIcon: EmployeesToolbarIcons.Delete,
      },
      {
        label: 'pages.employees.datagrid.common.resend',
        value: OptionsMenu.Resend,
        defaultIcon: EmployeesToolbarIcons.Resend,
      },
      {
        label: 'pages.employees.datagrid.common.delete_employees_group',
        value: OptionsMenu.DeleteFromGroup,
        defaultIcon: EmployeesToolbarIcons.Delete,
      },
    ],
  },
  sortMenu: {
    title: 'pages.employees.datagrid.common.sort_actions.sort_by',
    activeValue: 'desc',
    items: [
      {
        label: 'pages.employees.datagrid.common.sort_actions.name',
        value: GridSortingFieldsEnum.Name,
        defaultIcon: PeDataGridSortByActionIcon.Name,
      },
      {
        label: 'pages.employees.datagrid.common.sort_actions.positions',
        value: GridSortingFieldsEnum.Position,
        defaultIcon: PeDataGridSortByActionIcon.Ascending,
      },
      {
        label: 'pages.employees.datagrid.common.sort_actions.email',
        value: GridSortingFieldsEnum.Email,
        defaultIcon: PeDataGridSortByActionIcon.Descending,
      },
      {
        label: 'pages.employees.datagrid.common.sort_actions.status',
        value: GridSortingFieldsEnum.Status,
        defaultIcon: PeDataGridSortByActionIcon.Date,
      },
    ],
  },
};

export const VIEW_MENU = {
  title: 'grid.content.toolbar.layout',
  items: [
    {
      label: 'grid.content.toolbar.list',
      value: PeGridView.Table, defaultIcon: PeDataGridLayoutByActionIcon.ListLayout,
    },
    {
      label: 'grid.content.toolbar.grid',
      value: PeGridView.List, defaultIcon: PeDataGridLayoutByActionIcon.GridLayout,
    },
  ],
};
