import { InjectionToken } from '@angular/core';

import { PebElementType, PebPageType } from '@pe/builder-core';
import { FolderItem } from '@pe/folders';
import { PeDataGridLayoutByActionIcon, PeGridMenu, PeGridView } from '@pe/grid';

export enum InvoiceEditorSidebarTypes {
  Navigator = 'navigator',
  Inspector = 'inspector',
  Layers = 'layers',
  EditMasterPages = 'edit-master-pages'
}

export interface ViewItem {
  title: string;
  disabled: boolean;
  active: boolean;
  image?: string;
  option?: InvoiceEditorSidebarTypes| 'preview' | string;
  options?: ViewItem[];
  payload?: any;
  lineAfter?: boolean;
}

export const PEB_INVOICE_HOST = new InjectionToken<string>('PEB_INVOICE_HOST');
export const PEB_INVOICE_API_PATH = new InjectionToken<string>('PEB_INVOICE_API_PATH');
export const PEB_INVOICE_API_COMMON_PATH = new InjectionToken<string>('PEB_INVOICE_API_COMMON_PATH');
export const PEB_INVOICE_BUILDER_API_PATH = new InjectionToken<string>('PEB_INVOICE_BUILDER_API_PATH');
export const PE_CONTACTS_HOST: InjectionToken<string> = new InjectionToken<string>('PE_CONTACTS_HOST');
export const BUILDER_MEDIA_API_PATH: InjectionToken<string> = new InjectionToken<string>('BUILDER_MEDIA_API_PATH');

export const PE_INVOICE_CONTAINER = 'invoice';

export enum InvoiceEnum {
  all = 'all',
  draft = 'DRAFT',
  sent = 'SENT',
  recieved = 'RECIEVED',
}

export enum FiltersEnum {
  today = 'today',
  lastWeek = 'last_week',
  lastMonth = 'last_month',
}
export const invoiceOptions: Array<TranslatedListOptionInterface<InvoiceEnum>> = [
  { labelKey: 'invoice-app.common.invoice.all', value: InvoiceEnum.all, image: 'all_filter' },
];

export const filterOptions: Array<TranslatedListOptionInterface<FiltersEnum>> = [
  { labelKey: 'invoice-app.common.invoice.today', value: FiltersEnum.today, image: 'calendar' },
  { labelKey: 'invoice-app.common.invoice.last_week', value: FiltersEnum.lastWeek, image: 'calendar' },
  { labelKey: 'invoice-app.common.invoice.last_month', value: FiltersEnum.lastMonth, image: 'calendar' },
];

export interface ListOptionInterface<T = string> {
  label: string;
  image: string;
  value: T;
}

export interface TranslatedListOptionInterface<T = string> extends Omit<ListOptionInterface<T>, 'label'> {
  labelKey: string;
}

export interface InvoiceTreeDataInterface {
  isFolder: boolean;
  category: InvoiceEnum;
}

export const INSERT_OPTION: ViewItem[] = [
  {
    title: 'Rectangle',
    disabled: false,
    active: false,
    option: 'createElement',
    payload: {
      data: {
        variant: '',
      },
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
      },
      type: PebElementType.Shape,
    },
  },
  {
    title: 'Rounded rectangle',
    disabled: false,
    active: false,
    option: 'createElement',
    payload: {
      data: {
        variant: '',
      },
      style: {
        borderRadius: 20,
        position: 'absolute',
        top: 0,
        left: 0,
      },
      type: PebElementType.Shape,
    },
  },
  {
    title: 'Line',
    disabled: false,
    active: false,
    option: 'createElement',
    payload: {
      data: {
        variant: '',
      },
      style: {
        height: 1,
        position: 'absolute',
        top: 0,
        left: 0,
      },
      type: PebElementType.Shape,
    },
  },
  {
    title: 'Circle',
    disabled: false,
    active: false,
    option: 'createElement',
    payload: {
      data: {
        variant: '',
      },
      style: {
        borderRadius: 50,
        position: 'absolute',
        top: 0,
        left: 0,
      },
      type: PebElementType.Shape,
    },
    lineAfter: true,
  },
  {
    title: 'Components',
    disabled: false,
    active: false,
    option: 'openShapesDialog',
    lineAfter: true,
  },
  {
    title: 'Add new page',
    disabled: false,
    active: false,
    option: 'createPage',
    payload: { type: PebPageType.Replica },
  },
];

export const EDIT_OPTION: ViewItem[] = [
  {
    title: 'Choose language',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/language.svg',
    option: 'openLanguagesDialog',
  },
  {
    title: 'Edit language',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/manage-languages.png',
    option: 'toggleLanguagesSidebar',
  },
  {
    title: 'SEO',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/seo.svg',
    option: 'toggleSeoSidebar',
  },
  {
    title: 'Scripts',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/scripts.svg',
    option: 'openScriptsDialog',
  },
];

export const INVOICE_NAVIGATION: FolderItem<{link: string}>[] = [
    {
      _id: '0',
      position: 0,
      name: 'Invoices',
      imageIcon: '#icon-apps-app-file',
      isProtected: true,
      data: {
        link: 'list',
      },
    },    {
      _id: '1',
      position: 1,
      name: 'Edit',
      imageIcon: '#icon-apps-app-edit',
      isProtected: true,
      data: {
        link: 'edit',
      },
    },
    {
      _id: '2',
      position: 2,
      name: 'Themes',
      imageIcon: '#icon-apps-app-themes',
      isProtected: true,
      data: {
        link: 'themes',
      },
    },
    {
      _id: '3',
      position: 3,
      name: 'Settings',
      imageIcon: '#icon-apps-app-settings',
      isProtected: true,
      data: {
        link: 'settings',
      },
    },
  ];

  export const OPTIONS: ViewItem[] = [
    {
      title: 'Navigator',
      disabled: false,
      active: false,
      image: 'navigator',
      option: InvoiceEditorSidebarTypes.Navigator,
    },
    {
      title: 'Inspector',
      disabled: false,
      active: false,
      image: 'inspector',
      option: InvoiceEditorSidebarTypes.Inspector,
    },
    {
      title: 'Master pages',
      disabled: false,
      active: false,
      image: 'master-pages',
      option: InvoiceEditorSidebarTypes.EditMasterPages,
    },
    {
      title: 'Layer List',
      disabled: false,
      active: false,
      image: 'layer-list',
      option: InvoiceEditorSidebarTypes.Layers,
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
        minItemWidth: 200,
        maxColumns: 5,
      },
    ],
  };
