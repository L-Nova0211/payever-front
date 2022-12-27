import { TimeZones, WeekDay } from '../enums';

export interface PeAppointmentsAvailabilityInterface {
  _id?: string;
  name: string;
  timeZone: TimeZones;
  weekDayAvailability: WeekDayAvailability[];
  isDefault: boolean;
}

export interface WeekDayAvailability {
  name: WeekDay;
  isEnabled: boolean;
  ranges?: RangeAvailability[];
}

export interface RangeAvailability {
  from: string;
  to: string;
}
