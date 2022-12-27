import { Component, Inject, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { DateFilterFn, DateRange, MatCalendar } from '@angular/material/datepicker';
import moment from 'moment';
import { Moment } from 'moment';
import { Subject } from 'rxjs';

import { PeDestroyService } from '@pe/common';

import { PE_DATEPICKER_CONFIG, PE_DATEPICKER_DATA, PE_DATEPICKER_THEME } from './constants';

@Component({
  selector: 'peb-datetime-picker',
  templateUrl: './datetime-picker.html',
  styleUrls: ['./datetime-picker.scss'],
  providers: [PeDestroyService],
  encapsulation: ViewEncapsulation.None,
})
export class PebDateTimePickerComponent {
  @ViewChild('calendar') calendar: MatCalendar<Moment>;

  readonly destroyed$ = this.destroy$.asObservable();
  readonly maxDate = this.config.maxDate !== undefined ? this.config.maxDate : moment();
  readonly minDate = this.config.minDate !== undefined ? this.config.minDate : moment(0);
  readonly daysToDisable: number[] = this.config.daysToDisable ?? [];

  rangeSave = { start: null, end: null };
  apply$ = new Subject();
  dateStart: Moment = null;
  dateEnd: Moment = null;
  range: DateRange<Moment>;

  dateFilter: DateFilterFn<Moment> = (d: Moment) => {
    return !this.daysToDisable.includes(d.day());
  }

  constructor(
    @Optional() @Inject(PE_DATEPICKER_DATA) public data: any,
    @Optional() @Inject(PE_DATEPICKER_THEME) public theme: string,
    @Optional() @Inject(PE_DATEPICKER_CONFIG) public config: any,
    private readonly destroy$: PeDestroyService
  ) {
  }

  /**
   * Selects start and end date
   * First click selects start date
   * Second click selects end date
   * Third click resets end date and selects start date
   *
   * @param date Date mat-calendar returns
   */
  selectedChangeOn(date: Moment): void {
    const dateFormat = this.config.format ?? null;
    if (this.config.range) {
      if (this.dateStart == null) {
        this.dateStart = date;
        const start = this.dateStart.format(dateFormat);
        this.rangeSave.start = start;
      } else if (this.dateEnd == null && date && this.compareDate(date, this.dateStart) >= 0) {
        this.dateEnd = date;
        const end = this.dateEnd.format(dateFormat);
        this.rangeSave.end = end;
      } else {
        this.dateStart = date;
        this.dateEnd = null;
        const start = this.dateStart.format(dateFormat);
        this.rangeSave.start = start;
      }
    } else {
      this.dateStart = date;
      this.dateEnd = null;
      const start = this.dateStart.format(dateFormat);
      this.rangeSave.start = start;
    }

    this.range = new DateRange<Moment>(this.dateStart, this.dateEnd);
  }

  /** On apply return range */
  onApply() {
    this.apply$.next(this.rangeSave);
  }

  /** Cancels datepicker */
  onCancel() {
    this.apply$.next();
  }

  /** Compares dates */
  private compareDate(first, second): number {
    return (
      this.getYear(first) - this.getYear(second) ||
      this.getMonth(first) - this.getMonth(second) ||
      this.getDate(first) - this.getDate(second)
    );
  }

  /** Returns year */
  private getYear(date) {
    return moment(date).year();
  }

  /** Returns month */
  private getMonth(date) {
    return moment(date).month();
  }

  /** Returns date */
  private getDate(date) {
    return moment(date).date();
  }
}
