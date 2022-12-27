import { PositionsEnum } from '../enum/positions.enum';

import { AclInterface } from './acl.interface';

// Important: Do not change enum items order
export enum EmployeeStatusEnum {
  inactive,
  invited,
  active
}

export const EmployeeStatusBadgeColorEnum = [
  '#eb4653',
  '#3a3941',
  '#069d3b',
]

export enum UserRolesEnum {
  admin = 'admin',
  partner = 'partner',
  merchant = 'merchant',
  customer = 'customer',
  oauth = 'oauth',
  user = 'user',
  anonymous = 'anonymous'
}

export interface EmployeeGroupsItemInterface {
  _id: string;
  name: string;
}

export interface PermissionInterface {
  businessId: string;
  acls: AclInterface[];
}

export interface PartnerTagInterface {
  name: UserRolesEnum;
}

export interface UserRoleInterface {
  type: UserRolesEnum;
  permissions: PermissionInterface[];
  tags: PartnerTagInterface[];
}

export interface EmployeeInterface {
  _id?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  fullName: string;
  position?: string;
  roles: UserRoleInterface[];
  groups: EmployeeGroupsItemInterface[];
}

export interface PositionInterface {
  businessId: string;
  positionType: PositionsEnum;
  status: EmployeeStatusEnum;
}

export interface CreateNewEmployeeInterface {
  email: string;
  first_name?: string;
  last_name?: string;
  position: string;
  // groups can't be an empty array
  groups?: string[];
  acls: AclInterface[];
}

export interface UpdateEmployeeInterface {
  position: string;
  // acls can't be an empty array
  acls?: AclInterface[];
}

export interface EmployeeDataInterface extends EmployeeInterface, PositionInterface {
}

export interface EmployeeListResponseInterface {
  count: number;
  data: EmployeeDataInterface[];
}
