import { TimeFormat } from '../enums/clock-type.enum';
import { PebTimePickerComponent } from '../time-picker/time-picker.component';

import { PebTimeAbstractClass } from './time-abstract.class';

export class PebMinuteClass implements PebTimeAbstractClass {
  minute = 0;
  max = 59;
  min = 0;

  set time(time: number) {
    const timeChecked = time > this.max ? this.max
      : (time < this.min ? this.min : time);
    this.minute = timeChecked;
  }

  get time(): number {
    return this.minute;
  }

  timeString(timeFormat?: TimeFormat): string {
    const minute = this.minute.toString();

    return this.minute < 10 && timeFormat === TimeFormat.NullFirst ? `0${this.minute}` : minute;
  }
}
