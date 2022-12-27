export enum PeAppointmentsRequestsErrorsEnum {
  // Connections
  GetChannels = 'appointments-app.apm_errors.get_channels',
  GetConnections = 'appointments-app.apm_errors.get_connections',
  InstallConnection = 'appointments-app.apm_errors.install_connection',
  UninstallConnection = 'appointments-app.apm_errors.uninstall_connection',
  // Access
  GetAccessConfig = 'appointments-app.apm_errors.get_access_config',
  GetLiveStatus = 'appointments-app.apm_errors.get_live_status',
  UpdateAccessConfig = 'appointments-app.apm_errors.update_access_config',
  // Themes
  GetShopActiveTheme = 'appointments-app.apm_errors.get_shop_active_theme',
  NoApplicationId = 'appointments-app.apm_errors.no_application_id',
  // Appointments
  GetAllAppointments = 'appointments-app.apm_errors.get_all_appointments',
  GetAppointmentsByCalendar = 'appointments-app.apm_errors.get_appointments_by_calendar',
  GetAppointment = 'appointments-app.apm_errors.get_appointment',
  CreateAppointment = 'appointments-app.apm_errors.create_appointment',
  DeleteAppointment = 'appointments-app.apm_errors.delete_appointment',
  UpdateAppointment = 'appointments-app.apm_errors.update_appointment',
  // Appointment fields
  GetCustomFields = 'appointments-app.apm_errors.get_custom_fields',
  GetDefaultFields = 'appointments-app.apm_errors.get_default_fields',
  GetField = 'appointments-app.apm_errors.get_field',
  GetFields = 'appointments-app.apm_errors.get_fields',
  CreateField = 'appointments-app.apm_errors.create_field',
  DeleteField = 'appointments-app.apm_errors.delete_field',
  UpdateField = 'appointments-app.apm_errors.update_field',
  UpdateFieldId = 'appointments-app.apm_errors.update_field_id',
  // Appointment types
  GetAppointmentType = 'appointments-app.apm_errors.get_appointment_type',
  GetAppointmentTypes = 'appointments-app.apm_errors.get_appointment_types',
  CreateAppointmentType = 'appointments-app.apm_errors.create_appointment_type',
  DeleteAppointmentType = 'appointments-app.apm_errors.delete_appointment_type',
  UpdateAppointmentType = 'appointments-app.apm_errors.update_appointment_type',
  GetDefaultAppointmentType = 'appointments-app.apm_errors.get_default_appointment_type',
  SetDefaultAppointmentType = 'appointments-app.apm_errors.set_default_appointment_type',
  // Appointment availability
  GetAppointmentAvailability = 'appointments-app.apm_errors.get_appointment_type',
  GetAppointmentAvailabilities = 'appointments-app.apm_errors.get_appointment_types',
  CreateAppointmentAvailability = 'appointments-app.apm_errors.create_appointment_type',
  DeleteAppointmentAvailability = 'appointments-app.apm_errors.delete_appointment_type',
  UpdateAppointmentAvailability = 'appointments-app.apm_errors.update_appointment_type',
  GetDefaultAppointmentAvailability = 'appointments-app.apm_errors.get_default_appointment_type',
  SetDefaultAppointmentAvailability = 'appointments-app.apm_errors.set_default_appointment_type',
  // Network
  GetNetwork = 'appointments-app.apm_errors.get_calendar',
  GetNetworks = 'appointments-app.apm_errors.get_calendars',
  CreateNetwork = 'appointments-app.apm_errors.create_calendar',
  DeleteNetwork = 'appointments-app.apm_errors.delete_calendar',
  UpdateNetwork = 'appointments-app.apm_errors.update_calendar',
  GetDefaultNetwork = 'appointments-app.apm_errors.get_default_calendar',
  SetDefaultNetwork = 'appointments-app.apm_errors.set_default_calendar',
  // Payments
  GetPayments = 'appointments-app.apm_errors.get_payments',
  CreatePayments = 'appointments-app.apm_errors.create_payments',
  UpdatePayments = 'appointments-app.apm_errors.update_payments',
  // other
  GetContacts = 'appointments-app.apm_errors.get_contacts',
  GetProducts = 'appointments-app.apm_errors.get_products',
}
