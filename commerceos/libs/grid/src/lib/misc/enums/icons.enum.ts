import { PeDataGridSortByActionIcon } from '@pe/common';

export enum PeDataGridLayoutByActionIcon  {
  ListLayout = 'list-layout-icon',
  GridLayout = 'grid-layout-icon'
}

export enum PeDataToolbarOptionIcon  {
  Delete = 'toolbar-delete',
  DeselectAll = 'toolbar-deselect-all',
  Duplicate = 'toolbar-duplicate',
  SelectAll = 'toolbar-select-all'
}

export type PeGridDefaultIcons = PeDataGridSortByActionIcon | PeDataGridLayoutByActionIcon | PeDataToolbarOptionIcon;
