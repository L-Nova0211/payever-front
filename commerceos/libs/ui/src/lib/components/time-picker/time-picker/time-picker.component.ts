import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { of, Subject } from 'rxjs';
import { delay, take, tap } from 'rxjs/operators';


import { timeMove } from '../animation';
import { PebTimeFacadeClass } from '../classes/time-facade.class';
import { DEFAULT_CONFIG, PE_TIMEPICKER_CONFIG } from '../constants';
import { PebCoreService } from '../core.service';
import { ClockFormat, ClockType, Period } from '../enums';
import { PebTimePickerConfig } from '../interfaces';

@Component({
  selector: 'peb-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [timeMove],
  providers: [PebCoreService],
})
export class PebTimePickerComponent implements OnInit {

  @Input() animation: 'fade' | 'rotate' | false;
  @Input() value: string;

  @Output() timeSelected: EventEmitter<string> = new EventEmitter<string>();

  public timeSet$ = new Subject<any>();
  public activeModal = false;
  public clockObject: any[];
  public isClicked: boolean;
  public clockType = ClockType.Hour;
  public ClockType = ClockType;
  public ClockFormat = ClockFormat;
  time: PebTimeFacadeClass;
  public nowTime: any = 12;
  public degree: any;
  public config: PebTimePickerConfig;
  public allowed: any;
  public changeToMin: boolean;
  public period = Period;
  isHourAnimationDisabled = false;
  isMinuteAnimationDisabled = false;
  touchStart = false;
  touchY = 0;
  touchTimeStart = 0;

  inputTime = {
    hour: '',
    minute: '',
  };

  private animationTime = 0;

  constructor(
    private core: PebCoreService,
    private cdr: ChangeDetectorRef,
    @Optional() @Inject(PE_TIMEPICKER_CONFIG) public timePickerConfig: PebTimePickerConfig,
  ) { }

  ngOnInit() {
    this.config = { ...DEFAULT_CONFIG, ...this.timePickerConfig };
    this.activeModal = true;

    if (this.animation) {
      this.config.animation = this.animation;
    }

    if (this.value) {
      this.config.time = this.value;
    }

    this.allowed = this.core.allowedTimes(this.config.allowedRanges);
    if (this.config && this.config.onlyMinute) {
      this.clockType = ClockType.Minute;
    }

    this.time = new PebTimeFacadeClass(this.config);

    this.setDefaultTimeFromAllowed();

    this.clockMaker();
    this.modalAnimation();
  }

  public applyTime(): void {
    let time = this.time.timeSetToString();
    const timeToCheck =
      `${this.time.getTime(ClockType.Hour, ClockFormat.Clock12)}:${this.time.getTime(ClockType.Minute)} ${this.time.ampm}`;
    if (!this.allowed.includes(timeToCheck)) {
      time = '';
    }
    this.timeSelected.emit(time);
    this.timeSet$.next(time);
  }

  setDefaultTimeFromAllowed() {
    const lastAllowed = this.allowed.includes('12:0 PM') ? '24:00' : this.allowed[0].replace(/\sAM|\sPM/, '');
    const time = lastAllowed.split(':');
    this.time.putTime(ClockType.Hour, +time[0]);
    this.time.putTime(ClockType.Minute, +time[1]);
    this.inputTime.hour = this.time.timeToString(ClockType.Hour, ClockFormat.Clock24);
    this.inputTime.minute = this.time.timeToString(ClockType.Minute);
  }

  clockMaker(): void {
    const type = this.clockType;
    this.clockObject = this.core.ClockMaker(type);
    this.setArrow(null);
  }

  setActiveTime(): void {
    this.nowTime = this.time.getTime(this.clockType);
  }

  setArrow(obj: any): void {
    if (obj) {
      this.clockType = obj.type;
      this.time.putTime(this.clockType, obj.time);
      this.inputTime[this.clockType] = this.time.timeToString(this.clockType, ClockFormat.Clock24);
    }
    const step = (this.clockType === ClockType.Minute) ? 6 : 30;
    const time = this.time.getTime(this.clockType);
    const degrees = time * step;
    this.rotationClass(degrees);
    this.setActiveTime();
  }

  rotationClass(degrees: any): void {
    this.degree = degrees;
  }

  setTime() {
    this.isClicked = false;
    if (this.config.changeToMinutes && !this.config.onlyHour && this.clockType === ClockType.Hour) {
      this.changeAnimational(ClockType.Minute);
    }
  }

  getDegree(ele: any): void {
    const step = this.clockType === ClockType.Minute ? 6 : 30;
    const parrentPos = ele.currentTarget.getBoundingClientRect();
    if (this.isClicked && (ele.currentTarget === ele.target || ele.target.nodeName === 'BUTTON')) {
      const clock = {
        width: ele.currentTarget.offsetWidth,
        height: ele.currentTarget.offsetHeight,
      };
      const degrees = this.core.CalcDegrees(ele, parrentPos, step);
      let hour = this.time.getTime(ClockType.Hour);
      let minute = this.time.getTime(ClockType.Minute);

      if (this.clockType === ClockType.Hour) {
        hour = (degrees / step);
        hour = (hour > 12) ? hour - 12 : hour;
      } else if (this.clockType === ClockType.Minute) {
        minute = (degrees / step);
        minute = (minute > 59) ? minute - 60 : minute;
      }

      const min = this.config.rangeTime.start;
      const max = this.config.rangeTime.end;

      const nowMinHour = +min.split(':')[0] < 12 ? +min.split(':')[0] : +min.split(':')[0] - 12;
      const nowMaxHour = +max.split(':')[0] < 12 ? +max.split(':')[0] : +max.split(':')[0] - 12;
      const nowMinMin = +min.split(':')[1];
      const nowMaxMin = +max.split(':')[1];

      const nowTime = this.currentTime(hour, this.time.ampm, minute);
      if (this.allowed.indexOf(nowTime) > -1) {
        this.time.putTime(ClockType.Hour, hour);
        this.time.putTime(ClockType.Minute, minute);
        this.rotationClass(degrees);
        this.setActiveTime();
      } else if (this.clockType === ClockType.Hour && (hour === nowMinHour && minute <= nowMinMin)) {
        this.time.putTime(ClockType.Hour, nowMinHour);
        this.time.putTime(ClockType.Minute, nowMinMin);
      } else if (this.clockType === ClockType.Hour && (hour === nowMaxHour && minute >= nowMaxMin)) {
        this.time.putTime(ClockType.Hour, nowMaxHour);
        this.time.putTime(ClockType.Minute, nowMaxMin);
      }

      this.inputTime.hour = this.time.timeToString(ClockType.Hour, ClockFormat.Clock24);
      this.inputTime.minute = this.time.timeToString(ClockType.Minute);
    }
  }

  private currentTime(hour: number, ampm: Period, minute: number): string {
    const Hour = (hour === 12 && ampm === Period.AM) ? '0' : hour;
    const nowTime = `${Hour}:${minute} ${ampm}`;

    return nowTime;
  }

  checkBet() {
    const nowTime = this.time.currentTime();

    if (this.allowed.indexOf(nowTime) === -1) {
      this.time.stringToTimeSet(this.config.rangeTime.start);
      this.inputTime.hour = this.time.timeToString(ClockType.Hour, ClockFormat.Clock24);
      this.inputTime.minute = this.time.timeToString(ClockType.Minute);
      this.setArrow(null);
      this.setActiveTime();
    }
  }

  checkDisabled(time) {
    const nowTime = this.time.currentTime(time, this.clockType);

    return this.allowed.indexOf(nowTime) === -1;
  }

  modalAnimation() {
    of(null).pipe(
      take(1),
      delay(1),
      tap(() => {
        this.activeModal = true;
      }),
    ).subscribe();
  }

  public minuteClick(): any {
    if (this.clockType === ClockType.Hour) {
      if (this.config.onlyHour) {
        return false;
      }

      this.changeAnimational(ClockType.Minute);
    }
  }

  public hourClick(): any {
    if (this.clockType === ClockType.Minute) {
      if (this.config.onlyMinute) {
        return false;
      }
      this.changeAnimational(ClockType.Hour);
    }
  }

  changeAnimational(type: ClockType) {
    if (this.clockType !== type) {
      if (this.config.animation === 'fade') {
        this.changeToMin = true;
        of(null).pipe(
          take(1),
          delay(200),
          tap(() => {
            this.changeToMin = false;
            this.clockType = type;
            this.clockMaker();

            this.cdr.detectChanges();
          }),
        ).subscribe();
      } else if (this.config.animation === 'rotate') {
        this.animationTime = 0.4;
        this.clockType = type;
        this.clockMaker();
      } else {
        this.clockType = type;
        this.clockMaker();
      }
    }
  }

  setAM(): any {
    if (this.config && this.config.onlyPM) {
      return false;
    }
    this.time.ampm = Period.AM;
    this.checkBet();
    this.time.ampm = Period.AM;
    this.inputTime.hour = this.time.timeToString(ClockType.Hour, ClockFormat.Clock24);
  }

  setPM(): any {
    if (this.config && this.config.onlyAM) {
      return false;
    }
    this.time.ampm = Period.PM;
    this.checkBet();
    this.time.ampm = Period.PM;
    this.inputTime.hour = this.time.timeToString(ClockType.Hour, ClockFormat.Clock24);
  }

  getClockArrowStyle() {
    let arrowStyle = {};
    if (this.config.animation === 'rotate') {
      arrowStyle = {
        transform: `rotate(${this.degree}deg)`,
        '-webkit-transform': `rotate(${this.degree}deg)`,
        background: this.config.arrowStyle.background,
        '-webkit-transition': `transform ${this.getAnimationTime()}`,
        transition: `transform ${this.getAnimationTime()}`,
      };
    } else {
      arrowStyle = {
        transform: `rotate(${this.degree}deg)`,
        '-webkit-transform': `rotate(${this.degree}deg)`,
        background: this.config.arrowStyle.background,
      };
    }

    return arrowStyle;
  }

  getAnimationTime() {
    return `${this.animationTime}s`;
  }

  updateClockDown(event) {
    this.isClicked = true;
    this.animationTime = 0;
    this.getDegree(event);
  }

  setNewRotation() {
    const targetDegree = ((this.time.getTime(ClockType.Minute) / 60) * 360) + 360;
    const targetDegree2 = targetDegree * 2;

    const diff1 = Math.abs(this.degree - targetDegree);
    const diff2 = Math.abs(this.degree - targetDegree2);

    if (diff1 < diff2) {
      this.rotationClass(targetDegree);
    } else {
      this.rotationClass(targetDegree2);
    }
  }

  public separator(): string {
    return ':';
  }

  public minutes(): any[] {
    return [...Array(60).keys()].map((minute) => {
      let min = minute.toString();
      if (minute < 10) {
        min = `0${min}`;
      }

      return { minNum: minute, minString: min };
    }) as any[];
  }

  public hours(): number[] {
    return [...Array(24).keys()];
  }

  switchTime(time) {
    let timeChecked = time;
    if (time >= 12 && time < 24 && this.clockType === ClockType.Hour) {
      timeChecked = time === 12 ? 12 : time - 12;
      this.time.ampm = Period.PM;
    } else if (time < 0 && this.clockType === ClockType.Hour) {
      timeChecked = 11;
      this.time.ampm = Period.PM;
    } else if ( (time > 23 || time === 0) && this.clockType === ClockType.Hour) {
      timeChecked = 12;
      this.time.ampm = Period.AM;
    } else if (this.clockType === ClockType.Hour) {
      this.time.ampm = Period.AM;
    }

    return timeChecked;
  }

  timeScrollChange(event): void {
    event.preventDefault();

    let time = this.time.getTime(this.clockType, ClockFormat.Clock24);
    time = event.wheelDelta < 0 ? time + 1 : time - 1;
    time = this.switchTime(time);

    if (!this.checkDisabled(time)) {
      this.time.putTime(this.clockType, time);

      this.setArrow({
        time: this.time.getTime(this.clockType),
        type: this.clockType,
      });
    }
  }

  timeTouchStart(event): void {
    this.touchStart = true;
    this.touchTimeStart = this.time.getTime(this.clockType);
    this.touchY = event.changedTouches[0].clientY;
  }

  timeTouchMove(event): void {
    event.preventDefault();

    if (this.touchStart) {
      const deltaY = event.changedTouches[0].clientY - this.touchY;
      const offset = deltaY < 0 ? Math.ceil(deltaY / 24) : Math.floor(deltaY / 24);
      let time = (this.touchTimeStart - offset);
      time = this.switchTime(time);

      if (!this.checkDisabled(time)) {
        this.time.putTime(this.clockType, time);
      }

      this.setArrow({
        time: this.time.getTime(this.clockType),
        type: this.clockType,
      });
    }
  }

  timeTouchEnd(event): void {
    this.touchStart = false;
  }

  typeFilter(event): void {
    const char = String.fromCharCode(event.which);
    if (!/^\d$/.test(char)) {
      event.preventDefault();
    }
  }

  typeTime(event) {
    const match = this.inputTime[this.clockType].match(/^\d{1,2}/);
    const timeClear = match[0] ? match[0].replace(/^0/, '') : 0;
    let time = Number(timeClear);
    time = this.switchTime(time);

    if (!this.checkDisabled(time)) {
      this.time.putTime(this.clockType, time);

      this.setArrow({
        time: this.time.getTime(this.clockType),
        type: this.clockType,
      });
    }

    this.inputTime[this.clockType] = this.time.timeToString(this.clockType, ClockFormat.Clock24);
  }
}
