import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { catchError, pluck, switchMap, tap } from 'rxjs/operators';

export enum EmployeeStatusEnum {
  inactive,
  invited,
  active
}

export enum AclOptionEnum {
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete'
}

export type AclInterface =  { microservice: string } & Partial<{ [key in AclOptionEnum]: boolean }>;

export interface PositionInterface {
  positionType: string;
  status: EmployeeStatusEnum;
  businessId: string;
}

export interface NewBusinessEmployeeInterface {
  userId: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status: EmployeeStatusEnum;
  position: string;
  // groups can't be an empty array
  groups?: string[];
  acls: AclInterface[];
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
  userId: string;
}

export interface BusinessEmployeeAddressInterface {
  country: string;
  city: string;
  state: string;
  street: string;
  zipCode: string;
}

@Injectable()
export class PeAccessApiService {

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private http: HttpClient,
  ) {
  }


  createBusinessEmployee(
    businessId: string,
    newEmployee: NewBusinessEmployeeInterface
  ): Observable<BusinessEmployeeInterface> {
    const config = this.env.backend;
    const url = `${config.users}/api/employees/${businessId}`;

    return this.http.post<BusinessEmployeeInterface>(url, newEmployee);
  }

  getBusinessEmployeeByUser(businessId: string, userId: string): Observable<BusinessEmployeeInterface> {
    const config = this.env.backend;

    return this.http.get<BusinessEmployeeInterface>(`${config.users}/api/employees/${businessId}/user/${userId}`).pipe(
      pluck('data'),
    );
  }

  getBusinessEmployeeAclsAndPositions(businessId: string, employeeId: string): Observable<{ positions: PositionInterface[], acls: AclInterface[] }> {
    const config = this.env.backend;
    const url = `${config.auth}/api/employees/business/${businessId}/get-acls/${employeeId}`;

    return this.http.get<any>(url);
  }

}
