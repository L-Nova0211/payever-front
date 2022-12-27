import { OverlayConfig } from '@angular/cdk/overlay';
import { Observable } from 'rxjs';

import { Period } from './enums';

export interface PebOverlayConfigExtened extends OverlayConfig {
  position?: any;
}

export interface PebTimePickerOverlayConfig extends PebOverlayConfigExtened {
  theme?: string;
  timeConfig?: PebTimePickerConfig;
}

export interface PebTimePickerConfig {
  time?: string;
  theme?: string;
  rangeTime?: RangeTime;
  allowedRanges?: RangeItem[];
  arrowStyle?: Pallete;
  locale?: string;
  preference?: IDisplayPreference;
  changeToMinutes?: boolean;
  animation?: 'fade' | 'rotate' | false;
  onlyHour?: boolean;
  onlyMinute?: boolean;
  onlyAM?: boolean;
  onlyPM?: boolean;
}

export interface RangeTime {
  start: string;
  end: string;
}

export interface RangeItem {
  from: string;
  to?: string;
}

export interface Pallete {
  background?: string;
  color?: string;
}

export interface IDialogResult {
  afterClose(): Observable<string>;
}

export interface IClockNumber {
  time: string;
  left: string;
  top: string;
  type: string;
}

export interface IDisplayPreference {
  minute?: any;
  hour?: any;
  separator?: string;
  labels?: {
    ok?: string;
    cancel?: string;
  };
  period?(period: Period);
  clockMinute?(minute: any);
  clockHour?(hour: any);
}

export interface ITime {
  minute: number;
  hour: number;
  ampm: Period;
}
