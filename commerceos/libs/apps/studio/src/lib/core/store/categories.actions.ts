import { TreeFilterNode } from '@pe/common';

import { PeAttribute, PeStudioAlbum, PeStudioCategory } from '../interfaces';

export class LoadCategories {
  static readonly type = '[Attributes/API] Load Categories';
  constructor(public attributes: PeAttribute[], public albums: PeStudioAlbum[]) {}
}
export class CreateCategory {
  static readonly type = '[Attributes/API] Create Category';
  constructor(public businessId: string, public attribute: PeAttribute) {}
}
export class UpdateCategory {
  static readonly type = '[Attributes/API] Update Category';
  constructor(public businessId: string, public attribute: PeAttribute) {}
}
export class EditingUpdateCategory {
  static readonly type = '[Attributes/API] Set Editing Category';
  constructor(public category: PeStudioCategory) {}
}
export class ActiveUpdateCategory {
  static readonly type = '[Attributes/API] Set Active Category';
  constructor(public category: PeStudioCategory) {}
}
export class SetTreeCategory {
  static readonly type = '[Attributes/API] Set Tree Category';
  constructor(public category: PeStudioCategory) {}
}
export class UpdateTreeCategory {
  static readonly type = '[Attributes/API] Update Tree Category';
  constructor(public category: PeStudioCategory, public node: TreeFilterNode, public payload: PeStudioAlbum) {}
}
export class Update2TreeCategory {
  static readonly type = '[Attributes/API] Update2 Tree Category';
  constructor(public category: any, public node: TreeFilterNode, public payload: PeStudioAlbum) {}
}
export class PatchTreeCategory {
  static readonly type = '[Attributes/API] Patch Node Tree Category';
  constructor(public category: any, public node: TreeFilterNode) {}
}
export class UpdateDeleteAlbumCategory {
  static readonly type = '[Attributes/API] Remove Album Tree Category';
  constructor(public category: PeStudioCategory, public node: TreeFilterNode, public payload: PeStudioAlbum) {}
}
export class DeleteActiveCategory {
  static readonly type = '[Attributes/API] Delete Active Category';
  constructor(public businessId: string, public payload: PeStudioCategory) {}
}
