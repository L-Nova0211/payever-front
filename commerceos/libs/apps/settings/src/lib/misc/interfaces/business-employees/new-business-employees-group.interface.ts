import { AclOptionEnum } from '../acl.interface';

export interface NewBusinessEmployeesGroupInterface {
  name: string;
  acls: AclOptionEnum[];
}
