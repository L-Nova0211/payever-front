import { FieldGroup } from './group';

export interface ContactCustomField {
  id: string;
  fieldLabel: string;
  fieldType: string;
  fieldValue: string;
  filterable?: boolean;
  editableByAdmin?: boolean;
  showDefault?: boolean;
  showOnPerson?: boolean;
  showOnCompany?: boolean;
  defaultValues?: string[];
}

export interface Field {
  _id: string;
  id?: string;
  businessId: string;
  name: string;
  type: string;
  defaultValues?: string[];
  showOn?: string[];
  filterable?: boolean;
  editable?: boolean;
  groupId?: string;
  group?: FieldGroup;
  editableByAdmin?: boolean;
}

export interface AddContactField {
  value: string;
  contactId?: string;
  fieldId: string;
}

export interface UpdateContactField {
  id: string;
  value: string;
}

export interface StatusField {
  id: string;
  name: string;
  businessId?: string;
}

export interface AddStatusField {
  name: string;
  id?: string;
  businessId?: string;
}

export interface UpdateStatusField {
  id: string;
  name: string;
  businessId?: string;
}

export interface ContactStatusField {
  id: string;
  contactId: string;
  statusId: string;
}
