import { OverlayDataValue } from '@pe/builder-base-plugins';

export enum ShopEditorSidebarTypes {
  EditMasterPages = 'edit-master-pages',
}

export type OverlayShopDataValue = OverlayDataValue | ShopEditorSidebarTypes;
