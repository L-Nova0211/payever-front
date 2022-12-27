import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject, concat, merge, Observable, of } from 'rxjs';
import { catchError, delay, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import { PE_PRIMARY_HOST } from '@pe/domains';
import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeCustomValidators } from '@pe/shared/custom-validators';

import { PeAppointmentsDurationUnitsEnum, PeAppointmentsTypesEnum } from '../../enums';
import { PeAppointmentsTypeInterface } from '../../interfaces';
import {
  PeAppointmentsTypesApiService,
  PeAppointmentsReferenceService,
  PeAppointmentsAvailabilityApiService,
} from '../../services';

const typeFormControlsErrors = {
  incorrectSegmentName: 'incorrect_segment_name',
  max: 'max',
  maxlength: 'max_length',
  maxSegmentLength: 'max_segment_length',
  min: 'min',
  notPositiveInt: 'not_positive_integer',
  required: 'required',
  unknown: 'unknown',
};

const validate = (condition: boolean, control: AbstractControl, validators: ValidatorFn[] = []): void => {
  if (condition) {
    control.enable();
    control.setValidators([...validators, Validators.min(1), PeCustomValidators.PositiveInteger(0)]);
  } else {
    control.disable();
  }
  control.updateValueAndValidity();
};

@Component({
  selector: 'pe-appointments-type-editor',
  templateUrl: 'type-editor.component.html',
  styleUrls: ['../form-preloader.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeAppointmentsTypeEditorComponent implements OnInit {
  public loading = false;

  public readonly schedules$ = new BehaviorSubject<{ isDefault: boolean; label: string; value: string; }[]>([]);
  public readonly theme = this.peOverlayConfig.theme;
  public readonly typeForm = this.formBuilder.group({
    _id: [],
    dateRange: [60],
    description: [],
    duration: [30],
    eventLink: [],
    indefinitelyRange: [true],
    isDefault: [false],
    isTimeAfter: [false],
    isTimeBefore: [false],
    maxInvitees: [1],
    name: [],
    schedule: [],
    timeAfter: [30],
    timeBefore: [30],
    type: [PeAppointmentsTypesEnum.OneOnOne],
    unit: [PeAppointmentsDurationUnitsEnum.Minute],
  });

  public readonly types = [
    {
      label: 'appointments-app.type_editor.type.one_on_one',
      value: PeAppointmentsTypesEnum.OneOnOne,
    },
    {
      label: 'appointments-app.type_editor.type.group',
      value: PeAppointmentsTypesEnum.Group,
    },
  ];

  public readonly units = [
    {
      label: 'appointments-app.type_editor.unit.hrs',
      value: PeAppointmentsDurationUnitsEnum.Hour,
    },
    {
      label: 'appointments-app.type_editor.unit.min',
      value: PeAppointmentsDurationUnitsEnum.Minute,
    },
  ];

  private readonly validateControls$ = new BehaviorSubject<boolean>(false);

  private readonly eventLinkValue$ = this.typeForm.controls.name
    .valueChanges
    .pipe(
      tap((name) => {
        const regExp = /[^0-9a-zA-Z]/g;
        const eventLink = name.toLowerCase().replace(regExp, ' ').trim().replace(/\s+/g, '-');
        this.typeForm.controls.eventLink.patchValue(eventLink);
      }));

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,

    @Inject(PE_PRIMARY_HOST) public primaryHost: string,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peAppointmentsTypesApiService: PeAppointmentsTypesApiService,
    private peAppointmentsReferenceService: PeAppointmentsReferenceService,
    private peAppointmentsAvailabilityApiService: PeAppointmentsAvailabilityApiService,
  ) {
    this.formLoadingStatus(true);
    this.peAppointmentsReferenceService.backdropClick = this.closeEditor;
    this.peOverlayConfig.backBtnCallback = this.closeEditor;
    this.peOverlayConfig.doneBtnCallback = () => {
      !this.loading && this.save();
    };
  }

  ngOnInit(): void {
    const appointmentTypeId = this.peOverlayData.id;
    const getAvailabilities$ = this.peAppointmentsAvailabilityApiService
      .getAppointmentAvailabilities({})
      .pipe(
        map(({ collection }) => collection.map((availability) => ({
          isDefault: availability.isDefault,
          label: availability.name,
          value: availability._id,
        }))),
        tap((schedules) => {
          this.schedules$.next(schedules);
        }));
    const setDefaultSchedule$ = this.schedules$
      .pipe(
        take(1),
        delay(0),
        map((schedules) => {
          const indexOfDefaultSchedule = schedules.findIndex(schedule => schedule.isDefault);
          const scheduleToDefault = indexOfDefaultSchedule !== -1
            ? schedules[indexOfDefaultSchedule]
            : schedules[0];
          this.typeForm.patchValue({ schedule: scheduleToDefault.value });
        }));
    const getAppointment$ = appointmentTypeId
      ? this.getAppointmentType(appointmentTypeId)
      : setDefaultSchedule$;
    const initTypeForm$ = getAppointment$
      .pipe(
        tap(() => {
          this.formLoadingStatus(false);
          this.typeForm.markAsPristine();
        }));

    merge(
      concat(
        getAvailabilities$,
        initTypeForm$,
        this.eventLinkValue$,
      ),
      this.controlsValidation(this.typeForm),
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private readonly closeEditor = () => {
    if (this.typeForm.dirty && !this.loading) {
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
        confirmBtnText: this.translateService.translate('appointments-app.actions.close'),
        declineBtnText: this.translateService.translate('appointments-app.actions.cancel'),
      };
      this.peAppointmentsReferenceService.openConfirmDialog(config);
    } else if (!this.loading) {
      this.peAppointmentsReferenceService.appointmentEditor.close();
    }
  };

  private controlsValidation({ controls }: FormGroup): Observable<any> {
    const { duration, eventLink, indefinitelyRange, isTimeAfter, isTimeBefore, name, type, unit } = controls;

    return merge(
      indefinitelyRange.valueChanges,
      isTimeAfter.valueChanges,
      isTimeBefore.valueChanges,
      type.valueChanges,
      unit.valueChanges,
      this.validateControls$,
    ).pipe(
      tap(() => {
        const maxDuration = unit.value === PeAppointmentsDurationUnitsEnum.Hour ? 12 : 720;
        const required = this.validateControls$.value ? [Validators.required] : [];
        duration.setValidators([...required, Validators.max(maxDuration), PeCustomValidators.PositiveInteger(0)]);
        duration.updateValueAndValidity();
        eventLink.setValidators([...required, PeCustomValidators.SegmentOfUrl(0, 50)]);
        eventLink.updateValueAndValidity();
        name.setValidators([...required, Validators.maxLength(50)]);
        name.updateValueAndValidity({ emitEvent: false });
        validate(!indefinitelyRange.value, controls.dateRange, [...required, Validators.max(999999)]);
        validate(isTimeAfter.value, controls.timeAfter, [...required, Validators.max(180)]);
        validate(isTimeBefore.value, controls.timeBefore, [...required, Validators.max(180)]);
        validate(type.value === PeAppointmentsTypesEnum.Group, controls.maxInvitees, [...required, Validators.max(50)]);
      }));
  }

  private formLoadingStatus(isLoading: boolean): void {
    this.loading = isLoading;
    this.peOverlayConfig.doneBtnTitle = isLoading
      ? this.translateService.translate('appointments-app.actions.loading')
      : this.translateService.translate('appointments-app.actions.save');
    this.peOverlayConfig.isLoading = isLoading;
    this.cdr.markForCheck();
  }

  private getAppointmentType(appointmentTypeId: string): Observable<any> {
    return this.peAppointmentsTypesApiService
      .getAppointmentType(appointmentTypeId)
      .pipe(
        tap((appointmentType) => {
          this.typeForm.patchValue(appointmentType);
        }),
        catchError((error) => {
          this.formLoadingStatus(false);

          return of(error);
        }));
  }

  public getControlError({ errors }: AbstractControl, fieldTranslationKey: string): string {
    const lastError = Object.keys(errors ?? { unknown: true }).pop();

    return `appointments-app.type_editor.${fieldTranslationKey}.errors.${typeFormControlsErrors[lastError]}`;
  }

  private readonly save = (): void => {
    this.validateControls$.next(true);
    const { dirty, invalid, valid, value } = this.typeForm;

    if (dirty && valid) {
      const appointmentData: PeAppointmentsTypeInterface = {
        dateRange: !value.indefinitelyRange
          ? Number(value.dateRange)
          : null,
        description: value.description,
        duration: Number(value.duration),
        eventLink: value.eventLink ?? '',
        indefinitelyRange: value.indefinitelyRange,
        isDefault: value.isDefault,
        isTimeAfter: value.isTimeAfter,
        isTimeBefore: value.isTimeBefore,
        maxInvitees: value.type === PeAppointmentsTypesEnum.Group
          ? Number(value.maxInvitees)
          : null,
        name: value.name,
        schedule: value.schedule,
        timeAfter: value.isTimeAfter
          ? Number(value.timeAfter)
          : null,
        timeBefore: value.isTimeBefore
          ? Number(value.timeBefore)
          : null,
        type: value.type,
        unit: value.unit,
      };

      of(value._id)
        .pipe(
          switchMap((appointmentTypeId) => {
            this.formLoadingStatus(true);

            return appointmentTypeId
              ? this.peAppointmentsTypesApiService.updateAppointmentType(appointmentTypeId, appointmentData)
              : this.peAppointmentsTypesApiService.createAppointmentType(appointmentData);
          }),
          tap((appointmentData) => {
            this.peOverlayConfig.onSaveSubject$.next({ appointmentData, isUpdate: !!value._id });
          }),
          catchError((error) => {
            this.formLoadingStatus(false);

            return of(error);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else if (dirty || invalid) {
      this.cdr.detectChanges();
    } else {
      this.peAppointmentsReferenceService.appointmentEditor.close();
    }
  }
}
