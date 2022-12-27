import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { filter, tap } from 'rxjs/operators';

import { PeDatePickerRef, PeDateTimePickerService } from '@pe/ui';

@Component({
  selector: 'pe-message-schedule-component',
  templateUrl: './message-schedule.component.html',
  styleUrls: ['./message-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageScheduleComponent implements AfterContentInit, OnDestroy {
  form!: FormGroup;
  dateCtrl: FormControl = new FormControl();
  datePickerRef!: PeDatePickerRef;

  @Input() errors!: boolean;
  @Input() errorMessage!: string;

  constructor(
    private formBuilder: FormBuilder,
    private dateTimePickerService: PeDateTimePickerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterContentInit(): void {
    const date = Intl.DateTimeFormat('en', { year: 'numeric', day: '2-digit', month: 'short' }).format(new Date());
    const time = Intl.DateTimeFormat('de', { hour: '2-digit', minute: '2-digit' }).format(new Date());

    this.form = this.formBuilder.group({
      date: [date, [Validators.required]],
      time: [time, [Validators.required, Validators.pattern('^([[0-2]?[0-9]|2[0-9]]):[0-5][0-9]$')]],
    });
  }

  ngOnDestroy(): void {
    if (this.datePickerRef) {
      this.datePickerRef.close();
    }
  }

  onDatePicker(event: any): void {
    const twoYearsFromNow = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
    this.datePickerRef = this.dateTimePickerService.open(event, {
      theme: 'dark',
      config: {
        range: false,
        minDate: new Date(),
        maxDate: twoYearsFromNow,
      },
    });

    this.datePickerRef.afterClosed.pipe(
      filter(date => !!date),
      tap((date) => {
        const formatedDate = Intl.DateTimeFormat('en', { year: 'numeric', day: '2-digit', month: 'short' })
          .format(new Date(date.start));
        this.form.get('date')?.setValue(formatedDate);
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  onTimeBlur(): void {
    this.errors = false;
    this.errorMessage = '';
    if (this.form.get('time')?.errors?.pattern) {
      this.errors = true;
      this.errorMessage = 'Time format must be HH:MM';
    }
    this.cdr.detectChanges();
  }

}
