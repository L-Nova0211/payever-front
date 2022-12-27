import { PeDataToolbarOptionIcon } from '@pe/grid';

export enum navbarFilterKeysEnum {
  All = '',
  Name = 'name'
}

export enum ContextEnum {
  Edit = 'edit',
  Resend = 'resend',
  Delete = 'delete',
  DeleteFrom = 'deleteFrom'
}

export enum OptionsMenu {
  SelectAll = 'select-all',
  DeselectAll = 'deselect-all',
  Duplicate = 'duplicate',
  Delete = 'delete',
  Resend = 'resend',
  DeleteFromGroup = 'delete-from-group',
}

export enum EmployeesIcons {
  Resend = 'toolbar-resend',
}

export const EmployeesToolbarIcons = { ...PeDataToolbarOptionIcon, ...EmployeesIcons };
