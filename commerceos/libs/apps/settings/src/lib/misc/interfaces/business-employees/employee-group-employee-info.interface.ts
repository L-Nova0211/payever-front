import { EmployeeStatusEnum } from '../employee.interface';

export interface BusinessEmployeeGroupEmployeeInfoInterface {
  _id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status: EmployeeStatusEnum;
}

