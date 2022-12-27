export interface AclInterface {
  microservice: string;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface PermissionInterface {
  businessId: string;
  acls: AclInterface[];
}

export interface UserPermissionsInterface {
  name: string;
  permissions: PermissionInterface[];
}

export interface UserRolesInterface {
  roles: UserPermissionsInterface[];
}
