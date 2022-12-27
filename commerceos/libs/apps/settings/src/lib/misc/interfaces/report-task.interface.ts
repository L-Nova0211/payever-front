export interface ReportTaskInterface {
  id?: string;
  business: string;
  status: ReportTaskStatus;
  period: ReportTaskPeriod;
}

export interface UserReportSettingsInterface {
  id?: string;
  user: string;
  status: ReportTaskStatus;
  period: ReportTaskPeriod;
}

export enum ReportTaskPeriod {
  Never = 'never',
  OnceADay = 'once-a-day',
  OnceAWeek = 'once-a-week',
  OnceAMonth = 'once-a-month'
}

export enum ReportTaskStatus {
  Idle = 'idle',
  InProgress = 'in-progress',
  Stopped = 'stopped'
}
