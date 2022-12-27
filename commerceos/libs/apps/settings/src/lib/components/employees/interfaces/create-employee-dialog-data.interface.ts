import { BusinessEmployeeInterface } from '../../../misc/interfaces/business-employees/business-employee.interface';

import { IGroupItemInterface } from './employee-group.interface';

export interface CreateEmployeeDialogDataInterface {
  businessId: string;
  employee?: BusinessEmployeeInterface;
  theme?: string;
  groupId?: string;
}

export interface ICreateEmployeeGroupDialogDataInterface {
  businessId: string;
  theme?: string;
  groupId?: string;
  group?: IGroupItemInterface[];
}
