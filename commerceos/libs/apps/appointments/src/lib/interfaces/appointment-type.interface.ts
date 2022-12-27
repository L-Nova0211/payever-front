import { PeAppointmentsDurationUnitsEnum, PeAppointmentsTypesEnum } from '../enums';

export interface PeAppointmentsTypeInterface {
  _id?: string;
  dateRange: number;
  description?: string;
  duration: number;
  eventLink: string;
  indefinitelyRange: boolean;
  isDefault: boolean;
  isTimeAfter: boolean;
  isTimeBefore: boolean;
  maxInvitees: number;
  name: string;
  schedule: string;
  timeAfter: number;
  timeBefore: number;
  type: PeAppointmentsTypesEnum;
  unit: PeAppointmentsDurationUnitsEnum;
}
