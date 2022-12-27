import { AclOptionEnum } from '../acl.interface';
import { EmployeeStatusEnum } from '../employee.interface';

export interface NewBusinessEmployeeInterface {
  userId: string;
  email: string | { value: string, disabled: boolean };
  first_name?: string;
  last_name?: string;
  status: EmployeeStatusEnum;
  position: string;
  // groups can't be an empty array
  groups?: string[];
  acls: AclOptionEnum[];
  logo: string;
  phoneNumber: string;
  companyName: string;
  address: NewBusinessEmployeeAddressInterface;
}

export interface NewBusinessEmployeeAddressInterface {
  country?: string;
  city?: string;
  street?: string;
  zipCode?: string;
}
