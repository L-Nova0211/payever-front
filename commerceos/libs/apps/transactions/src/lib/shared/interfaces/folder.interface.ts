import { PeCouponMoveToFolderToEnum } from '../enums/folder.enum';

export interface PeFolderType {
  moveToFolder?: PeCouponMoveToFolderToEnum;
  getFolders?: string[] | PeFolder[];
}

export class PeFolder {

  name: string;
  position: number;
  _id?: string;
  image?: string;
  parentFolderId?: string;
  isProtected?: boolean;
  isHeadline?: boolean;
  headline?: string;
  id?: string;
  children?: PeFolder[];

  constructor() {
    this.id = this._id;
  }

}

