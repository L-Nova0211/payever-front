import { ClockFormat, ClockType, TimeFormat } from '../enums/clock-type.enum';
import { Period } from '../enums/period.enum';
import { PebTimePickerConfig } from '../interfaces';

import { PebHourClass } from './hour.class';
import { PebMinuteClass } from './minute.class';

export class PebTimeFacadeClass {
  timeSet = {
    hour: new PebHourClass(),
    minute: new PebMinuteClass(),
  };

  set ampm(ampm: Period) {
    this.timeSet.hour.ampm = ampm;
  }

  get ampm(): Period {
    return this.timeSet.hour.ampm;
  }

  constructor(config: PebTimePickerConfig) {
    this.stringToTimeSet(config.time, config.onlyPM);
  }

  stringToTimeSet(time?: string, onlyPM?: boolean) {
    const timeSet = (time === '' || time === undefined || time === null)
      ? `${this.timeSet.hour.time}:${this.timeSet.minute.time}` : time;
    const [h, m] = timeSet.split(':');
    const hour = +h > 12 ? +h - 12 : +h;
    const ampm = +h >= 12 ? Period.PM : Period.AM;

    this.timeSet.hour.ampm = onlyPM ? Period.PM : ampm;
    this.timeSet.hour.time = hour === 0 ? 12 : hour;
    this.timeSet.minute.time = +m;
  }

  currentTime(time?: number, type?: ClockType): string {
    const hour = type === ClockType.Hour ? time : this.timeSet.hour.time;
    const minute = type === ClockType.Minute ? time : this.timeSet.minute.time;
    const Hour = (+hour === 12 && this.ampm === Period.AM) ? '0' : hour;

    return `${Hour}:${minute} ${this.ampm}`;
  }

  timeSetToString(): string {
    const { minute, hour } = this.timeSet;

    return `${hour.timeString(ClockFormat.Clock24, TimeFormat.NullFirst)}:${minute.timeString(TimeFormat.NullFirst)}`;
  }

  putTime(type: ClockType, time: number) {
    this.timeSet[type].time = time;
  }

  getTime(type: ClockType, clockFormat?: ClockFormat): number {
    if (type === ClockType.Hour) {
      return this.timeSet[type].changeClockFormat(clockFormat).time;
    }

    return this.timeSet[type].time;
  }

  timeToString(type: ClockType, clockFormat?: ClockFormat): string {
    if (type === ClockType.Hour) {
      return this.timeSet[type].timeString(clockFormat);
    }

    return this.timeSet[type].timeString();
  }
}
