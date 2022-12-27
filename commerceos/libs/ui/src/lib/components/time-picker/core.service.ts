import { Injectable } from '@angular/core';

import { Period } from './enums/period.enum';
import { ITime } from './interfaces';

@Injectable()
export class PebCoreService {

  public allowedTimes(allowedRanges: any) {
    const allTimes = [];
    const allTimesArray = [];
    let rangesArray = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute <= 59; minute++) {
        allTimesArray.push({ hour, minute });
      }
    }

    allowedRanges.forEach(allowedRange => {
      const allowedRangeTo = allowedRange.to ?? '24:00';
      const nowMinHour = +allowedRange.from.split(':')[0];
      const nowMaxHour = +allowedRangeTo.split(':')[0];
      const nowMinMin = +allowedRange.from.split(':')[1];
      const nowMaxMin = +allowedRangeTo.split(':')[1];

      rangesArray = rangesArray.concat(allTimesArray.filter(time => {
        if (time.hour === nowMinHour && time.hour !== nowMaxHour) {
          return time.minute >= nowMinMin;
        }

        if (time.hour === nowMaxHour) {
          return time.minute <= nowMaxMin;
        }

        if (time.hour === nowMinHour && time.hour === nowMaxHour) {
          return time.minute >= nowMinMin && time.minute <= nowMaxMin;
        }

        return time.hour >= nowMinHour && time.hour < nowMaxHour;
      }));
    });

    rangesArray.forEach(time => {
      const hour = time.hour <= 12 ? time.hour : time.hour - 12;
      const minute = time.minute;
      const ampm = time.hour < 12 ? Period.AM : Period.PM;
      allTimes.push(hour + ':' + minute + ' ' + ampm);
    })

    return [...new Set(allTimes)];
  }

  public ClockMaker(type: 'minute' | 'hour'): Array<any> {
    const items = [];
    const timeVal = (type === 'minute') ? 60 : 12;
    const timeStep = (type === 'minute') ? 5 : 1;
    const timeStart = (type === 'minute') ? 0 : 1;
    const r = 79;
    const j = r - 19;

    for (let min = timeStart; min <= timeVal; min += timeStep) {
      if (min !== 60) {
        const str = String(min);
        const x = j * Math.sin(Math.PI * 2 * (min / timeVal));
        const y = j * Math.cos(Math.PI * 2 * (min / timeVal));

        items.push({
          time: str,
          left: (x + r - 15) + 'px',
          top: (-y + r - 15) + 'px',
          type,
        });
      }
    }

    return items;
  }

  public TimeToString(time: ITime): string {
    const { ampm, minute, hour } = time;
    let hh = ampm === Period.PM ? +hour + 12 : +hour;
    if (ampm === Period.AM && hh === 12) {
      hh = 0;
    }
    if ( hh === 24) {
      hh = 12;
    }
    hh = hh < 10 ? '0' + hh : '' + hh as any;
    const mm = minute < 10 ? '0' + minute : minute;

    return `${hh}:${mm}`;
  }

  /**
   * Converts 00:00 format to ITime object
   */
  public StringToTime(time: string): ITime {
    const [h, m] = time.split(':');
    let hour = +h > 12 ? +h - 12 : +h;
    hour = hour === 0 ? 12 : hour;
    const ampm = +h >= 12 ? Period.PM : Period.AM;

    return {
      ampm, minute: +m, hour,
    };
  }

  /**
   * @experimental
   */
  public CalcDegrees(ele: any, parrentPos: any, step: number): number {
    const clock = {
      width: ele.currentTarget.offsetWidth,
      height: ele.currentTarget.offsetHeight,
    };
    const targetX = clock.width / 2;
    const targetY = clock.height / 2;
    const Vx = Math.round((ele.clientX - parrentPos.left) - targetX);
    const Vy = Math.round(targetY - (ele.clientY - parrentPos.top));
    let radians = -Math.atan2(Vy, Vx);
    radians += 2.5 * Math.PI;

    let degrees = Math.round(radians * 180 / Math.PI);
    const degMod = degrees % step;
    if (degMod === 0) {
      return degrees;
    } else if (degMod >= step / 2) {
      degrees = degrees + (step - degMod);
    } else if (degMod < step / 2) {
      degrees = degrees - degMod;
    }

    return degrees;
  }
}
