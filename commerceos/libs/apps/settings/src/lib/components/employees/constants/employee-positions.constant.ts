import { PositionsEnum } from '../../../misc/enum/positions.enum';
import { TranslatedListOptionInterface } from '../../../misc/interfaces';

export const employeePositionsOptions: Array<TranslatedListOptionInterface<PositionsEnum>> = [
  { labelKey: 'common.constants.employee_positions.cashier', value: PositionsEnum.cashier },
  { labelKey: 'common.constants.employee_positions.sales', value: PositionsEnum.sales },
  { labelKey: 'common.constants.employee_positions.marketing', value: PositionsEnum.marketing },
  { labelKey: 'common.constants.employee_positions.staff', value: PositionsEnum.staff },
  { labelKey: 'common.constants.employee_positions.admin', value: PositionsEnum.admin },
  { labelKey: 'common.constants.employee_positions.others', value: PositionsEnum.others },
];
