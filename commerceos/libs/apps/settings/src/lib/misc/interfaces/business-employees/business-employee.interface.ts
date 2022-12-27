import { EmployeeStatusEnum, PositionInterface } from '../employee.interface';

export interface BusinessEmployeeInterface {
  _id: string;
  address: BusinessEmployeeAddressInterface;
  companyName: string;
  email: string;
  email_i: string;
  first_name: string;
  fullName: string;
  last_name: string;
  logo: string;
  nameAndEmail: string;
  phoneNumber: string;
  positions?: PositionInterface[];
  status: EmployeeStatusEnum;
}

export interface BusinessEmployeeAddressInterface {
  country: string;
  city: string;
  state: string;
  street: string;
  zipCode: string;
}
