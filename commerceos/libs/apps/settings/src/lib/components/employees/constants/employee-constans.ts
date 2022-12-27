import { PeDataGridFilterConditionType } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { positionsOptions } from '../../../misc/enum/positions.enum';
import { EmployeeStatusEnum } from '../../../misc/interfaces';

export const LSFolder = 'settings_app_employees_folder';
export const LSView = 'settings_app_employees_view';

export enum EmployeeFilterKeyEnum {
  search = 'search',
  nameAndEmail = 'nameAndEmail',
  positionType = 'positions.positionType',
  email = 'email',
  status = 'status'
}

export enum EmployeeColumnNameEnum {
  selected = 'selected',
  fullName = 'fullName',
  position = 'position',
  email = 'email',
  status = 'status',
  actions = 'actions'
}

export const EmployeeColumnNameToOrderKeyMap = {
  [EmployeeColumnNameEnum.position]: 'positions.positionType',
  [EmployeeColumnNameEnum.fullName]: 'nameAndEmail',
  [EmployeeColumnNameEnum.status]: 'positions.status',
};

export const EmployeeColumnNameText = {
  fullName: 'form.create_form.group.employee_name',
  position: 'form.create_form.contact.position.label',
  email: 'form.create_form.contact.email.label',
  status: 'form.create_form.employee.status',
};

export const EmployeeFilterText = {
  search: 'form.create_form.employee.search',
  name: 'form.create_form.employee.name',
  position: 'form.create_form.contact.position.label',
  email: 'form.create_form.personal_information.email.placeholder',
  status: 'form.create_form.employee.status',
  statusInvited: 'form.create_form.employee.options.invited',
  statusActive: 'form.create_form.employee.options.active',
};

export type getFilterType = (translateService: TranslateService) => any /*DataGridFilterSchemaInterface*/; //TODO

const searchFilter: getFilterType = (translateService: TranslateService) => ({
  field: EmployeeFilterKeyEnum.search,
  fieldLabel: translateService.translate(EmployeeFilterText.search),
  type: PeDataGridFilterConditionType.Text,
});

const nameAndEmailFilter: getFilterType = (translateService: TranslateService) => ({
  field: EmployeeFilterKeyEnum.nameAndEmail,
  fieldLabel: translateService.translate(EmployeeFilterText.name),
  type: PeDataGridFilterConditionType.Text,
});

const positionTypeFilter: getFilterType = (translateService: TranslateService) => ({
  field: EmployeeFilterKeyEnum.positionType,
  fieldLabel: translateService.translate(EmployeeFilterText.position),
  type: PeDataGridFilterConditionType.Select,
  options: positionsOptions.map((key) => {
    return { ...key, label: translateService.translate(key.labelKey) };
  }),
});

const emailFilter: getFilterType = (translateService: TranslateService) => ({
  field: EmployeeFilterKeyEnum.email,
  fieldLabel: translateService.translate(EmployeeFilterText.email),
  // type: PeDataGridFilterConditionType.Email // TODO
});

const statusFilter: getFilterType = (translateService: TranslateService) => ({
  field: EmployeeFilterKeyEnum.status,
  fieldLabel: translateService.translate(EmployeeFilterText.status),
  type: PeDataGridFilterConditionType.Select,
  options: [
    {
      label: translateService.translate(EmployeeFilterText.statusInvited),
      value: '' + EmployeeStatusEnum.invited,
    },
    {
      label: translateService.translate(EmployeeFilterText.statusActive),
      value: '' + EmployeeStatusEnum.active,
    },
  ],
});

export const employeeFilters = {
  search: searchFilter,
  nameAndEmail: nameAndEmailFilter,
  positionType: positionTypeFilter,
  email: emailFilter,
  status: statusFilter,
};
