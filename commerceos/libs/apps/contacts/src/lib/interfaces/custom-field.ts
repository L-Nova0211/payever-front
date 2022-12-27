import { StatusField } from '../public-api';

export enum FieldType {
  Input = 'input',
  Paragraph = 'textarea',
  Number = 'number',
  Checkbox = 'checkbox',
  Dropdown = 'select',
  Multiselect = 'multiselect',
}

export interface CustomFieldTypeOption {
  label: string;
  value: FieldType;
}

export interface ActionField {
  id: string,
  name: string,
  value: string
}

export interface StatusFieldAction extends StatusField {
  action?: ActionField
}

export const FIELD_TYPES: CustomFieldTypeOption[] = [
  {
    label: 'Single line text',
    value: FieldType.Input,
  },
  {
    label: 'Paragraph text',
    value: FieldType.Paragraph,
  },
  {
    label: 'Number',
    value: FieldType.Number,
  },
  {
    label: 'Checkbox',
    value: FieldType.Checkbox,
  },
  {
    label: 'Dropdown',
    value: FieldType.Dropdown,
  },
  {
    label: 'Multiselect',
    value: FieldType.Multiselect,
  },
];
