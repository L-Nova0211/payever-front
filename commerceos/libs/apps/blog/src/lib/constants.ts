import { InjectionToken } from '@angular/core';

import { PebElementType, PebPageType } from '@pe/builder-core';
import { EditorSidebarTypes } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { FolderItem } from '@pe/folders';

import { ViewItem } from './blog.interface'

export const PE_BLOG_CONTAINER = 'blog';

export const PEB_BLOG_HOST = new InjectionToken<string>('PEB_BLOG_HOST');

export const BLOG_NAVIGATION: FolderItem<{link: string}>[] = [
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
    name: 'blog-app.actions.edit',
    image: '/assets/icons/sidebar-edit.svg',
    isProtected: true,
    data: {
      link: 'edit',
    },
  },
  {
    _id: '2',
    position: 2,
    name: 'blog-app.settings.title',
    image: '/assets/icons/settings.svg',
    isProtected: true,
    data: {
      link: 'settings',
    },
  },
  {
    _id: '3',
    position: 3,
    name: 'blog-app.themes.title',
    image: '/assets/icons/sidebar-themes.svg',
    isProtected: true,
    data: {
      link: 'themes',
    },
  },
];

export const OPTION = { ...EditorSidebarTypes, ...ShopEditorSidebarTypes };

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

export const INSERT_OPTION: ViewItem[] = [
  {
    title: 'Rectangle',
    disabled: false,
    active: false,
    option: 'createElement',
    payload: {
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
  },
];

export const OPTIONS: ViewItem[] = [
  {
    title: 'Navigator',
    disabled: false,
    active: false,
    image: 'sidebar-navigator',
    option: EditorSidebarTypes.Navigator,
  },
  {
    title: 'Inspector',
    disabled: false,
    active: false,
    image: 'inspector',
    option: EditorSidebarTypes.Inspector,
  },
  {
    title: 'Master pages',
    disabled: false,
    active: false,
    image: 'master-pages',
    option: ShopEditorSidebarTypes.EditMasterPages,
  },
  {
    title: 'Layer List',
    disabled: false,
    active: false,
    image: 'layer-list',
    option: EditorSidebarTypes.Layers,
  },
];
export const closeConfirmationQueryParam = 'closeDialog';
