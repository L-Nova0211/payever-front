import { InjectionToken } from '@angular/core';

import { PebElementType, PebPageType } from '@pe/builder-core';
import { EditorSidebarTypes } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { FolderItem } from '@pe/folders';

import { ViewItem } from './shop.interface'

export const PEB_SHOP_HOST = new InjectionToken<string>('PEB_SHOP_HOST');

export const PE_SHOP_CONTAINER = 'shop';

export const SHOP_NAVIGATION: FolderItem<{link: string}>[] = [
  {
    _id: '0',
    position: 0,
    name: ' ',
    isAvatar: true,
    isProtected: true,
    data: {
      link: 'dashboard',
    },
  },
  {
    _id: '1',
    position: 1,
    name: 'shop-app.actions.edit',
    image: '/assets/shop/icons/edit.png',
    isProtected: true,
    data: {
      link: 'edit',
    },
  },
  {
    _id: '2',
    position: 2,
    name: 'shop-app.settings.title',
    image: '/assets/shop/icons/settings.png',
    isProtected: true,
    data: {
      link: 'settings',
    },
  },
  {
    _id: '3',
    position: 3,
    name: 'shop-app.themes.title',
    image: '/assets/shop/icons/theme.png',
    isProtected: true,
    data: {
      link: 'themes',
    },
  },
];


export const OPTION = { ...EditorSidebarTypes, ...ShopEditorSidebarTypes };

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
        height: 6,
        width: 182,
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
    // lineAfter: true,
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

export const OPTIONS: ViewItem[] = [
  {
    title: 'Navigator',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/navigator.png',
    option: EditorSidebarTypes.Navigator,
  },
  {
    title: 'Inspector',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/inspector.png',
    option: EditorSidebarTypes.Inspector,
  },
  {
    title: 'Master pages',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/master-pages.png',
    option: ShopEditorSidebarTypes.EditMasterPages,
  },
  {
    title: 'Layer List',
    disabled: false,
    active: false,
    image: '/assets/shop/icons/layer-list.png',
    option: EditorSidebarTypes.Layers,
  },
  // {
  //   title: 'Language',
  //   disabled: false,
  //   active: false,
  //   image: '/assets/icons/language.png',
  //   option: 'language',
  //   options: [
  //     ...Object.values(PebLanguage).map(lang => ({
  //       title: toTitleCase(lang),
  //       disabled: false,
  //       active: false,
  //       image: `/assets/shop/icons/language-${lang}.png`,
  //       option: `language.${lang}`,
  //     })),
  //     {
  //       title: 'Manage languages',
  //       disabled: false,
  //       active: false,
  //       image: '/assets/shop/icons/manage-languages.png',
  //       option: 'toggleLanguagesSidebar',
  //     },
  //   ],
  // },
  // {
  //   title: 'History',
  //   disabled: false,
  //   active: false,
  //   image:'/assets/shop/icons/history.png',
  //   option: EditorSidebarTypes.History,
  // },
  // {
  //   title: 'Preview',
  //   disabled: false,
  //   active: false,
  //   image:'/assets/shop/icons/preview.png',
  //   option: 'preview',
  // },
];

export const closeConfirmationQueryParam = 'closeDialog';
