export enum ProductsFolderAction {
  Add = 'add',
  Delete = 'delete',
  Update = 'update'
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

