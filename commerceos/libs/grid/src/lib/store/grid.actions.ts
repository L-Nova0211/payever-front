import { FolderItem, FolderPosition } from '@pe/folders';

import { PeGridItem } from '../misc/interfaces';

export const DEFAULT_NAME = 'default';

export namespace PeFoldersActions {
  export class Create {
    static readonly type = '[@pe/grid] CreateFolder';
    constructor(
      public newFolder: FolderItem,
      public currentFolderId: string,
      public appName = DEFAULT_NAME,
    ) { }
  }

  export class Delete {
    static readonly type = '[@pe/grid] DeleteFolders';
    constructor(
      public folderToDelete: FolderItem,
      public appName = DEFAULT_NAME,
    ) { }
  }

  export class Update {
    static readonly type = '[@pe/grid] UpdateFolders';
    constructor(
      public folderToUpdate: FolderItem,
      public currentFolderId: string,
      public appName = DEFAULT_NAME,
    ) { }
  }

  export class UpdatePositions {
    static readonly type = '[@pe/grid] UpdatePositions';
    constructor(
      public positions: FolderPosition[],
      public currentFolderId: string,
      public appName = DEFAULT_NAME,
    ) { }
  }

  export class InitFoldersTree {
    static readonly type = '[@pe/grid] InitFoldersTree';
    constructor(
      public tree: FolderItem[],
      public currentFolderId: string,
      public appName = DEFAULT_NAME,
    ) { }
  }
}

export namespace PeGridItemsActions {
  export class AddItem {
    static readonly type = '[@pe/grid] AddItem';
    constructor(
      public newItem: PeGridItem,
      public appName = DEFAULT_NAME,
    ) { }
  }

  export class DeleteItems {
    static readonly type = '[@pe/grid] DeleteItems';
    constructor(
      public itemsIds: string[],
      public appName = DEFAULT_NAME,
    ) { }
  }

  export class EditItem {
    static readonly type = '[@pe/grid] EditItem';
    constructor(
      public itemToUpdate: PeGridItem,
      public appName = DEFAULT_NAME,
    ) { }
  }

  export class OpenFolder {
    static readonly type = '[@pe/grid] OpenFolder';
    constructor(
      public folderItems: PeGridItem[],
      public appName = DEFAULT_NAME,
    ) { }
  }
}

export namespace PeGridStoreActions {
  export class Clear {
    static readonly type = '[@pe/grid] ClearStore';
    constructor(public appName = DEFAULT_NAME) { }
  }

  export class Create {
    static readonly type = '[@pe/grid] CreateStateForApp';
    constructor(public appName: string) { }
  }
}
