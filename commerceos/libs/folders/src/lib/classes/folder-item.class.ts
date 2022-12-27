import { PeFoldersContextMenuEnum } from '../enums/folders.enum';
import { FolderItem } from '../interfaces/folder.interface';

export class FolderItemFlatNode {
  _id: string;
  name: string;
  level: number;
  position: number;
  image?: string;
  imageIcon?: string;
  isAvatar?: boolean;
  abbrText?: string;
  isHeadline?: boolean;
  isExpanded?: boolean;
  description?: string;
  parentIsHeadline?: boolean;
  parentFolderId?: string;
  children?: FolderItem[];
  expandable?: boolean;
  editing?: boolean;
  isProtected?: boolean;
  isHideMenu?: boolean;
  menuItems?: PeFoldersContextMenuEnum[];
}
