import { PeGridItemType } from '@pe/common';

import { PeFoldersContextMenuEnum } from '../enums/folders.enum';

export interface FolderItem<T = any> {
  name: string;
  position: number;
  isHeadline?: boolean;
  _id?: string;
  data?: T;
  description?: string;
  children?: FolderItem[];
  headlineId?: string;
  parentFolderId?: string;
  image?: string;
  imageIcon?: string; // example #icon-settings-business-info
  isProtected?: boolean;
  isAvatar?: boolean; // border radius 50%
  abbrText?: string;
  isHideMenu?: boolean;
  isExpanded?: boolean;
  menuItems?: PeFoldersContextMenuEnum[];
  editing?: boolean;
}
export interface FolderApply {
  _id: string;
  name?: string;
  image?: string;
  parentFolderId?: string;
  abbrText?: string;
}

export interface RootFolderItem {
  name: string;
  _id?: string;
  image?: string;
}

export interface MoveIntoFolderEvent {
  folder: FolderItem;
  moveItems: PeMoveToFolderItem[];
}

export interface MoveIntoRootFolderEvent {
  folder: RootFolderItem;
  moveItems: PeMoveToFolderItem[];
}
export interface FolderOutputEvent {
  data: FolderItem;
  apply?: (folder: FolderApply | null) => void;
}

export interface FolderPosition {
  _id: string;
  position: number;
  parentFolderId: string;
}

export enum DragAreaTypes {
  Above = 'above',
  Below = 'below',
  Center = 'center'
}

export enum PreviewType {
  ImageSrc = 'image',
  HTMLElement = 'element'
}

export interface PeMoveToFolderItem {
  id: string;
  type: PeGridItemType,
  [key:string]: any;
}
