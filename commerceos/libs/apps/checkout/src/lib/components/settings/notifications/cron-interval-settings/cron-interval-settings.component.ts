import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { TimeFramesInterface } from '../../../../interfaces';
import { SettingsOptionsInterface } from '../notifications.component';

@Component({
  selector: 'time-frame-settings',
  templateUrl: './cron-interval-settings.component.html',
  styleUrls: ['./cron-interval-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeDestroyService,
  ],
})
export class CronIntervalSettingsComponent implements OnInit {

  @Input() timeFrame: TimeFramesInterface;

  @Output() deleteTimeFrame: EventEmitter<boolean> = new EventEmitter();
  @Output() updateTimeFrame: EventEmitter<TimeFramesInterface> = new EventEmitter();

  form: FormGroup;
  timeOptions: SettingsOptionsInterface[] = this.getTimeOptions();
  daysOptions: SettingsOptionsInterface[] = [
    {
      value: 1,
      label: this.translateService.translate('settings.notifications.settings.daysOfWeek.monday'),
    },
    {
      value: 2,
      label: this.translateService.translate('settings.notifications.settings.daysOfWeek.tuesday'),
    },
    {
      value: 3,
      label: this.translateService.translate('settings.notifications.settings.daysOfWeek.wednesday'),
    },
    {
      value: 4,
      label: this.translateService.translate('settings.notifications.settings.daysOfWeek.thursday'),
    },
    {
      value: 5,
      label: this.translateService.translate('settings.notifications.settings.daysOfWeek.friday'),
    },
    {
      value: 6,
      label: this.translateService.translate('settings.notifications.settings.daysOfWeek.saturday'),
    },
    {
      value: 7,
      label: this.translateService.translate('settings.notifications.settings.daysOfWeek.sunday'),
    },
  ];

  sendEmailAfterIntervalOptions: SettingsOptionsInterface[] = this.getSendEmailAfterIntervalOptions();
  validationError$ = new BehaviorSubject<string>(null);
  @Input() repeatFrequencyIntervalOptions: SettingsOptionsInterface[];

  constructor(
    private formBuilder: FormBuilder,
    public translateService: TranslateService,
    private destroyed$: PeDestroyService,
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(['trashcan-20']);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      startDayOfWeek: [this.timeFrame.startDayOfWeek, [Validators.required, Validators.min(1), Validators.max(7)]],
      endDayOfWeek: [this.timeFrame.endDayOfWeek, [Validators.required, Validators.min(1), Validators.max(7)]],
      startHour: [this.timeFrame.startHour, [Validators.required, Validators.min(0), Validators.max(24)]],
      startMinutes: [this.timeFrame.startMinutes, [Validators.required, Validators.min(0), Validators.max(60)]],
      endHour: [this.timeFrame.endHour, [Validators.required, Validators.min(0), Validators.max(24)]],
      endMinutes: [this.timeFrame.endMinutes, [Validators.required, Validators.min(0), Validators.max(60)]],
      sendEmailAfterInterval: [this.timeFrame.sendEmailAfterInterval,
        [Validators.required, Validators.min(0), Validators.max(720)]],
      repeatFrequencyInterval: [this.timeFrame.repeatFrequencyInterval,
        [Validators.required, Validators.min(0), Validators.max(60)]],
    });
    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      this.updateTimeFrame.emit(data);
      this.validationError$.next(this.form.invalid ? 'Time frame is not valid' : null);
    });
  }

  getSelectedStartTime(): string {
    return `${this.form.controls['startHour'].value}_${this.form.controls['startMinutes'].value}`;
  }

  getSelectedEndTime(): string {
    return `${this.form.controls['endHour'].value}_${this.form.controls['endMinutes'].value}`;
  }

  selectStartTimeFieldValue(value: string) {
    const data = value.split('_').map(a => Number(a));
    this.form.controls['startHour'].patchValue(data[0]);
    this.form.controls['startMinutes'].patchValue(data[1]);
  }

  selectEndTimeFieldValue(value: string) {
    const data = value.split('_').map(a => Number(a));
    this.form.controls['endHour'].patchValue(data[0]);
    this.form.controls['endMinutes'].patchValue(data[1]);
  }

  private getTimeOptions(): SettingsOptionsInterface[] {
    const options: SettingsOptionsInterface[] = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        options.push({
          value: `${i}_${j}`,
          label: `${i < 10 ? '0' : ''}${i}:${j < 10 ? '0' : ''}${j}`,
        });
      }
    }
    options.push({
      value: `${23}_${59}`,
      label: `23:59`,
    });

    return options;
  }

  private getSendEmailAfterIntervalOptions(): SettingsOptionsInterface[] {
    const options: SettingsOptionsInterface[] = [];
    const values = [0, 5, 10, 30, 60, 120, 180, 360, 720];
    for (let i in values) {
      options.push({
        value: values[i],
        label: this.translateService.translate(
        `settings.notifications.settings.sendEmailAfterInterval.options.${values[i]}`),
      });
    }

    return options;
  }
}
