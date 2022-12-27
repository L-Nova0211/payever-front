import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { SelectOptionInterface } from '@pe/forms';
import { PeDateTimePickerService } from '@pe/ui';

import { AbstractAction } from '../../../../shared/abstractions/action.abstract';
import { ActionTypeEnum } from '../../../../shared/interfaces/action.type';

export enum WeekOfDelivery {
  THIS_WEEK = 'this_week',
  NEXT_WEEK = 'next_week',
  OTHER_WEEK = 'other_week'
}

@Component({
  selector: 'pe-change-delivery-action',
  templateUrl: './change-delivery.component.html',
  styles: [`
    :host {
      peb-form-background {
        & + peb-form-background {
          display: block;
          margin-top: 12px;
        }

        .suffix-icon {
          cursor: pointer;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ActionChangeDeliveryComponent extends AbstractAction implements OnInit {
  form: FormGroup = null;
  translationsScope = 'transactions.form.edit_delivery';

  constructor(
    public injector: Injector,
    private formBuilder: FormBuilder,
    private dateTimePicker: PeDateTimePickerService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface
  ) {
    super(injector);
    this.matIconRegistry.addSvgIcon(
      `datetime-picker`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/calendar-icon.svg`),
    );
  }

  get weeksOfDelivery(): SelectOptionInterface[] {
    return Object.values(WeekOfDelivery).map(key => ({
      label: this.translateService.translate(`${this.translationsScope}.labels._weekOfDelivery_view.value.${key}`),
      value: key,
    }));
  }

  ngOnInit(): void {
    this.getData();
  }

  onOpenDatepicker(event: MouseEvent) {
    const dialogRef = this.dateTimePicker.open(event, {
      theme: this.theme,
      config: { range: false, format: 'W.yyyy', maxDate: null },
    });
    dialogRef.afterClosed.subscribe((date) => {
      if (date?.start) {
        this.form.get('weekOfDelivery').setValue(date.start);
      }
    });
  }

  onChangeWeek(value: WeekOfDelivery) {
    this.changeWeeksOfDelivery(value);
  }

  onSubmit(): void {
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      return;
    }

    this.sendAction(this.form.getRawValue().weekOfDelivery, ActionTypeEnum.EditDelivery, 'weekOfDelivery', false);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      _weekOfDelivery_view: ['', Validators.required],
      weekOfDelivery: ['', Validators.required],
    });

    this.initWeeksOfDelivery(this.order.details.week_of_delivery);
  }

  private sendActionOrder(orderId: string, data: any, action: ActionTypeEnum, dataKey: string): void {
    this.isLoading$.next(true);
    this.detailService.actionOrder(orderId, data, action, dataKey, false).subscribe(
      () => {
        this.isLoading$.next(false);
        this.close();
        this.getData(true);
        this.refreshList();
      },
      (error: HttpErrorResponse) => {
        this.isLoading$.next(false);
        this.showError(error.error)
      }
    );
  }

  private changeWeeksOfDelivery(week: WeekOfDelivery): void {
    this.form.get('weekOfDelivery').disable();
    const weekDate = moment(new Date()).format('W.yyyy');
    const nextWeekDate = moment(new Date()).add(1, 'week').format('W.yyyy');

    if (week === WeekOfDelivery.THIS_WEEK) {
      this.form.get('weekOfDelivery').setValue(weekDate);
    } else if (week === WeekOfDelivery.NEXT_WEEK) {
      this.form.get('weekOfDelivery').setValue(nextWeekDate);
    } else {
      this.form.get('weekOfDelivery').enable();
    }
  }

  private initWeeksOfDelivery(weekOfDelivery: string): void {
    this.form.get('weekOfDelivery').disable();

    const weekDate = moment(new Date()).format('W.yyyy');
    const nextWeekDate = moment(new Date()).add(1, 'week').format('W.yyyy');
    if (weekDate === weekOfDelivery) {
      this.form.get('weekOfDelivery').setValue(weekDate);
      this.form.get('_weekOfDelivery_view').setValue(WeekOfDelivery.THIS_WEEK);
    } else if (weekDate === nextWeekDate) {
      this.form.get('weekOfDelivery').setValue(nextWeekDate);
      this.form.get('_weekOfDelivery_view').setValue(WeekOfDelivery.NEXT_WEEK);
    } else {
      this.form.get('weekOfDelivery').setValue(weekOfDelivery);
      this.form.get('weekOfDelivery').enable();
      this.form.get('_weekOfDelivery_view').setValue(WeekOfDelivery.OTHER_WEEK);
    }
  }
}
