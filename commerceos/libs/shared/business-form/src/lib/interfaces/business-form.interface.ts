import { FormFieldTypeEnum } from '../enums';

export interface FormFieldInterface {
  icon?: string;
  name: string;
  placeholder: string;
  required: boolean;
  title: string;
  type: FormFieldTypeEnum;
  values?: FormFieldValueInterface[];
  getValues?: ActionInterface;
  relativeField?: string;
}

export interface FormFieldValueInterface {
  name: string;
  value: string;
}

export interface ActionInterface {
  method: string;
  name: string;
  url: string;
  payload?: any;
}
