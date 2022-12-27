
import { ClockFormat, TimeFormat } from '../enums/clock-type.enum';
import { Period } from '../enums/period.enum';
import { PebTimePickerComponent } from '../time-picker/time-picker.component';

import { PebTimeAbstractClass } from './time-abstract.class';

export class PebHourClass implements PebTimeAbstractClass {
  hour = 12;
  max = 12;
  min = 1;
  type = Period.AM;
  clockFormat = ClockFormat.Clock12;

  set time(time: number) {
    const timeChecked = time > this.max ? this.max
      : (time < this.min ? this.min : time);
    this.hour = timeChecked;
  }

  get time(): number {
    let timeChecked = this.ampm === Period.PM && this.clockFormat === ClockFormat.Clock24 ? this.hour + 12 : this.hour;
    if (this.ampm === Period.AM && timeChecked === 12 && this.clockFormat === ClockFormat.Clock24) {
      timeChecked = 0;
    }
    if (timeChecked === 24 && this.clockFormat === ClockFormat.Clock24) {
      timeChecked = 12;
    }

    this.changeClockFormat(ClockFormat.Clock12);

    return timeChecked;
  }

  set ampm(ampm: Period) {
    this.type = ampm;
  }

  get ampm(): Period {
    return this.type;
  }

  changeClockFormat(clock?: ClockFormat): PebHourClass {
    this.clockFormat = clock;

    return this;
  }

  timeString(clock?: ClockFormat, timeFormat?: TimeFormat): string {
    let hh = this.changeClockFormat(clock).time;

    return hh < 10 && timeFormat === TimeFormat.NullFirst ? `0${hh}` : hh.toString();
  }
}
