import { AclOptionEnum } from './acl.interface';
import { UserRolesEnum } from './employee.interface';

export interface UserRolesInterface {
  name: UserRolesEnum;
  permissions: UserRolesPermissionsInterface[];
}

export interface UserRolesPermissionsInterface {
  acls: AclOptionEnum[];
  businessId: string;
}
