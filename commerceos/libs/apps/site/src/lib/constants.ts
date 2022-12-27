import { InjectionToken } from '@angular/core';

import { PebElementType, PebPageType } from '@pe/builder-core';
import { EditorSidebarTypes } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { FolderItem } from '@pe/folders';

import { ViewItem } from './site.interface';

export const PEB_SITE_HOST = new InjectionToken<string>('PEB_SITE_HOST');
export const PEB_SITE_API_PATH = new InjectionToken<string>('SITE_API_PATH');
export const PEB_SITE_API_BUILDER_PATH = new InjectionToken<string>('SITE_API_BUILDER_PATH');

export const PE_SITE_CONTAINER = 'site';

export const DOMAIN_REGX = '^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,7}$';
export const PAYEVER_DOMAIN_REGX = '[a-zA-Z0-9-]{3,61}';

export enum DomainProvider {
  DEFAULT = 'payever'
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

export const SITE_NAVIGATION: FolderItem<{link: string}>[] = [
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
    name: 'site-app.actions.edit',
    image: '/assets/icons/edit.png',
    isProtected: true,
    data: {
      link: 'edit',
    },
  },
  {
    _id: '2',
    position: 2,
    name: 'site-app.settings.title',
    image: '/assets/icons/settings.png',
    isProtected: true,
    data: {
      link: 'settings',
    },
  },
  {
    _id: '3',
    position: 3,
    name: 'site-app.themes.title',
    image: '/assets/icons/theme.png',
    isProtected: true,
    data: {
      link: 'themes',
    },
  },
]

export const OPTION = { ...EditorSidebarTypes, ...ShopEditorSidebarTypes };

export const OPTIONS: ViewItem[] = [
  {
    title: 'site-app.view_options.navigator',
    disabled: false,
    active: false,
    image: '/assets/icons/navigator.png',
    option: EditorSidebarTypes.Navigator,
  },
  {
    title: 'site-app.view_options.inspector',
    disabled: false,
    active: false,
    image: '/assets/icons/inspector.png',
    option: EditorSidebarTypes.Inspector,
  },
  {
    title: 'site-app.view_options.master_pages',
    disabled: false,
    active: false,
    image: '/assets/icons/master-pages.png',
    option: ShopEditorSidebarTypes.EditMasterPages,
  },
  {
    title: 'site-app.view_options.layer_list',
    disabled: false,
    active: false,
    image: '/assets/icons/layer-list.png',
    option: EditorSidebarTypes.Layers,
  },
  // {
  //   title: 'site-app.view_options.history',
  //   disabled: false,
  //   active: false,
  //   image:'/assets/icons/history.png',
  //   option: EditorSidebarTypes.History,
  // },

  {
    title: 'site-app.view_options.preview',
    disabled: false,
    active: false,
    image:'/assets/icons/preview.png',
    option: 'preview',
  },

];
