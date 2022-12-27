import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { MOBILE_PHONE_PATTERN } from '../../../../misc/constants/validation-patterns.constants';
import {
  NewBusinessEmployeeAddressInterface,
  NewBusinessEmployeeInterface, PositionInterface,
} from '../../../../misc/interfaces';
import { BusinessEmployeeInterface } from '../../../../misc/interfaces/business-employees/business-employee.interface';
import { BusinessEnvService } from '../../../../services';

export type EmployeeFields = keyof NewBusinessEmployeeInterface;
type EmployeeValues = NewBusinessEmployeeInterface[EmployeeFields];

export type EmployeeAddressFields = keyof NewBusinessEmployeeAddressInterface;
type EmployeeAddressValues = NewBusinessEmployeeAddressInterface[EmployeeAddressFields];

@Injectable()
export class PebEmployeeDialogFormService {

  constructor(
    private fb: FormBuilder,
    private envService: BusinessEnvService) {
  }

  initFormGroup(employee?: BusinessEmployeeInterface): FormGroup {
    let form: FormGroup;

    form = this.fb.group(this.getEmployeeFormObject(employee));

    form.controls.acls = this.fb.group({});
    form.controls.address = this.initAddressForm(employee?.address);

    return form;
  }

  private getEmployeeFormObject(
    employee?: BusinessEmployeeInterface
  ): Record<EmployeeFields, [EmployeeValues] | [EmployeeValues, ValidatorFn[]]> {
    const allPositions: PositionInterface[] = Array.isArray(employee?.positions)
      ? employee?.positions
      : employee?.positions ? [employee?.positions] : [];
    const position: PositionInterface = allPositions.find(pos => pos.businessId === this.envService.businessUuid);

    const formObj: Record<EmployeeFields, [EmployeeValues] | [EmployeeValues, ValidatorFn[]]> = {
      userId: [null],
      logo: [employee?.logo || null],
      status: [position?.status || null],
      first_name: [employee?.first_name || null, [Validators.required]],
      last_name: [employee?.last_name || null, [Validators.required]],
      email: [
        employee?.email ? { value: employee.email, disabled: true } : null,
        [Validators.required, Validators.email]],
      position: [position?.positionType || null, [Validators.required]],
      groups: [null],
      acls: [null],
      phoneNumber: [employee?.phoneNumber || null, [Validators.pattern(MOBILE_PHONE_PATTERN)]],
      companyName: [employee?.companyName || null],
      address: [null],
    };

    return formObj;
  }

  private initAddressForm(address: NewBusinessEmployeeAddressInterface = {}) {
    const addressFormObj: Record<EmployeeAddressFields, [EmployeeAddressValues]> = {
      country: [address?.country || null],
      city: [address?.city || null],
      street: [address?.street || null],
      zipCode: [address?.zipCode || null],
    };

    return this.fb.group(addressFormObj);
  }
}
