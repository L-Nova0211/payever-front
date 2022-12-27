import { InjectionToken } from '@angular/core';

import { EditorSidebarTypes } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';

export const PEB_POS_HOST = new InjectionToken<string>('PEB_POS_HOST');
export const PEB_POS_API_PATH = new InjectionToken<string>('PEB_POS_API_PATH');
export const PEB_POS_API_BUILDER_PATH = new InjectionToken('PEB_POS_API_BUILDER_PATH');
export const PEB_CONNECT_API_PATH = new InjectionToken('PEB_CONNECT_API_PATH');


export const OPTION = { ...EditorSidebarTypes, ...ShopEditorSidebarTypes };
