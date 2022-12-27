export interface AclInterface {
  microservice: string;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
}

// The same as in the AclInterface
export enum AclOptionEnum {
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete'
}
