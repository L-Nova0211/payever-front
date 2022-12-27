import { EmployeeStatusEnum, TranslatedListOptionInterface } from '../../../misc/interfaces';

export const employeeStatusOptions: Array<TranslatedListOptionInterface<EmployeeStatusEnum>> = [
  { labelKey: 'common.constants.employee_statuses.active', value: EmployeeStatusEnum.active },
  { labelKey: 'common.constants.employee_statuses.invited', value: EmployeeStatusEnum.invited },
  { labelKey: 'common.constants.employee_statuses.inactive', value: EmployeeStatusEnum.inactive },
];
