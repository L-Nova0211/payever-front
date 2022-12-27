import {
  PeDataGridLayoutByActionIcon,
  PeGridMenu,
  PeGridView,
} from '@pe/grid';

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
