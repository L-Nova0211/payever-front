import { PeDataGridSortByActionIcon } from '@pe/common';
import {
  GridSkeletonColumnType,
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

import { PeCouponTypeEnum } from '../../enums';

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

const FILTER_BY_COUPON_CODE: PeFilterKeyInterface = {
  fieldName: 'code',
  filterConditions: [
    PeFilterConditions.Contains,
    PeFilterConditions.DoesNotContain,
  ],
  label: 'coupons-app.coupon_editor.code.label',
  type: PeFilterType.String,
};

const FILTER_BY_DISCOUNT_TYPE: PeFilterKeyInterface = {
  fieldName: 'type[type]',
  filterConditions: [
    PeFilterConditions.Is,
    PeFilterConditions.IsNot,
  ],
  label: 'coupons-app.coupon_editor.discount_types.label',
  type: PeFilterType.Option,
  options: [
    {
      label: 'coupons-app.coupon_editor.discount_types.percentage',
      value: PeCouponTypeEnum.Percentage,
    },
    {
      label: 'coupons-app.coupon_editor.discount_types.amount',
      value: PeCouponTypeEnum.FixedAmount,
    },
    {
      label: 'coupons-app.coupon_editor.discount_types.shipping',
      value: PeCouponTypeEnum.FreeShipping,
    },
    {
      label: 'coupons-app.coupon_editor.discount_types.buy_x_get_y',
      value: PeCouponTypeEnum.BuyXGetY,
    },
  ],
};

const TOOLBAR_FILTERS: PeFilterKeyInterface[] = [
  FILTER_BY_COUPON_CODE,
  FILTER_BY_DISCOUNT_TYPE,
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
        orderBy: PeGridSortingOrderByEnum.Code,
      },
    },
    {
      defaultIcon: PeDataGridSortByActionIcon.Descending,
      label: 'grid.toolbar.sort_menu.z_a',
      value: {
        direction: PeGridSortingDirectionEnum.Descending,
        orderBy: PeGridSortingOrderByEnum.Code,
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
    skeletonColumnType: GridSkeletonColumnType.ThumbnailWithName,
  },
  {
    name: 'description',
    title: 'grid.table_displayed_columns.description',
  },
  {
    name: 'condition',
    title: 'grid.table_displayed_columns.condition',
  },
  {
    name: 'action',
    title: 'grid.actions.open',
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
