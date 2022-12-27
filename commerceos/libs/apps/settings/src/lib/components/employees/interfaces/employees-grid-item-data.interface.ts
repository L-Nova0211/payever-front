import { PositionsEnum } from '../../../misc/enum/positions.enum';
import { EmployeeStatusEnum } from '../../../misc/interfaces';

export interface EmployeesGridItemDataInterface {
  isActive: boolean;
  withoutImage: boolean;
  position?: PositionsEnum;
  email: string;
  status: EmployeeStatusEnum;
  actionButton: {
    color: string,
    backgroundColor: string,
    title: string,
    callback: (e?: Event) => void,
  };
}
