import { FolderItem } from '@pe/folders';

export const CHECKOUT_NAVIGATION: FolderItem<{ link: string }>[] = [
  {
    _id: '0',
    position: 0,
    isAvatar: true,
    name: ' ',
    isProtected: true,
    data: {
      link: 'panel-checkout',
    },
  },
  {
    _id: '1',
    position: 1,
    imageIcon: '#icon-payments-block-16',
    name: 'info_boxes.panels.paymentOptions',
    isProtected: true,
    data: {
      link: 'panel-payments',
    },
  },
  {
    _id: '2',
    position: 2,
    imageIcon: '#icon-channels-block-16',
    name: 'info_boxes.panels.channels',
    isProtected: true,
    data: {
      link: 'panel-channels',
    },
  },
  {
    _id: '3',
    position: 3,
    imageIcon: '#icon-connect-block-16',
    name: 'info_boxes.panels.connect',
    isProtected: true,
    data: {
      link: 'panel-connect',
    },
  },
  {
    _id: '4',
    position: 4,
    imageIcon: '#icon-settings-block-16',
    name: 'info_boxes.panels.settings',
    isProtected: true,
    data: {
      link: 'panel-settings',
    },
  },
  {
    _id: '5',
    position: 5,
    imageIcon: '#icon-edit-block-16',
    name: 'actions.edit',
    isProtected: true,
    data: {
      link: 'panel-edit',
    },
  },
];
