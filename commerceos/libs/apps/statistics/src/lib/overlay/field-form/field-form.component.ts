import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { skip, take, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayRef, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeDateTimePickerService } from '@pe/ui';

import { PeWidgetService } from '../../infrastructure';
import {
  ConfirmDialogContentsInterface,
  ConfirmDialogService,
} from '../../shared/confirm-dialog/confirm-dialog.service';
import { afterFromDateValidator } from '../../shared/Validators/after-from-date.directive';


interface FieldOption {
  label: string;
  value: string;
}

@Component({
  selector: 'peb-field-form',
  templateUrl: './field-form.component.html',
  styleUrls: ['./field-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeFieldFormComponent implements OnInit, OnDestroy {
  readonly destroyed$ = new ReplaySubject<boolean>();
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  body: HTMLElement = document.body;

  /**
   * Show/Hide select that determines if field is Text or Data
   * Mainly used to hide it if field is text or data only
   */
  showFieldTypeSelect = true;

  /** Field type options */
  fieldType: FieldOption[] = [
    { label: 'Text', value: 'text' },
    { label: 'Data', value: 'data' },
  ];

  /** Time frame options */
  timeFrames: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.today'), value: 'today' },
    {
      label: this.translateService.translate('statistics.form_fields.time_frame_options.yesterday'),
      value: 'yesterday',
    },
    {
      label: this.translateService.translate('statistics.form_fields.time_frame_options.last_week'),
      value: 'last week',
    },
    {
      label: this.translateService.translate('statistics.form_fields.time_frame_options.last_month'),
      value: 'last month',
    },
    {
      label: this.translateService.translate('statistics.form_fields.time_frame_options.last_year'),
      value: 'last year',
    },
    {
      label: this.translateService.translate('statistics.form_fields.time_frame_options.date_range'),
      value: 'date_range',
    },
  ];

  /** Currency options */
  currencies: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.currency_options.all'), value: 'all' },
    { label: this.translateService.translate('statistics.form_fields.currency_options.usd'), value: 'USD' },
    { label: this.translateService.translate('statistics.form_fields.currency_options.eur'), value: 'EUR' },
    { label: this.translateService.translate('statistics.form_fields.currency_options.dkk'), value: 'DKK' },
    { label: this.translateService.translate('statistics.form_fields.currency_options.se'), value: 'SE' },
    { label: this.translateService.translate('statistics.form_fields.currency_options.nok'), value: 'NOK' },
  ];

  /** Line graph options */
  lineGraphGranularity: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.hourly'), value: 'hour' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.daily'), value: 'day' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.weekly'), value: 'week' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.monthly'), value: 'month' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.yearly'), value: 'year' },
  ];

  /** Devices options */
  devices: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.devices_options.all'), value: 'all' },
    { label: this.translateService.translate('statistics.form_fields.devices_options.desktop'), value: 'Desktop' },
    { label: this.translateService.translate('statistics.form_fields.devices_options.tablet'), value: 'Tablet' },
    { label: this.translateService.translate('statistics.form_fields.devices_options.mobile'), value: 'Mobile' },
  ];

  /** Browsers options */
  browsers: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.browsers_options.all'), value: 'all' },
  ];

  /** Channels options */
  channels: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.channels_options.all'), value: 'all' },
  ];

  /** Payment methods options */
  paymentMethods: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.payment_method_options.all'), value: 'all' },
  ];

  /** Field type control */
  fieldTypeControl = this.formBuilder.control(null);
  /** Field name control */
  nameControl = this.formBuilder.control('');

  /** Field data control group */
  fieldForm = this.formBuilder.group({
    metrics: null,
    metricsType: null,
    currency: 'all',
    channel: 'all',
    paymentMethod: null,
    browser: 'all',
    device: 'all',
    timeFrame: [],
    lineGraphGranularity: [],
    dateTimeTo: [],
    dateTimeFrom: [],
  });

  /** Used to get metrics options */
  metrics;
  /** Used to get metric type options */
  metricsType;

  constructor(
    private formBuilder: FormBuilder,
    public widgetService: PeWidgetService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private confirmService: ConfirmDialogService,
    private envService: EnvService,
    private dateTimePicker: PeDateTimePickerService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
  ) {
    this.matIconRegistry.addSvgIcon(
      `datetime-picker`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/datetime-picker-icon.svg'),
    );
  }

  ngOnInit(): void {
    this.nameControl.patchValue(this.overlayData.fieldNameForm.value, { emitEvent: false });
    this.fieldForm.get('paymentMethod').setValue(['all']);

    /** Whether field is only text */
    if (this.isOnlyName()) {
      this.fieldTypeControl.patchValue('text');
      this.fieldTypeControl.disable();
      this.showFieldTypeSelect = false;
    }

    /** Whether field is only data */
    if (this.widgetService.viewType === 'LineGraph' && this.overlayData.fieldId === 2) {
      this.fieldTypeControl.patchValue('data');
      this.fieldTypeControl.disable();
      this.showFieldTypeSelect = false;
    }

    if (this.overlayData.fieldNameForm.value !== `Field ${this.overlayData.fieldId + 1}`) {
      this.fieldTypeControl.patchValue('text');
    }

    /** Maps metrics */
    this.metrics = this.widgetService.metricTypes
      .map((item) => {
        const fields = [];
        const formName = item.type
          .split(' ')
          .map((name, index) => {
            if (index === item.type.split(' ').length - 1) {
              return name;
            }

            return name.toLowerCase();
          })
          .join('');
        item.list.forEach((element) => {
          if (element.types.includes(this.widgetService.selectedApp)) {
            fields.push({
              label: this.translateService.translate(`statistics.form_fields.metric_optons.${element.name}`),
              value: element.name,
            });
          }
        });

        return {
          formName,
          type: this.translateService.translate(
            `statistics.form_fields.metric_groups.${item.type.replace(' ', '_').toLowerCase()}`,
          ),
          list: fields,
        };
      })
      .filter(item => item.list.length !== 0);

    /** Adds browsers from backend data */
    this.browsers = [
      ...this.browsers,
      ...this.widgetService.browsers.map<FieldOption>((option) => {
        return {
          label: this.translateService.translate(
            `statistics.form_fields.browsers_options.${option.title.toLowerCase()}`,
          ),
          value: option.value,
        };
      }),
    ];

    /** Adds channels from backend data */
    this.channels = [...this.channels, ...this.widgetService.appChannels];

    /** Adds payment methods from backend data */
    this.paymentMethods = [...this.paymentMethods, ...this.widgetService.paymentMethods];

    /** Patches values into fields */
    if (this.widgetService.fieldForms[this.overlayData.fieldId]) {
      this.fieldForm.patchValue(this.widgetService.fieldForms[this.overlayData.fieldId], { emitEvent: false });
      if (this.widgetService.fieldForms[this.overlayData.fieldId].metrics) {
        this.metricsType = this.metrics.filter(
          item => item.formName === this.widgetService.fieldForms[this.overlayData.fieldId].metrics,
        )[0];
      }

      this.fieldTypeControl.patchValue('data');
      this.cdr.detectChanges();
    }

    this.fieldForm.valueChanges
      .pipe(
        tap((formValue) => {
          if (formValue.timeFrame !== 'date_range') {
            formValue.dateTimeFrom = null;
            formValue.dateTimeTo = null;
          }
          this.widgetService.fieldForms[this.overlayData.fieldId] = formValue;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
    this.fieldForm.get('metrics').valueChanges.subscribe((val) => {
      this.fieldForm.get('metricsType').reset(null, { emitEvent: false });
      this.metricsType = this.metrics.filter(item => item.formName === val)[0];
      this.cdr.detectChanges();
    });

    this.fieldForm.get('paymentMethod').valueChanges.subscribe((value) => {
      if (value[value.length - 1] !== 'all') {
        const newValue = value.filter(item => item !== 'all');
        this.fieldForm.get('paymentMethod').patchValue(newValue, { emitEvent: false });
      }
      if (value[value.length - 1] === 'all') {
        this.fieldForm.get('paymentMethod').patchValue(['all'], { emitEvent: false });
      }
    });

    this.fieldTypeControl.valueChanges.subscribe((value) => {
      if (value === 'text') {
        this.fieldForm.reset({
          currency: 'all',
          channel: 'all',
          metrics: null,
          metricsType: null,
          paymentMethod: ['all'],
          browser: 'all',
          device: 'all',
          timeFrame: [],
          lineGraphGranularity: [],
          dateTimeTo: [],
          dateTimeFrom: [],
        });
        delete this.widgetService.fieldForms[this.overlayData.fieldId];
      }
      if (value === 'data') {
        this.overlayData.fieldNameForm.patchValue(`Field ${this.overlayData.fieldId + 1}`);
      }
    });

    this.overlayConfig.onSave$
      .pipe(
        skip(1),
        tap((onSaved: { isSaved: boolean; overlayRef: PeOverlayRef }) => {
          if (onSaved.isSaved) {
            if (this.fieldTypeControl.value === 'text') {
              this.overlayData.fieldNameForm.patchValue(this.nameControl.value);
              onSaved.overlayRef.close();
            } else {
              const isValid = this.checkValidity();
              if (isValid) {
                if (this.fieldTypeControl.value === 'data') {
                  onSaved.overlayRef.close();
                }
              }
            }
          } else {
            const isValid = this.checkValidity();
            if (!isValid) {
              delete this.widgetService.fieldForms[this.overlayData.fieldId];

              onSaved.overlayRef.close();
              this.cdr.detectChanges();
            } else {
              onSaved.overlayRef.close();
              this.cdr.detectChanges();
            }
          }
          this.cdr.detectChanges();
        }),
      )
      .subscribe();
  }

  /** Opens datepicker dialog */
  openDatepicker(event, controlName: string): void {
    let name = '';
    if (controlName === 'dateTimeFrom') {
      name = 'Date From';
    } else {
      name = 'Date To';
    }

    const dialogRef = this.dateTimePicker.open(event, {
      theme: this.theme,
      config: { headerTitle: name, range: false },
    });
    dialogRef.afterClosed.subscribe((date) => {
      if (date.start) {
        const formatedDate = moment(date.start).format('DD.MM.YYYY');
        this.fieldForm.get(controlName).patchValue(formatedDate);
      }
    });
  }

  /** Gets selected payments methods for creating chips */
  getChipLabel(value): string {
    const item = this.paymentMethods.find(element => element.value === value);

    return item.label;
  }

  /** Whether to show chips or not */
  showChips() {
    if (
      this.fieldForm.get('paymentMethod').value.length === 1 &&
      this.fieldForm.get('paymentMethod').value[0] === 'all'
    ) {
      return false;
    }

    return true;
  }

  /** Resets all fields */
  onReset() {
    const contents: ConfirmDialogContentsInterface = {
      title: this.translateService.translate('statistics.confirm_dialog.are_you_sure'),
      subtitle: this.translateService.translate('statistics.confirm_dialog.subtitle_reset'),
      confirmButton: this.translateService.translate('statistics.action.yes'),
      declineButton: this.translateService.translate('statistics.action.no'),
    };
    this.confirmService.openConfirmDialog(this.theme, contents);
    this.confirmService.afterClosed.pipe(take(1)).subscribe((isConfirm) => {
      if (isConfirm) {
        this.fieldForm.reset({
          currency: 'all',
          channel: 'all',
          metrics: null,
          metricsType: null,
          paymentMethod: ['all'],
          browser: 'all',
          device: 'all',
          timeFrame: [],
          lineGraphGranularity: [],
          dateTimeTo: [],
          dateTimeFrom: [],
        });
        delete this.widgetService.fieldForms[this.overlayData.fieldId];
        this.fieldTypeControl.reset('');
        this.cdr.detectChanges();
      }
    });
  }

  /** Checks validity of fields */
  checkValidity() {
    const controls = this.fieldForm.controls;

    if (controls.metrics.value) {
      controls.metricsType.setValidators([Validators.required]);
      controls.metricsType.updateValueAndValidity();
    } else {
      controls.metrics.setValidators([Validators.required]);
      controls.metrics.updateValueAndValidity();
    }

    if (controls.timeFrame.value === 'date_range') {
      const dateFrom = controls.dateTimeFrom.value;
      controls.dateTimeFrom.setValidators([Validators.required]);
      controls.dateTimeFrom.updateValueAndValidity();
      controls.dateTimeTo.setValidators([Validators.required, afterFromDateValidator(dateFrom)]);
      controls.dateTimeTo.updateValueAndValidity();
    }

    if (this.widgetService.viewType === 'LineGraph' && this.overlayData.fieldId === 2) {
      controls.lineGraphGranularity.setValidators([Validators.required]);
      controls.lineGraphGranularity.updateValueAndValidity();
    }

    this.cdr.detectChanges();

    if (this.fieldForm.valid) {
      return true;
    }

    return false;
  }

  /** Whether field is only text */
  isOnlyName() {
    if (this.overlayData.fieldId === 0) {
      return true;
    }
    if (this.widgetService.viewType === 'DetailedNumbers') {
      if (this.overlayData.fieldId === 1) {return true;}
      if (this.overlayData.fieldId === 2) {return true;}
      if (this.overlayData.fieldId === 3) {return true;}
    }

    return false;
  }

  /** Dependant on selected app, shows right dimension fields */
  doesDimensionExist(dimension) {
    if (this.widgetService.dimensionTypes[dimension].types.includes(this.widgetService.selectedApp)) {
      return true;
    }

    return false;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
