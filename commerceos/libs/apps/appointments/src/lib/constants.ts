import { PeAppointmentsNetworkInterface } from './interfaces';
import { TimeZones } from './enums';

export const DEFAULT_CONTACT_IMAGE = './assets/icons/contact-grid.png';

export const ICONS = {
  'appointments-calendar': '../assets/icons/appointments-calendar.svg',
  calendar: '../assets/icons/calendar.svg',
  connect: '../assets/icons/connect.svg',
  dashboard: '../assets/icons/dashboard.svg',
  edit: '../assets/icons/edit.svg',
  group: '../assets/icons/group.svg',
  settings: '../assets/icons/settings.svg',
  customer: '../assets/icons/customer.svg',
  themes: '../assets/icons/themes.svg',
  time: '../assets/icons/time.svg',
  'settings-arrow-open': '../assets/icons/settings-arrow-open.svg',
  'settings-livestatus': '../assets/icons/settings-livestatus.svg',
  'settings-owndomain': '../assets/icons/settings-owndomain.svg',
};

export const PE_APPOINTMENTS_FIRST_NETWORK: PeAppointmentsNetworkInterface = {
  favicon: '',
  isDefault: true,
  logo: '',
  name: '',
};

export const BAD_REQUEST = 'bad_request';
export const REQUIRED_MESSAGE = 'appointments-app.notify.firstly_create_network';

export const TIME_ZONES = [
  {
    label: 'gmt+0',
    value: TimeZones.GMT0,
  },
  {
    label: 'gmt+1',
    value: TimeZones.GMT1,
  },
  {
    label: 'gmt+2',
    value: TimeZones.GMT2,
  },
  {
    label: 'gmt+3',
    value: TimeZones.GMT3,
  },
  {
    label: 'gmt+4',
    value: TimeZones.GMT4,
  },
  {
    label: 'gmt+5',
    value: TimeZones.GMT5,
  },
  {
    label: 'gmt+6',
    value: TimeZones.GMT6,
  },
  {
    label: 'gmt+7',
    value: TimeZones.GMT7,
  },
  {
    label: 'gmt+8',
    value: TimeZones.GMT8,
  },
  {
    label: 'gmt+9',
    value: TimeZones.GMT9,
  },
  {
    label: 'gmt+10',
    value: TimeZones.GMT10,
  },
  {
    label: 'gmt+11',
    value: TimeZones.GMT11,
  },
  {
    label: 'gmt+12',
    value: TimeZones.GMT12,
  },
  {
    label: 'gmt-1',
    value: TimeZones.GMTm1,
  },
  {
    label: 'gmt-3',
    value: TimeZones.GMTm3,
  },
  {
    label: 'gmt-4',
    value: TimeZones.GMTm4,
  },
  {
    label: 'gmt-5',
    value: TimeZones.GMTm5,
  },
  {
    label: 'gmt-6',
    value: TimeZones.GMTm6,
  },
  {
    label: 'gmt-7',
    value: TimeZones.GMTm7,
  },
  {
    label: 'gmt-8',
    value: TimeZones.GMTm8,
  },
  {
    label: 'gmt-9',
    value: TimeZones.GMTm9,
  },
  {
    label: 'gmt-10',
    value: TimeZones.GMTm10,
  },
];
