import { PebAbstractElement } from '@pe/builder-renderer';

export enum PebContextMenuCommands {
  Group = 'group',
  Ungroup = 'ungroup',
}

export interface PebContextMenuState {
  canGroup: boolean;
  canUngroup: boolean;
  canDelete: boolean;
  addSection: boolean;
  canSave: boolean;
}

export const getGroupId = (element: PebAbstractElement, openGroup: string) => {
  if (element.data?.groupId?.length) {
    return openGroup
      ? element.data.groupId[Math.max(element.data.groupId.indexOf(openGroup) - 1, 0)]
      : element.data.groupId.slice(-1).pop();
  }

  return undefined;
}
