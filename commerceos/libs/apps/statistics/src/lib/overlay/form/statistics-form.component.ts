import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { BehaviorSubject, EMPTY, ReplaySubject, throwError } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG } from '@pe/overlay-widget';

import { ActualPeStatisticsApi, PeWidgetService, ucfirst } from '../../infrastructure';
import { mapWidgetData } from '../../shared/utils';
import { MOCK_DATA } from '../../widgets/mock.data';
import { PeFieldFormComponent } from '../field-form/field-form.component';
import { SizeOptions } from '../widget-size/widget-size.component';


export const sizeOptions: SizeOptions[] = [
  {
    size: 'small',
    graphView: [158, 57],
  },
  {
    size: 'medium',
    graphView: [308, 57],
  },
  {
    size: 'large',
    graphView: [308, 205],
  },
];

export const FIELD_NUMBER = {
  ['DetailedNumbers-large']: 22,
  ['DetailedNumbers-medium']: 10,
  ['Percentage']: 3,
  ['SimpleNumbers']: 3,
  ['TwoColumns']: 6,
  ['LineGraph']: 4,
};

@Component({
  selector: 'peb-statistics-form',
  templateUrl: './statistics-form.component.html',
  styleUrls: ['./statistics-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStatisticsFormComponent implements OnInit, OnDestroy {
  readonly destroyed$ = new ReplaySubject<boolean>();
  body: HTMLElement = document.body;

  /** Variable containing theme */
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  /** Widget config variable */
  widgetConfig: any = { size: this.widgetService.selectedWidgetSize, viewType: this.widgetService.viewType };

  /** Widget form fields */
  addWidgetForm: FormGroup = this.formBuilder.group({
    name: this.formBuilder.control(ucfirst(this.widgetService.selectedApp)),
    fields: this.formBuilder.array([]),
  });

  addWidgetFormValue: any;

  /** Whether line graph is required */
  lineGraphDataRequired = false;

  /** number of widget form fields */
  numbers: number[] = [];

  /** Form dialog ref */
  formDialogRef;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ActualPeStatisticsApi,
    private overlayWidgetService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    public widgetService: PeWidgetService,
    private translateService: TranslateService,
    private envService: EnvService,
    private snackBar: MatSnackBar,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  /**
   * Returns graph size depending on widget size
   *
   * @param size graph size
   */
  getGraphView(size) {
    return sizeOptions.find(sizeOption => sizeOption.size === size)?.graphView;
  }

  /** Returns form fields form controls */
  getControls() {
    return (this.addWidgetForm.get('fields') as FormArray).controls;
  }

  /** Sets widget data source for preview */
  formPreviewDataSource = (formValue) => {
    this.addWidgetFormValue = formValue;
    const perChunk = 3;

    const previewDataSource = [formValue.name, null].concat(formValue.fields).reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / perChunk);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }

      if (this.widgetService.viewType === 'LineGraph' && chunkIndex === 1 && index === 4) {
        resultArray[chunkIndex].push(MOCK_DATA.LineGraph[1][1]);
      } else {
        resultArray[chunkIndex].push(item);
      }

      return resultArray;
    }, []);

    this.widgetConfig = {
      ...this.widgetConfig,
      name: formValue.name,
      viewType: this.widgetService.viewType,
      dataSource: mapWidgetData(previewDataSource),
    };

    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.getDimensionsAndMetric();
    this.widgetService.fieldForms = {};
    this.body.classList.add('remove-overlay-content-padding');

    /** Gets number of form fields depending on widget type and size */
    if (this.widgetService.viewType === this.widgetService.widgetType.DetailedNumbers) {
      this.numbers = Array(FIELD_NUMBER[`${this.widgetService.viewType}-${this.widgetService.selectedWidgetSize}`])
        .fill(1)
        .map((x, i) => i + 1);
    } else {
      this.numbers = Array(FIELD_NUMBER[this.widgetService.viewType])
        .fill(1)
        .map((x, i) => i + 1);
    }

    /** Adds controls to form field array depending on the number of fields */
    this.numbers.forEach((number) => {
      (this.addWidgetForm.get('fields') as FormArray).push(new FormControl(`Field ${number}`, Validators.required));
    });
    setTimeout(() => {
      this.formPreviewDataSource(this.addWidgetForm.value);
    });
    this.addWidgetForm.valueChanges.pipe(tap(this.formPreviewDataSource), takeUntil(this.destroyed$)).subscribe();

    this.overlayConfig.onSave$
      .pipe(
        tap((onSave) => {
          this.lineGraphDataRequired = false;
          if (onSave) {
            const data: any = {
              type: this.widgetService.selectedApp,
              name: this.widgetConfig.name,
              size: this.widgetService.selectedWidgetSize,
              viewType: this.widgetService.viewType,
              widgetSettings: [],
            };
            if (this.addWidgetFormValue?.fields) {
              data.widgetSettings.push([
                [{ type: 'text', value: this.widgetConfig.name ? this.widgetConfig.name : 'Transactions' }],
                [],
                [{ type: 'text', value: this.addWidgetFormValue?.fields[0] }],
              ]);

              const fields = this.addWidgetFormValue?.fields.slice(1, this.addWidgetFormValue.fields.length);
              let row: any[][] = [];
              Object.values(fields).forEach((value: string, i: number) => {
                let field = [];
                if (value === `Field ${i + 2}`) {
                  let currentForm = this.widgetService.fieldForms[i + 1];
                  if (currentForm) {
                    const gatheredData = this.gatherDataFromField(field, currentForm);
                    field = gatheredData.field;
                    currentForm = gatheredData.currentForm;
                  }
                } else {
                  field.push({ value, type: 'text' });
                }
                row.push(field);
                if ((i + 1) % 3 === 0 || ((i + 1) % 3 !== 0 && i === fields.length - 1)) {
                  data.widgetSettings.push(row);
                  row = [];
                }
              });
              if (this.widgetService.viewType === 'LineGraph' && data.widgetSettings[1][1].length === 0) {
                this.lineGraphDataRequired = true;
                this.cdr.detectChanges();
              } else {
                if (this.widgetService.currentDashboard?.id) {
                  this.createWidget(data);
                  this.widgetService.overlayRef.close();
                }
              }
            }
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  /** Posts new widget */
  createWidget(data) {
    this.apiService
      .createSingleWidget(this.widgetService.currentDashboard?.id, data)
      .pipe(
        switchMap((response) => {
          return this.apiService.getWidgets(this.widgetService.currentDashboard?.id);
        }),
        tap((widgets: any[]) => {
          this.widgetService.webSocket.close();
          this.widgetService.webSocket = new WebSocket(this.env.backend.statisticsWs);
          this.widgetService.widgets = widgets.map((widget: any) => {
            return {
              type: widget.type,
              id: widget._id,
              widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
              viewType: widget.viewType,
              size: widget.size ?? this.widgetService.widgetSize.Large,
              edit: false,
            };
          });
        }),
        catchError((err) => {
          if (err.status === 503 && 500) {
            this.snackBar.open('Oh, no! Server returns error!');
          }

          return throwError(err.message);
        }),
      )
      .subscribe();
  }

  /** Gathers data form form field and creates correct filter for that form */
  gatherDataFromField(field, currentForm) {
    if (currentForm.metricsType) {
      field.push({ type: 'metric', value: currentForm.metricsType });
    }

    let granularity: string;
    let dateTimeRelative: string;
    switch (currentForm.timeFrame) {
      case 'today':
        dateTimeRelative = 'today';
        break;
      case 'yesterday':
        dateTimeRelative = 'yesterday';
        break;
      case 'last month':
        dateTimeRelative = 'last month';
        break;
      case 'last week':
        dateTimeRelative = 'last week';
        break;
      case 'last year':
        dateTimeRelative = 'last year';
        break;
    }

    if (currentForm.lineGraphGranularity) {
      granularity = currentForm.lineGraphGranularity;
    }

    if (granularity) {
      field.push({ type: 'granularity', value: granularity });
    }

    if (dateTimeRelative) {
      field.push({ type: 'dateTimeRelative', value: dateTimeRelative });
    }

    if (currentForm.dateTimeFrom) {
      const dateTimeFrom = moment(currentForm.dateTimeFrom, 'DD.MM.YYYY').toISOString();

      field.push({
        type: 'dateTimeFrom',
        value: dateTimeFrom,
      });
    }
    if (currentForm.dateTimeTo) {
      const dateTimeTo = moment(currentForm.dateTimeTo, 'DD.MM.YYYY').toISOString();

      field.push({
        type: 'dateTimeTo',
        value: dateTimeTo,
      });
    }

    const dimensions = Object.keys(this.widgetService.dimensionTypes).map(
      key => this.widgetService.dimensionTypes[key].name,
    );

    Object.keys(currentForm).forEach((settingField) => {
      if (dimensions.includes(settingField)) {
        if (currentForm[settingField] instanceof Array) {
          if (!currentForm[settingField].includes('all')) {
            field.push({
              type: 'filter',
              value: {
                name: this.widgetService.dimensionTypes[settingField].name,
                operator: 'equals',
                values: currentForm[settingField],
              },
            });
          }
        } else {
          if (currentForm[settingField] !== 'all') {
            field.push({
              type: 'filter',
              value: {
                name: this.widgetService.dimensionTypes[settingField].name,
                value: currentForm[settingField],
              },
            });
          }
        }
      }
    });
    if (field.find(cell => cell.type === 'metric')) {
      field.push({
        type: 'filter',
        value: {
          name: this.widgetService.dimensionTypes.businessId.name,
          value: this.envService.businessId,
        },
      });
    }

    return { field, currentForm };
  }

  ngOnDestroy() {
    this.body.classList.remove(`wider-overlay`);
    this.body.classList.remove(`remove-overlay-content-padding`);
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  /**
   * Opens edit form field dialog
   *
   * @param number field number
   * @param readonlyName Field name
   */
  openFieldForm(number: number, readonlyName: boolean) {
    this.lineGraphDataRequired = false;
    this.cdr.detectChanges();
    const onSaveSubject$ = new BehaviorSubject(null);
    const data = {
      readonlyName,
      fieldId: number,
      fieldNameForm: this.getControls()[number],
    };
    const headerConfig = {
      onSaveSubject$,
      title: this.getControls()[number].value,
      backBtnTitle: this.translateService.translate('statistics.action.back'),
      backBtnCallback: () => {
        onSaveSubject$.next({
          isSaved: false,
          overlayRef: this.formDialogRef,
        });
      },
      doneBtnTitle: this.translateService.translate('statistics.action.save'),
      doneBtnCallback: () => {
        onSaveSubject$.next({
          isSaved: true,
          overlayRef: this.formDialogRef,
        });
      },
      onSave$: onSaveSubject$.asObservable(),
      theme: this.theme,
    } as any;
    this.formDialogRef = this.overlayWidgetService.open({
      data,
      headerConfig,
      component: PeFieldFormComponent,
      backdropClick: () => {
        this.formDialogRef.close();

        return EMPTY;
      },
    });
    this.formDialogRef.afterClosed.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  /** Gets dimension and metric types */
  getDimensionsAndMetric() {
    this.apiService
      .getDimensions()
      .pipe(
        tap((res: any) => {
          this.widgetService.dimensionTypes = res.reduce((accu, item) => {
            accu[item.name] = { name: item.name, types: item.types };

            return { ...accu };
          }, {});
        }),
      )
      .subscribe();
    this.apiService
      .getMetrics()
      .pipe(
        tap((res: any) => {
          this.widgetService.metricTypes = res.filter(item => item.type !== 'BrowserFilter');
          this.widgetService.browsers = res.filter(item => item.type === 'BrowserFilter')[0].list;
        }),
      )
      .subscribe();
  }
}
