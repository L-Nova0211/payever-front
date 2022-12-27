import { TreeFilterNode } from '@pe/common';

import { PeCreateAlbumBody, PeStudioAlbum, PeStudioCategory } from '../interfaces';

export class InitLoadAlbums {
  static readonly type = '[Albums/API] Init Load Albums';
  constructor(public businessId: string) {}
}

export class LoadAlbums {
  static readonly type = '[Albums/API] Load Albums';
  constructor(public albums: PeStudioAlbum[]) {}
}

export class CreateAlbum {
  static readonly type = '[Albums/API] Create Album';
  constructor(
    public businessId: string,
    public payload: PeCreateAlbumBody,
    public node: TreeFilterNode,
    public category: PeStudioCategory,
  ) {}
}

export class UpdateAlbum {
  static readonly type = '[Albums/API] Update Album';
  constructor(public businessId: string, public payload: PeCreateAlbumBody, public node: TreeFilterNode) {}
}
export class EditingUpdateAlbum {
  static readonly type = '[Attributes/API] Set Editing Album';
  constructor(public node: TreeFilterNode) {}
}
export class CreateCategoryAlbum {
  static readonly type = '[Attributes/API] Add Category Album';
  constructor(
    public businessId: string,
    public payload: PeCreateAlbumBody,
    public node: TreeFilterNode,
    public category: PeStudioCategory,
  ) {}
}
export class DeleteAlbum {
  static readonly type = '[Albums/API] Delete Album';
  constructor(public businessId: string, public albumId: string, public node: TreeFilterNode) {}
}
