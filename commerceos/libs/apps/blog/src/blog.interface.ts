
import { EditorSidebarTypes } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';

export interface ViewItem {
  title: string;
  disabled: boolean;
  active: boolean;
  image?: string;
  option?: EditorSidebarTypes | ShopEditorSidebarTypes| 'preview' | string;
  options?: ViewItem[];
  payload?: any;
  lineAfter?: boolean;
}
