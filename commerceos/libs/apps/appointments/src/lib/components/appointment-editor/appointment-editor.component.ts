import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import moment from 'moment';
import { BehaviorSubject, concat, forkJoin, merge, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  last,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { AppType, PeDestroyService, PeGridItem } from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import { DockerItemInterface, DockerState } from '@pe/docker';
import { TranslateService } from '@pe/i18n-core';
import {
  OverlayHeaderConfig,
  PeOverlayConfig,
  PeOverlayWidgetService,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
} from '@pe/overlay-widget';
import { ContactsAppState, RootFolderContactItemInterface } from '@pe/shared/contacts';
import { PeCustomValidators } from '@pe/shared/custom-validators';
import { ProductsAppState } from '@pe/shared/products';
import { SnackbarService } from '@pe/snackbar';
import { PebTimePickerService, PeDateTimePickerService } from '@pe/ui';

import { PeAppointmentsMeasurementsEnum, PeAppointmentsRoutingPathsEnum, WeekDay } from '../../enums';
import { FieldDto, PeAppointmentsAppointmentInterface, PeAppointmentsAvailabilityInterface } from '../../interfaces';
import {
  PeAppointmentsAvailabilityApiService,
  PeAppointmentsCalendarApiService,
  PeAppointmentsPickerService,
  PeAppointmentsReferenceService,
} from '../../services';
import { PeAppointmentsCutomFieldEditorComponent } from '../custom-field-editor';

@Component({
  selector: 'pe-appointment-editor',
  templateUrl: 'appointment-editor.component.html',
  styleUrls: ['../form-preloader.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeAppointmentsAppointmentEditorComponent implements OnInit {
  @SelectSnapshot(ContactsAppState.contacts) contacts: RootFolderContactItemInterface[];
  @SelectSnapshot(DockerState.dockerItems) dockerItems: DockerItemInterface[];
  @SelectSnapshot(ProductsAppState.products) products: PeGridItem[];

  private readonly cancelBtn = this.translateService.translate('appointments-app.actions.cancel');
  private readonly closeBtn = this.translateService.translate('appointments-app.actions.close');
  private readonly loadingBtn = this.translateService.translate('appointments-app.actions.loading');
  private readonly saveBtn = this.translateService.translate('appointments-app.actions.save');

  public readonly theme = this.peOverlayConfig.theme;

  public animatedFields = true;
  public loading = false;

  public dateMask = [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];
  public timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ' ', /[aApP]/, /[mM]/];

  public appointmentForm = this.formBuilder.group({
    _id: [],
    allDay: [false],
    contacts: [[]],
    customFields: [[]],
    date: [],
    duration: [30],
    fields: [[]],
    location: [],
    measuring: [PeAppointmentsMeasurementsEnum.Minute],
    note: [],
    products: [[]],
    repeat: [true],
    time: [],
  });

  private daysToDisable: number[] = [];
  private currentDay: WeekDay;
  private availability: PeAppointmentsAvailabilityInterface;
  private week: WeekDay[];

  productsData = [];
  public readonly openProductsFun = this.openPicker.bind(this, AppType.Products);
  public readonly openContactsFun = this.openPicker.bind(this, AppType.Contacts);
  public readonly measurements = [
    {
      label: 'Hrs',
      value: PeAppointmentsMeasurementsEnum.Hour,
    },
    {
      label: 'Min',
      value: PeAppointmentsMeasurementsEnum.Minute,
    },
  ];

  public readonly contacts$ = new BehaviorSubject<any[]>([]);
  public readonly filterContacts$ = new Subject<string>();

  public readonly products$ = new BehaviorSubject<any[]>([]);
  public readonly filterProducts$ = new Subject<string>();

  private readonly afterClosePicker$ = this.peAppointmentsPickerService
    .changeSaveStatus$
    .pipe(
      take(1),
      filter(Boolean),
      finalize(() => {{
        this.cdr.detectChanges();
      }}),
      takeUntil(this.destroy$));

  private readonly validateControls$ = new BehaviorSubject<boolean>(false);
  private readonly controlsValidation$ = merge(
    this.appointmentForm.controls.allDay.valueChanges,
    this.appointmentForm.controls.measuring.valueChanges,
    this.validateControls$,
  ).pipe(
      tap(() => {
        const { allDay, date, duration, measuring, time } = this.appointmentForm.controls;
        const maxDuration = measuring.value === PeAppointmentsMeasurementsEnum.Hour ? 12 : 720;
        const required = this.validateControls$.value ? [Validators.required] : [];

        if (allDay.value) {
          duration.disable();
          time.clearValidators();
        } else {
          duration.enable();
          duration.setValidators([...required, Validators.max(maxDuration), PeCustomValidators.PositiveInteger(0)]);
          time.setValidators([...required]);
        }

        date.setValidators([...required]);
        date.updateValueAndValidity();
        duration.updateValueAndValidity();
        time.updateValueAndValidity();
      }));

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
    private readonly destroy$: PeDestroyService,

    private peAppointmentsCalendarApiService: PeAppointmentsCalendarApiService,
    private peAppointmentsPickerService: PeAppointmentsPickerService,
    private peAppointmentsReferenceService: PeAppointmentsReferenceService,
    private peAppointmentsAvailabilityApiService: PeAppointmentsAvailabilityApiService,
  ) {
    this.loading = true;
    this.peAppointmentsReferenceService.backdropClick = this.closeEditor;
    this.peOverlayConfig.backBtnCallback = this.closeEditor;
    this.peOverlayConfig.doneBtnCallback = () => {
      !this.loading && this.save();
    };
    this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
    this.peOverlayConfig.isLoading = true;
  }

  ngOnInit(): void {
    const appointmentId = this.peOverlayData.id;
    const getAppointment$ = appointmentId
      ? this.getAppointment(appointmentId)
      : of(null);
    const initAppointmentForm$ = concat(
      getAppointment$,
      this.getFields(appointmentId),
    ).pipe(
        last(),
        tap(() => {
          this.loading = false;
          this.peOverlayConfig.doneBtnTitle = this.saveBtn;
          this.peOverlayConfig.isLoading = false;
          this.cdr.markForCheck();
          this.appointmentForm.markAsPristine();
        }));
    const getDefaultAvailability$ = this.peAppointmentsAvailabilityApiService.getDefaultAppointmentAvailability().pipe(
      filter(Boolean),
      tap((availability: PeAppointmentsAvailabilityInterface) => {
        this.availability = availability;
        const week = Object.values(WeekDay);
        //need to bind with datepicker calendar days order
        week.pop();
        week.unshift(WeekDay.Sunday);
        this.week = week;
        const availabilityDays = availability.weekDayAvailability.reduce((array, day) => {
          day.isEnabled && array.push(day.name);

          return array;
        }, []);
        this.daysToDisable = week.reduce((array, day) => {
          if (!availabilityDays.includes(day)) {
            array.push(week.indexOf(day));
          }

          return array;
        }, []);
      }),
    );

    this.animatedFields = !appointmentId;

    merge(
      initAppointmentForm$,
      getDefaultAvailability$,
      this.controlsValidation$,
      this.filterContacts$.pipe(
        debounceTime(400),
        startWith(''),
        switchMap(filter => !filter ? of([]) : this.peAppointmentsCalendarApiService.getContacts(filter)),
        tap(conatcts => this.contacts$.next(conatcts)),
      ),
      this.filterProducts$.pipe(
        debounceTime(400),
        startWith(''),
        switchMap(filter => !filter ? of([]) : this.peAppointmentsCalendarApiService.getProducts(filter)),
        tap(products => this.products$.next(products)),
      ),
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  public get durationError(): string {
    const { errors } = this.appointmentForm.controls.duration;
    const error = errors?.required
      ? 'required'
      : errors?.notPositiveInt
        ? 'not_positive_integer'
        : 'max_hours';

    return 'appointments-app.appointment_editor.duration.error.' + error;
  }

  private readonly closeEditor = () => {
    if (this.appointmentForm.dirty && !this.loading) {
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
        ? 'appointments-app.confirm_dialog.cancel.appointment_editor.editing.title'
        : 'appointments-app.confirm_dialog.cancel.appointment_editor.creating.title';
      const headingSubtitle = isEditing
        ? 'appointments-app.confirm_dialog.cancel.appointment_editor.editing.subtitle'
        : 'appointments-app.confirm_dialog.cancel.appointment_editor.creating.subtitle';
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

  private getAppointment(appointmentId: string): Observable<any> {
    return this.peAppointmentsCalendarApiService
      .getAppointment(appointmentId)
      .pipe(
        switchMap((appointment: PeAppointmentsAppointmentInterface) => {
          const { contacts, products, ...appointmentData } = appointment;
          this.appointmentForm.patchValue(appointmentData);
          const getContacts$ = contacts.length
            ? this.peAppointmentsCalendarApiService.getContacts(contacts)
            : of([]);
          const getProducts$ = products.length
            ? this.peAppointmentsCalendarApiService.getProducts(products)
            : of([]);

          return forkJoin([
            getContacts$,
            getProducts$,
          ]);
        }),
        tap(([contacts, products]) => {
          this.appointmentForm.patchValue({ contacts, products });
        }));
  }

  private getFields(appointmentId?: string): Observable<any> {
    return this.peAppointmentsCalendarApiService
      .getCustomFields(appointmentId)
      .pipe(
        tap((customFields: FieldDto[]) => {
          const { fields } = this.appointmentForm.value;
          appointmentId && customFields.forEach((customField) => {
            const indexOfField = fields.findIndex(field => field.fieldId === customField._id);
            customField.value = indexOfField !== -1
              ? fields[indexOfField].value
              : '';
          });
          this.appointmentForm.patchValue({ customFields });
        }));
  }

  public maskRule(currentMask: (string | RegExp)[]): any {
    return {
      guide: false,
      mask: currentMask,
      showMask: false,
    };
  };

  private readonly save = (): void => {
    this.validateControls$.next(true);
    const { controls, dirty, invalid, valid } = this.appointmentForm;

    if (dirty && valid) {
      const fields = controls.customFields.value
        .map(field => ({
          fieldId: field._id,
          value: field?.value ? field.value.toString() : '',
        }))

      const { appointmentNetwork, parentFolderId } = this.peOverlayData;
      const appointmentData: PeAppointmentsAppointmentInterface = {
        allDay: controls.allDay.value,
        appointmentNetwork,
        contacts: controls.contacts.value.map(contact => contact.id),
        date: controls.date.value,
        duration: Number(controls.duration.value),
        fields: fields.filter(field => field.value !== ''),
        location: controls.location.value,
        measuring: controls.measuring.value,
        note: controls.note.value,
        parentFolderId,
        products: controls.products.value.map(product => product.id),
        repeat: controls.repeat.value,
        time: controls.time.value,
      };

      of(controls._id.value)
        .pipe(
          switchMap((appointmentId) => {
            !appointmentId && delete appointmentData.parentFolderId;
            this.loading = true;
            this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
            this.peOverlayConfig.isLoading = true;

            return appointmentId
              ? this.peAppointmentsCalendarApiService.updateAppointment(appointmentId, appointmentData)
              : this.peAppointmentsCalendarApiService.createAppointment(appointmentData);
          }),
          switchMap((appointment: any) => {
            const { _id, customFields } = this.appointmentForm.value;
            const { customFieldsWithValue, customFieldsWithoutValue } = customFields
              .reduce((separatedFields, customField) => {
                const fieldType = customField.value === ''
                  ? 'customFieldsWithoutValue'
                  : 'customFieldsWithValue';
                separatedFields[fieldType].push(customField);

                return separatedFields;
              }, { customFieldsWithValue: [], customFieldsWithoutValue: [] });

            const fieldsToDelete$ = customFieldsWithoutValue.length
              ? customFieldsWithoutValue
                  .map(field => this.peAppointmentsCalendarApiService.deleteField(field._id))
              : [of([])];
            const updateFieldsIds$ = _id && appointment && customFields && customFields.length > 0
              ? customFieldsWithValue
                  .filter(field => !field.showDefault)
                  .map(field => this.peAppointmentsCalendarApiService.updateFieldId(field._id, appointment._id))
              : [of([])];

            return concat(
              forkJoin([
                ...fieldsToDelete$,
                ...updateFieldsIds$,
              ]),
              of(appointment),
            );
          }),
          last(),
          tap((appointmentData) => {
            this.loading = false;
            this.peOverlayConfig.doneBtnTitle = this.saveBtn;
            this.peOverlayConfig.isLoading = false;
            this.cdr.detectChanges();

            const isUpdate = !!controls._id.value;
            const { applicationScopeElasticId } = this.peOverlayData;
            isUpdate && Object.assign(appointmentData,  { applicationScopeElasticId });
            this.peOverlayConfig.onSaveSubject$.next({ appointmentData, isUpdate });
          }),
          catchError((error) => {
            this.loading = false;
            this.peOverlayConfig.doneBtnTitle = this.saveBtn;
            this.peOverlayConfig.isLoading = false;
            this.cdr.detectChanges();

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

  public openDatepicker(event: MouseEvent, dateControl: AbstractControl): void {
    const dialogRef = this.dateTimePicker.open(event, {
      theme: this.theme,
      position: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: -12,
        offsetY: 12,
      },
      config: {
        headerTitle: 'Date',
        range: false,
        format: 'DD/MM/YYYY',
        maxDate: null,
        daysToDisable: this.daysToDisable,
      },
    });
    dialogRef.afterClosed
      .pipe(
        take(1),
        filter(date => !!date),
        tap((date) => {
          const day = moment(date.start, 'DD/MM/YYYY').day();
          this.currentDay = this.week?.[day];
          dateControl.patchValue(date.start);
          dateControl.markAsDirty();
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public openTimepicker(event: MouseEvent, timeControl: AbstractControl): void {
    const dayRange = this.availability?.weekDayAvailability.find(day => day.name === this.currentDay);
    const rangeTime = dayRange ? { allowedRanges: dayRange.ranges } : {};
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
      timeConfig: { animation: 'fade', time: timeControl.value, ...rangeTime  },
    });
    dialogRef.afterClosed
      .pipe(
        take(1),
        filter(time => !!time),
        tap((time) => {
          timeControl.patchValue(time);
          timeControl.markAsDirty();
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public openCustomFieldEditor(index?: number): void {
    const { controls } = this.appointmentForm;
    const appointmentId = controls._id.value;
    const customFields = [...controls.customFields.value];
    const saveSubject$ = new BehaviorSubject(null);
    const title = index
      ? 'appointments-app.field_editor.title.edit'
      : 'appointments-app.field_editor.title.create';
    const config: PeOverlayConfig = {
      component: PeAppointmentsCutomFieldEditorComponent,
      data: index ? controls.customFields.value[index] : null,
      hasBackdrop: true,
      headerConfig: {
        backBtnTitle: this.cancelBtn,
        doneBtnTitle: this.translateService.translate(`appointments-app.actions.${index ? 'update' : 'add'}`),
        onSaveSubject$: saveSubject$,
        theme: this.theme,
        title: this.translateService.translate(title),
      },
    }
    const customFieldEditor = this.peOverlayWidgetService.open(config);

    saveSubject$
      .pipe(
        skip(1),
        take(1),
        switchMap((field: FieldDto | null) => {
          if (!field) {
            return of(null);
          }

          const name = field.title.toLowerCase().replace(/\s|[^\w]/g, '_').replace(/^[0-9]/, 'custom');
          const fieldToSave = { name, ...field };

          if (index) {
            const type = customFields[index].type;
            delete fieldToSave._id;

            return type === fieldToSave.type
              ? this.peAppointmentsCalendarApiService
                  .updateField(field._id, fieldToSave, appointmentId)
                  .pipe(
                    tap((updatedField: FieldDto) => {
                      customFields[index] = updatedField;
                      controls.customFields.patchValue(customFields);
                      controls.customFields.markAsDirty();
                    }))
              : this.peAppointmentsCalendarApiService
                  .deleteField(customFields[index]._id)
                  .pipe(
                    switchMap(() => this.peAppointmentsCalendarApiService.createField(fieldToSave, appointmentId)),
                    tap((changedField) => {
                      field._id = changedField[name]._id;
                      customFields[index] = field;
                      controls.customFields.patchValue(customFields);
                      controls.customFields.markAsDirty();
                    }));
          } else {
            field.value = '';

            return this.peAppointmentsCalendarApiService.createField(fieldToSave, appointmentId)
              .pipe(
                tap((createdField) => {
                  field._id = createdField[name]._id;
                  controls.customFields.patchValue([...customFields, field]);
                  controls.customFields.markAsDirty();
                }));
          }
        }),
        finalize(() => {
          this.cdr.detectChanges();
          customFieldEditor.close();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public removeCustomField(index: number): void {
    const { controls } = this.appointmentForm;
    const customFields = [...controls.customFields.value];
    this.peAppointmentsCalendarApiService.deleteField(customFields[index]._id)
      .pipe(
        tap(() => {
          customFields.splice(index, 1);
          controls.customFields.patchValue(customFields);
          controls.customFields.markAsDirty();
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private openPicker(appType: AppType): void {
    const app = this.dockerItems?.find(item => item.code === appType);

    if (app?.installed) {
      const baseCalendarUrl = this.router.url.split(PeAppointmentsRoutingPathsEnum.Calendar)[0];
      this.router
        .navigate([baseCalendarUrl, PeAppointmentsRoutingPathsEnum.Calendar, appType])
        .then(() => {
          this.afterClosePicker$
            .pipe(
              tap(() => {
                const itemsToAdd = this[appType]
                  .map(item => ({
                    id: item._id ?? item.id,
                    image: item.image,
                    label: item.title,
                    name: item.title,
                    value: item._id ?? item.id,
                  }));

                const idsForFilter = itemsToAdd.map(item => item.id);
                const control = this.appointmentForm.controls[appType];
                control.patchValue([
                  ...control.value.filter(item => !idsForFilter.includes(item.id)),
                  ...itemsToAdd,
                ]);
              }))
            .subscribe();
        });
    } else {
      this.snackBarShow(app.title);
    }
  }

  private snackBarShow(appTitle: string, success = false) {
    const msg = this.translateService
      .translate('appointments-app.alerts.app_doesnt_installed')
      .replace(/\{app\}/, appTitle);

    this.snackbarService.toggle(true, {
      content: msg,
      duration: 5000,
      iconId: success ? 'icon-commerceos-success' : 'icon-alert-24',
      iconSize: 24,
    });
  }
}
