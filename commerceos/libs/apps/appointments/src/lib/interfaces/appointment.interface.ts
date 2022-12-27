import { PeAppointmentsMeasurementsEnum } from '../enums';

export interface PeAppointmentsAppointmentInterface {
  _id?: string;
  allDay: boolean;
  applicationScopeElasticId?: string;
  appointmentNetwork?: string;
  contacts: string[];
  date: string;
  duration?: number;
  fields: PeAppointmentsAppointmentFieldInterface[];
  location: string;
  measuring?: PeAppointmentsMeasurementsEnum;
  note: string;
  parentFolderId?: string;
  products: string[];
  repeat: boolean;
  serviceEntityId?: string;
  time: string;
}

export interface PeAppointmentsAppointmentFieldInterface {
  _id?: string;
  fieldId?: string;
  value: string;
}
