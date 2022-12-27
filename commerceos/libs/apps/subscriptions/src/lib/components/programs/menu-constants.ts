import { PeDataGridSortByActionIcon } from '@pe/common';
import {
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
} from '@pe/grid';

import {
  PeSubscriptionsPlanAppliesToEnum,
  PeSubscriptionsPlanBillingIntervalsEnum,
  PeSubscriptionsPlanEligibilityEnum,
} from '../../enums';

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

const FILTER_BY_PLAN_NAME: PeFilterKeyInterface = {
  fieldName: 'name',
  filterConditions: [
    PeFilterConditions.Contains,
    PeFilterConditions.DoesNotContain,
  ],
  label: 'subscriptions-app.plan_editor.title_field.label',
  type: PeFilterType.String,
};

const FILTER_BY_PLAN_APPLIES_TO: PeFilterKeyInterface = {
  fieldName: 'appliesTo',
  filterConditions: [
    PeFilterConditions.Is,
    PeFilterConditions.IsNot,
  ],
  label: 'subscriptions-app.plan_editor.applies_to.label',
  options: [
    {
      label: 'subscriptions-app.plan_editor.applies_to.all_products',
      value: PeSubscriptionsPlanAppliesToEnum.AllProducts,
    },
    {
      label: 'subscriptions-app.plan_editor.applies_to.specific_products',
      value: PeSubscriptionsPlanAppliesToEnum.SpecificProducts,
    },
    {
      label: 'subscriptions-app.plan_editor.applies_to.specific_categories',
      value: PeSubscriptionsPlanAppliesToEnum.SpecificCategories,
    },
  ],
  type: PeFilterType.Option,
};

const FILTER_BY_PLAN_ELIGIBILITY: PeFilterKeyInterface = {
  fieldName: 'subscribersEligibility',
  filterConditions: [
    PeFilterConditions.Is,
    PeFilterConditions.IsNot,
  ],
  label: 'subscriptions-app.plan_editor.eligibility.label',
  options: [
    {
      label: 'subscriptions-app.plan_editor.eligibility.all_subscribers',
      value: PeSubscriptionsPlanEligibilityEnum.Everyone,
    },
    {
      label: 'subscriptions-app.plan_editor.eligibility.specific_subscribers',
      value: PeSubscriptionsPlanEligibilityEnum.SpecificSubscribers,
    },
    {
      label: 'subscriptions-app.plan_editor.eligibility.specific_groups_of_subscribers',
      value: PeSubscriptionsPlanEligibilityEnum.SpecificGroupsOfSubscribers,
    },
  ],
  type: PeFilterType.Option,
};

const FILTER_BY_PLAN_BILLING_INTERVAL: PeFilterKeyInterface = {
  fieldName: 'interval',
  filterConditions: [
    PeFilterConditions.Is,
    PeFilterConditions.IsNot,
  ],
  label: 'subscriptions-app.plan_editor.billing.label',
  options: [
    {
      label: 'subscriptions-app.plan_editor.billing.periods.every_day',
      value: PeSubscriptionsPlanBillingIntervalsEnum.Day,
    },
    {
      label: 'subscriptions-app.plan_editor.billing.periods.every_week',
      value: PeSubscriptionsPlanBillingIntervalsEnum.Week,
    },
    {
      label: 'subscriptions-app.plan_editor.billing.periods.every_month',
      value: PeSubscriptionsPlanBillingIntervalsEnum.Month,
    },
    {
      label: 'subscriptions-app.plan_editor.billing.periods.every_year',
      value: PeSubscriptionsPlanBillingIntervalsEnum.Year,
    },
  ],
  type: PeFilterType.Option,
};

const TOOLBAR_FILTERS: PeFilterKeyInterface[] = [
  FILTER_BY_PLAN_NAME,
  FILTER_BY_PLAN_APPLIES_TO,
  FILTER_BY_PLAN_ELIGIBILITY,
  FILTER_BY_PLAN_BILLING_INTERVAL,
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
    name: 'plan_rate',
    title: 'subscriptions-app.grid_table_columns.plan_rate',
  },
  {
    name: 'total_subscribers',
    title: 'subscriptions-app.grid_table_columns.total_subscribers',
  },
  {
    name: 'action',
    title: 'grid.table_displayed_columns.action',
    cellComponent: PeGridTableActionCellComponent,
  },
];
