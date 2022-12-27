import { EmployeesGridItemInterface } from '../interfaces/employees-grid-item.interface';

type compareFn = (prev: EmployeesGridItemInterface, next: EmployeesGridItemInterface) => number;

export const NAME_ASC: compareFn = (
  prev: EmployeesGridItemInterface,
  next: EmployeesGridItemInterface
) => prev.title.toString().localeCompare(next.title.toString()) * -1;
export const NAME_DESC: compareFn = (
  prev: EmployeesGridItemInterface,
  next: EmployeesGridItemInterface
) => prev.title.toString().localeCompare(next.title.toString());

export const POSITION_ASC: compareFn = (
  prev: EmployeesGridItemInterface,
  next: EmployeesGridItemInterface
) => prev.data.position.localeCompare(next.data.position) * -1;
export const POSITION_DESC: compareFn = (
  prev: EmployeesGridItemInterface,
  next: EmployeesGridItemInterface
) => prev.data.position.localeCompare(next.data.position);

export const EMAIL_ASC: compareFn = (
  prev: EmployeesGridItemInterface,
  next: EmployeesGridItemInterface
) => prev.data.email.localeCompare(next.data.email) * -1;
export const EMAIL_DESC: compareFn = (
  prev: EmployeesGridItemInterface,
  next: EmployeesGridItemInterface
) => prev.data.email.localeCompare(next.data.email);

export const STATUS_ASC: compareFn = (
  prev: EmployeesGridItemInterface,
  next: EmployeesGridItemInterface
) => prev.data.status - next.data.status;
export const STATUS_DESC: compareFn = (
  prev: EmployeesGridItemInterface,
  next: EmployeesGridItemInterface
) => next.data.status - prev.data.status;
