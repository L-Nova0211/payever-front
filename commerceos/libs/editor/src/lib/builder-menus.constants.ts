import { PebElementType, PebPageType } from '@pe/builder-core';
import { EditorSidebarTypes } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';

import { PeBuilderHeaderMenuOptionInterface } from './interfaces';

export const EDIT_MENU_OPTION: PeBuilderHeaderMenuOptionInterface[] = [
  {
    title: 'Choose language',
    disabled: false,
    active: false,
    image: '../assets/icons/language.svg',
    option: 'openLanguagesDialog',
  },
  {
    title: 'Edit language',
    disabled: false,
    active: false,
    image: '../assets/icons/manage-languages.svg',
    option: 'toggleLanguagesSidebar',
  },
  {
    title: 'SEO',
    disabled: false,
    active: false,
    image: '../assets/icons/seo.svg',
    option: 'toggleSeoSidebar',
  },
  {
    title: 'Scripts',
    disabled: false,
    active: false,
    image: '../assets/icons/scripts.svg',
    option: 'openScriptsDialog',
  },
];

export const ICONS = {
  'x-button': '../assets/icons/x-button.svg',
};

export const INSERT_MENU_OPTION: PeBuilderHeaderMenuOptionInterface[] = [
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
        borderRadius: 0,
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

export const OPTION = { ...EditorSidebarTypes, ...ShopEditorSidebarTypes };

export const VIEW_MENU_OPTIONS: PeBuilderHeaderMenuOptionInterface[] = [
  {
    title: 'Navigator',
    disabled: false,
    active: false,
    image: 'assets/icons/navigator.png',
    option: EditorSidebarTypes.Navigator,
  },
  {
    title: 'Inspector',
    disabled: false,
    active: false,
    image: 'assets/icons/inspector.png',
    option: EditorSidebarTypes.Inspector,
  },
  {
    title: 'Master pages',
    disabled: false,
    active: false,
    image: 'assets/icons/master-pages.png',
    option: ShopEditorSidebarTypes.EditMasterPages,
  },
  {
    title: 'Layer List',
    disabled: false,
    active: false,
    image: 'assets/icons/layer-list.png',
    option: EditorSidebarTypes.Layers,
  },
  {
    title: 'Preview',
    disabled: false,
    active: false,
    image: 'assets/icons/preview.png',
    option: 'preview',
  },
];
