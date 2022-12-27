import { Exclude, Transform, Type } from 'class-transformer';
import 'reflect-metadata';

import { PeAppointmentsFieldTypesEnum } from '../enums';

export class FieldDto {
  name: string;
  title: string;
  _id?: string;

  @Exclude()
  __typename?: string;

  type?: string;
  filterable?: boolean;
  editableByAdmin?: boolean;
  showDefault?: boolean;
  defaultValues?: Array<string>;
  showOn?: Array<string>;
  @Transform(({ value, obj }) => {
    switch (obj.type) {
      case PeAppointmentsFieldTypesEnum.Multiselect:
        return /\w/.test(value) ? value.split(',') : [];
      case PeAppointmentsFieldTypesEnum.Checkbox:
        return value === 'true';
    }

    return value;
  })
  value?: any;
}

export interface Fields {
  fields: FieldDto[];
}

export interface AppointmentField {
  _id?: string;
  fieldId?: string;
  value: string;
}

export class AppointmentFieldDto {
  @Exclude()
  __typename?: string;

  fieldId: string;
  value: string;
}

export class AppointmentDto {
  @Exclude()
  __typename?: string;

  _id?: string;
  allDay: boolean;
  appointmentNetwork?: string;
  repeat: boolean;
  date: string;
  time: string;
  location: string;
  note: string;
  products: string[];
  contacts?: string[];

  @Type(() => AppointmentFieldDto)
  fields: AppointmentFieldDto[];
}
