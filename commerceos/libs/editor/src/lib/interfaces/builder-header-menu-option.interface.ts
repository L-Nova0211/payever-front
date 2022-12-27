import { EditorSidebarTypes } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';

export interface PeBuilderHeaderMenuOptionInterface {
  title: string;
  disabled: boolean;
  active: boolean;
  image?: string;
  option?: EditorSidebarTypes | ShopEditorSidebarTypes | 'preview' | string;
  options?: PeBuilderHeaderMenuOptionInterface[];
  payload?: any;
  lineAfter?: boolean;
}
