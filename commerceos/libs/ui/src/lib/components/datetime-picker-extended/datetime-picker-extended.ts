import { Component, Inject, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import moment from 'moment';
import { Moment } from 'moment';
import { Subject } from 'rxjs';

import { PeDestroyService } from '@pe/common';

import { PE_DATEPICKEREXT_DATA, PE_DATEPICKEREXT_THEME } from './constants';

@Component({
  selector: 'peb-datetime-picker-extended',
  templateUrl: './datetime-picker-extended.html',
  styleUrls: ['./datetime-picker-extended.scss'],
  providers: [PeDestroyService],
  encapsulation: ViewEncapsulation.None,
})
export class PebDateTimePickerExtendedComponent implements OnInit {
  /** Start date variable */
  dateStart: Moment = null;
  /** End date variable */
  dateEnd: Moment = null;
  /** Range variable */
  range: DateRange<Moment>;
  /** Compare option variable. (currently not implemented) */
  compare = false;
  /** Theme variable. Default dark */
  theme = 'dark';
  /** Filter variable */
  filter: string;

  /** Range variable for saving */
  rangeSave = { start: null, end: null };

  apply$ = new Subject();

  readonly destroyed$ = this.destroy$.asObservable();

  /** Returns formated start date label */
  get dateStartLabel() {
    if (this.dateStart !== null) {
      return this.dateStart.format('DD-MMM-YYYY');
    }
  }

  /** Returns formated end date label */
  get dateEndLabel() {
    if (this.dateEnd !== null) {
      return this.dateEnd.format('DD-MMM-YYYY');
    }
  }

  /** Date filter options */
  dateFilters = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This week', value: 'this week' },
    { label: 'Last week', value: 'last week' },
    { label: 'This month', value: 'this month' },
    { label: 'This year', value: 'this year' },
    { label: 'Last year', value: 'last year' },
  ];

  @ViewChild('calendar') calendar: MatCalendar<Moment>;
  readonly maxDate = moment();
  constructor(
    @Optional() @Inject(PE_DATEPICKEREXT_DATA) public data: any,
    @Optional() @Inject(PE_DATEPICKEREXT_THEME) public configTheme: string,
    private readonly destroy$: PeDestroyService
  ) {}

  ngOnInit() {
    if (this.configTheme) {
      this.theme = this.configTheme;
    }
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
    if (this.dateStart == null) {
      this.dateStart = date;
      const start = this.dateStart.format();
      this.rangeSave.start = start;
    } else if (this.dateEnd == null && date && this.compareDate(date, this.dateStart) >= 0) {
      this.dateEnd = date;
      const end = this.dateEnd.format();
      this.rangeSave.end = end;
    } else {
      this.dateStart = date;
      const start = this.dateStart.format();
      this.rangeSave.start = start;
      this.rangeSave.end = null;
      this.dateEnd = null;
    }

    this.range = new DateRange<Moment>(this.dateStart, this.dateEnd);
  }

  /** On apply return range */
  onApply() {
    if (this.dateStart === null) {
      return;
    }
    this.apply$.next({ range: this.rangeSave, compare: this.compare, filter: this.filter });
  }

  /** Cancels datepicker */
  onCancel() {
    this.apply$.next();
  }

  /** On filter selected returns appropiate values */
  onFilter(filter) {
    this.filter = filter.value;
    if (filter.label === 'Today') {
      this.dateStart = moment().startOf('day');
      this.dateEnd = null;
    } else if (filter.label === 'Yesterday') {
      this.dateStart = moment().startOf('day').subtract(1, 'day');
      this.dateEnd = null;
    } else if (filter.label === 'This week') {
      this.dateStart = moment().startOf('week');
      this.dateEnd = moment().startOf('day');
    } else if (filter.label === 'Last week') {
      this.dateStart = moment().startOf('week').subtract(1, 'week');
      this.dateEnd = moment().startOf('week').subtract(1, 'day');
    } else if (filter.label === 'This month') {
      this.dateStart = moment().startOf('month');
      this.dateEnd = moment().startOf('day');
    } else if (filter.label === 'This year') {
      this.dateStart = moment().startOf('year');
      this.dateEnd = moment().startOf('day');
    } else if (filter.label === 'Last year') {
      this.dateStart = moment().startOf('year').subtract(1, 'year');
      this.dateEnd = moment().startOf('year').subtract(1, 'day');
    }

    this.createRange();
  }

  /** Creates date range on filter click */
  private createRange() {
    const start = this.dateStart.format();
    const end = this.dateEnd !== null ? this.dateEnd.format() : null;

    this.rangeSave = { start, end };

    this.range = new DateRange<Moment>(this.dateStart, this.dateEnd);
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

  /** Sets compare flag. (not implemented) */
  getCompare(event) {
    this.compare = event.checked;
  }
}
