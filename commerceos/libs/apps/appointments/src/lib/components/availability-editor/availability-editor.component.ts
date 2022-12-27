import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import moment from 'moment-timezone';
import { merge, Observable, of } from 'rxjs';
import {
  catchError, filter,
  map,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import {
  OverlayHeaderConfig,
  PeOverlayWidgetService,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
} from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
import { PebTimePickerService, PeDateTimePickerService } from '@pe/ui';

import { TIME_ZONES } from '../../constants';
import { WeekDay } from '../../enums';
import { PeAppointmentsAvailabilityApiService, PeAppointmentsReferenceService } from '../../services';


@Component({
  selector: 'pe-availability-editor',
  templateUrl: 'availability-editor.component.html',
  styleUrls: ['../form-preloader.scss', './availability-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeAppointmentsAvailabilityEditorComponent implements OnInit {
  private readonly loadingBtn = this.translateService.translate('appointments-app.actions.loading');
  private readonly cancelBtn = this.translateService.translate('appointments-app.actions.cancel');
  private readonly closeBtn = this.translateService.translate('appointments-app.actions.close');
  private readonly saveBtn = this.translateService.translate('appointments-app.actions.save');

  public readonly theme = this.peOverlayConfig.theme;

  public loading = false;

  public timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ' ', /[aApP]/, /[mM]/];

  public timeZones = cloneDeep(TIME_ZONES).map((item) => {
    const GMT = item.value.replace(/\+|-/, match => match === '-' ? '+' : '-');
    const label = this.translateService.translate(`appointments-app.availability_editor.time-zones.${item.label}`);
    item.label = `${label} (${moment.tz(GMT).format('HH:mm')})`;

    return item;
  });

  public availabilityDays = Object.values(WeekDay);

  public availabilityForm = this.formBuilder.group({
    _id: [],
    name: [`Schedule${this.peOverlayData.numberOfSchedule}`, Validators.required],
    timeZone: [this.timeZones[0].value],
    weekDayAvailability: this.formBuilder.array([]),
    isDefault: [false],
  });

  public validatedControls = [];
  public weekDayAvailabilityToggles$ = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private router: Router,

    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private dateTimePicker: PeDateTimePickerService,
    private snackbarService: SnackbarService,
    private timePicker: PebTimePickerService,
    private translateService: TranslateService,
    private peAppointmentsAvailabilityApiService: PeAppointmentsAvailabilityApiService,
    private peAppointmentsReferenceService: PeAppointmentsReferenceService,
    private readonly destroy$: PeDestroyService,
  ) {
    this.loading = true;
    this.peAppointmentsReferenceService.backdropClick = this.closeEditor;
    this.peOverlayConfig.backBtnCallback = this.closeEditor;
    this.peOverlayConfig.doneBtnCallback = () => {
      !this.loading && this.save();
    };
  }

  ngOnInit(): void {
    const availabilityId = this.peOverlayData.id;
    const weekDayAvailability = this.availabilityForm.get('weekDayAvailability') as FormArray;
    const getAppointment$ = availabilityId
      ? this.getAppointmentAvailability(availabilityId, weekDayAvailability)
      : this.setBlankForm(weekDayAvailability);
    const initAvailabilityForm$ = getAppointment$
      .pipe(
        tap(() => {
          this.loading = false;
          this.peOverlayConfig.doneBtnTitle = this.saveBtn;
          this.peOverlayConfig.isLoading = false;
          this.cdr.markForCheck();
          this.availabilityForm.markAsPristine();
        }));
    const weekDayAvailabilityToggles$ = merge(...this.weekDayAvailabilityToggles$).pipe(
      tap((value: {isEnabled: boolean, control: AbstractControl}) => {
        if (value.isEnabled) {
          (value.control.get('ranges') as FormArray).push(this.arrayItem());
        }
      }),
    )

    merge(
      initAvailabilityForm$,
      weekDayAvailabilityToggles$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private readonly closeEditor = () => {
    if (this.availabilityForm.dirty && !this.loading) {
      this.peAppointmentsReferenceService.confirmation$
        .pipe(
          take(1),
          filter(Boolean),
          tap(() => {
            this.peAppointmentsReferenceService.appointmentEditor.close();
          }),
          takeUntil(this.destroy$))
        .subscribe();

      const isEditing = !!this.peOverlayData.id;
      const headingTitle = isEditing
        ? 'appointments-app.confirm_dialog.cancel.type_editor.editing.title'
        : 'appointments-app.confirm_dialog.cancel.type_editor.creating.title';
      const headingSubtitle = isEditing
        ? 'appointments-app.confirm_dialog.cancel.type_editor.editing.subtitle'
        : 'appointments-app.confirm_dialog.cancel.type_editor.creating.subtitle';
      const config: Headings = {
        title: this.translateService.translate(headingTitle),
        subtitle: this.translateService.translate(headingSubtitle),
        confirmBtnText: this.closeBtn,
        declineBtnText: this.cancelBtn,
      };
      this.peAppointmentsReferenceService.openConfirmDialog(config);
    } else if (!this.loading) {
      this.peAppointmentsReferenceService.appointmentEditor.close();
    }
  };

  save() {
    if (this.availabilityForm.valid) {
      const appointmentData = this.availabilityForm.value;
      const availabilityId = appointmentData._id;
      appointmentData.weekDayAvailability =
        this.availabilityForm.value.weekDayAvailability.filter(day => day.ranges.length > 0);
      delete appointmentData._id;


      this.loading = true;
      this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
      this.peOverlayConfig.isLoading = true;

      (
        availabilityId
          ? this.peAppointmentsAvailabilityApiService
            .updateAppointmentAvailability(availabilityId, appointmentData)
          : this.peAppointmentsAvailabilityApiService.createAppointmentAvailability(appointmentData)
      ).pipe(
        tap(availability => this.peOverlayConfig.onSaveSubject$.next({
          appointmentData: { ...appointmentData, _id: availability._id },
          isUpdate: !!availabilityId,
        })),
        catchError((error) => {
          this.loading = false;
          this.peOverlayConfig.doneBtnTitle = this.saveBtn;
          this.peOverlayConfig.isLoading = false;
          this.cdr.markForCheck();

          return of(error);
        }),
      ).subscribe();


      this.peOverlayWidgetService.close();
    } else {
      (this.availabilityForm.controls.weekDayAvailability as FormArray).controls.forEach((group) => {
        (group.get('ranges') as FormArray).controls.forEach((range, index) => {
          const from = range.get('from');
          if (from.invalid) {
            from.markAsDirty();
          }

          const to = range.get('to');
          if (to.invalid) {
            to.markAsDirty();
          }
        });
      });

      this.cdr.detectChanges();
    }
  }

  private getAppointmentAvailability(availabilityId: string, weekDayAvailability: FormArray): Observable<any> {
    this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
    this.peOverlayConfig.isLoading = true;
    this.cdr.detectChanges();

    return this.peAppointmentsAvailabilityApiService
      .getAppointmentAvailability(availabilityId)
      .pipe(
        tap((availability) => {
          this.availabilityDays.forEach((day, index) => {
            const dayItemLoaded = availability.weekDayAvailability.find(item => item.name === day);
            const ranges = this.formBuilder.array([]);

            if (dayItemLoaded) {
              dayItemLoaded.ranges.forEach((rangeLoaded) => {
                ranges.push(this.arrayItem(rangeLoaded.from, rangeLoaded.to));
              });
            }

            const dayItem = this.formBuilder.group({
              name: [day],
              isEnabled: [dayItemLoaded?.isEnabled],
              ranges,
            });

            this.weekDayAvailabilityToggles$.push(dayItem.controls.isEnabled.valueChanges.pipe(
              map(isEnabled => ({ isEnabled, control: dayItem })),
            ));

            weekDayAvailability.push(dayItem);
          });
          delete availability.weekDayAvailability;
          this.availabilityForm.patchValue(availability);
        }),
        catchError((error) => {
          this.loading = false;
          this.peOverlayConfig.doneBtnTitle = this.saveBtn;
          this.peOverlayConfig.isLoading = false;
          this.cdr.markForCheck();

          return of(error);
        }));
  }

  setBlankForm(weekDayAvailability: FormArray) {
    this.availabilityDays.forEach((day) => {
      const ranges = this.formBuilder.array(
        day !== WeekDay.Saturday && day !== WeekDay.Sunday ? [this.arrayItem()] : []
      );
      const dayItem = this.formBuilder.group({
        name: [day],
        isEnabled: [day !== WeekDay.Saturday && day !== WeekDay.Sunday],
        ranges,
      });

      this.weekDayAvailabilityToggles$.push(dayItem.controls.isEnabled.valueChanges.pipe(
        map(isEnabled => ({ isEnabled, control: dayItem })),
      ));

      weekDayAvailability.push(dayItem);
    });

    return of(null);
  }

  formArray(name: string) {
    return this.availabilityForm.get(name) as FormArray;
  }

  formArrayDayAvailabilityRanges(group: AbstractControl) {
    return group.get('ranges') as FormArray;
  }

  addCondition(group: AbstractControl) {
    const array = group.get('ranges') as FormArray;
    array.push(this.arrayItem());

    this.cdr.detectChanges();
  }

  removeCondition(group: AbstractControl, index: number) {
    const array = group.get('ranges') as FormArray;
    array.removeAt(index);

    this.cdr.detectChanges();
  }

  public openTimepicker(event: MouseEvent, timeControl: AbstractControl, from?: AbstractControl): void {
    const rangeTime = from && from.value ? { allowedRanges: [{ from: from.value }] } : {};
    const dialogRef = this.timePicker.open(event, {
      theme: this.theme,
      position: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: -12,
        offsetY: 12,
      },
      timeConfig: { animation: 'fade', time: timeControl.value, ...rangeTime },
    });
    dialogRef.afterClosed
      .pipe(
        take(1),
        tap((time) => {
          if (!!time) {
            timeControl.patchValue(time);
            timeControl.markAsDirty();
          } else {
            this.validatedControls.push(timeControl);
          }
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public maskRule(currentMask: (string | RegExp)[]): any {
    return {
      guide: false,
      mask: currentMask,
      showMask: false,
    };
  };

  public isInvalid(control: AbstractControl) {
    return control.dirty && control.invalid;
  }

  private arrayItem(from = '08:00', to = '17:00') {
    return this.formBuilder.group({
      from: this.formBuilder.control(from, Validators.required),
      to: this.formBuilder.control(to, Validators.required),
    });
  }
}
