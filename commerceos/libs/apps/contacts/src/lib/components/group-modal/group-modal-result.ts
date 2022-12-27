import { FolderItem } from '@pe/folders';

export interface GroupModalResult{
    isCancel:boolean,
    isOk:boolean
    moveToFolder:FolderItem,
    addedFolders:any[],
}