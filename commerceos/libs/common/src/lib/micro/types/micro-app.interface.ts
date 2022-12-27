export interface MicroAppDashboardInfoInterface {
  title: string;
  icon: string;
  disabledClick: boolean;
}

export interface MicroPlatformHeaderDataInterface {
  tag: string;
  bootstrapScriptUrl: string;
}

export interface InnerMicroDataInterface {
  bootstrapScriptUrl: string;
}

export enum AppSetUpStatusEnum {
  NotStarted = 'notStarted' ,
  Started = 'started',
  Completed = 'completed'
}

export interface MicroAppInterface {
  _id: string;
  code: string;
  dashboardInfo?: MicroAppDashboardInfoInterface;
  tag: string;
  url: string;
  bootstrapScriptUrl: string;
  installed: boolean;
  /**
   * @deprecated use _id instead of microUuid
   */
  microUuid: string;
  order: number;
  default?: boolean; // string;
  setupStatus?: AppSetUpStatusEnum;
  setupStep?: string;
  statusChangedAt?: string;
  platformHeader?: MicroPlatformHeaderDataInterface;
  innerMicros: { [micro: string]: InnerMicroDataInterface };
}
