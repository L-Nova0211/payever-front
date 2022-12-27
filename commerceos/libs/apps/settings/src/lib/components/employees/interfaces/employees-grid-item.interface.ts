import { PeDataGridItem } from '@pe/common';

import { EmployeesGridItemDataInterface } from './employees-grid-item-data.interface';

export interface EmployeesGridItemInterface extends Omit<PeDataGridItem, 'data'> {
  data?: EmployeesGridItemDataInterface;
  type?: string;
  position?: string;
  mail?: string;
  status?: string;
  action?: any;
  badge?: any;
  columns: any[];
  labels?: string[];
  labelClass?: string;
  additionalInfo?: string[];
}
