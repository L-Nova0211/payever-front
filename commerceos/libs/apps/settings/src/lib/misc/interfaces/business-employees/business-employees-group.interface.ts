import { PaginationResponseInterface } from '../pagination-response.interface';

import { BusinessEmployeeGroupEmployeeInfoInterface } from './employee-group-employee-info.interface';
import { NewBusinessEmployeesGroupInterface } from './new-business-employees-group.interface';

export interface BusinessEmployeesGroupInterface extends NewBusinessEmployeesGroupInterface {
  employees?: BusinessEmployeeGroupEmployeeInfoInterface[];
  businessId: string;
  __v?: number;
  _id?: string;
}

export type BusinessEmployeesGroupResponseInterface = PaginationResponseInterface<BusinessEmployeesGroupInterface>;
