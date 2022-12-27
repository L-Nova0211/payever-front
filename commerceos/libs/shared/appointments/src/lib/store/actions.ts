export class InitAppointments {
  static readonly type = '[Appointments/API] Init Appointments';
  constructor(public items: any[]) {}
}

export class LazyLoadedAppointments {
  static readonly type = '[Appointments/API] Lazy Loaded Appointments';
  constructor(public items: any[]) {}
}

export class AddAppointment {
  static readonly type = '[Appointments/API] Add Appointment';
  constructor(public item: any) {}
}

export class UpdateAppointment {
  static readonly type = '[Appointments/API] Update Appointment';
  constructor(public item: any) {}
}
