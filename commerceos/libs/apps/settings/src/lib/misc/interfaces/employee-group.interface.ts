import { AclInterface } from './acl.interface';
import { EmployeeStatusEnum } from './employee.interface';

export interface EmployeeGroupEmployeeInfoInterface {
  _id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status: EmployeeStatusEnum;
}

export interface EmployeeGroupInterface {
  _id?: string;
  name: string;
  businessId: string;
  acls: AclInterface[];
  employees?: EmployeeGroupEmployeeInfoInterface[];
}
