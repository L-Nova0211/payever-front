import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { BehaviorSubject, EMPTY, ReplaySubject, throwError } from 'rxjs';
import { catchError, map, take, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayRef, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { ActualPeStatisticsApi, PeWidgetService } from '../../infrastructure';
import {
  ConfirmDialogContentsInterface,
  ConfirmDialogService,
} from '../../shared/confirm-dialog/confirm-dialog.service';
import { mapWidgetData } from '../../shared/utils';
import { MOCK_DATA } from '../../widgets/mock.data';
import { PeFieldFormComponent } from '../field-form/field-form.component';
import { SizeOptions } from '../widget-size/widget-size.component';


/** Line graph size options */
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

/** Number of fields dependant on widget type and size */
export const FIELD_NUMBER = {
  ['DetailedNumbers-large']: 22,
  ['DetailedNumbers-medium']: 10,
  ['Percentage']: 3,
  ['SimpleNumbers']: 3,
  ['TwoColumns']: 6,
  ['LineGraph']: 4,
};

interface StatisticsField {
  type: string;
  value: any;
}

@Component({
  selector: 'peb-statistics-edit-form',
  templateUrl: './edit-statistics-form.component.html',
  styleUrls: ['./edit-statistics-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStatisticsEditFormComponent implements OnInit, OnDestroy {
  body: HTMLElement = document.body;

  /** Variable containing theme */
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  /** Whether line graph is required */
  lineGraphDataRequired = false;

  /** Whether screen size is mobile */
  isMobile = window.innerWidth < 620;

  /** Form dialog ref */
  formDialogRef;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ActualPeStatisticsApi,
    private overlayWidgetService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    public widgetService: PeWidgetService,
    private envService: EnvService,
    private translateService: TranslateService,
    private confirmService: ConfirmDialogService,
    private overlayRef: PeOverlayRef,
    private snackBar: MatSnackBar,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  readonly destroyed$ = new ReplaySubject<boolean>();

  /** Widget config variable */
  widgetConfig: any = { size: this.widgetService.selectedWidgetSize, viewType: this.widgetService.viewType };

  /** Widget form fields */
  addWidgetForm: FormGroup = this.formBuilder.group({
    name: this.formBuilder.control('Transactions'),
    fields: this.formBuilder.array([]),
  });

  /** Widget form value */
  addWidgetFormValue: any;

  numbers: number[] = [];

  fieldData = [];

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
      size: this.widgetService.selectedWidgetSize,
    };

    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.getDimensions();
    let metricTypes = [];
    const metricsDone = this.getMetrics().pipe(
      map(() => {
        metricTypes = this.widgetService.metricTypes.map((item) => {
          const groupName = item.type
            .split(' ')
            .map((name, index) => {
              if (index === item.type.split(' ').length - 1) {
                return name;
              }

              return name.toLowerCase();
            })
            .join('');

          const items = item.list.map((element) => {
            return element.name;
          });

          return { groupName, items };
        });

        return EMPTY;
      }),
    );
    this.widgetService.fieldForms = {};
    if (!this.isMobile) {
      this.body.classList.add(`wider-overlay`);
    }
    /** Add class for removing content padding in dialog */
    this.body.classList.add(`remove-overlay-content-padding`);
    this.widgetService.viewType = this.overlayData.data.viewType;
    this.widgetService.selectedWidgetSize = this.overlayData.data.size;
    this.widgetService.selectedApp = { id: this.overlayData.data.type };
    this.widgetConfig.name = this.overlayData.data?.widgetSettings[0][0]?.value;
    this.addWidgetForm.get('name').patchValue(this.overlayData.data?.widgetSettings[0][0]?.value);
    metricsDone.subscribe(() => {
      /** Patches form field data */
      const dimensions = Object.keys(this.widgetService.dimensionTypes)
        .map((key) => {
          if (this.widgetService.dimensionTypes[key].types.includes(this.widgetService.selectedApp)) {
            return this.widgetService.dimensionTypes[key].name;
          }
        })
        .filter((item) => {
          if (item === 'businessId') {
            return false;
          }

          return item !== undefined;
        });
      this.overlayData.data.widgetSettings.forEach((item, index) => {
        if (index < 2) {
          return;
        }
        let formFieldData = {};
        if (item.length === 0) {
          this.fieldData.push('');

          return;
        }
        if (item[0]?.type !== 'text') {
          this.fieldData.push('');
        }
        item.forEach((element) => {
          if (element.type === 'text') {
            this.fieldData.push(element.value);

            return;
          }
          if (element.type === 'metric') {
            metricTypes.forEach((group) => {
              if (group.items.includes(element.value)) {
                formFieldData['metrics'] = group.groupName;
                formFieldData['metricsType'] = element.value;

                return;
              }
            });

            return;
          }
          if (element.type === 'granularity') {
            if (this.overlayData.data.viewType === 'LineGraph') {
              formFieldData['lineGraphGranularity'] = element.value;
            }

            return;
          }
          if (element.type === 'dateTimeFrom') {
            formFieldData['dateTimeFrom'] = moment(element.value).format('DD.MM.YYYY');
            formFieldData['timeFrame'] = 'date_range';

            return;
          }
          if (element.type === 'dateTimeTo') {
            formFieldData['dateTimeTo'] = moment(element.value).format('DD.MM.YYYY');
            formFieldData['timeFrame'] = 'date_range';

            return;
          }
          if (element.type === 'dateTimeRelative') {
            formFieldData['timeFrame'] = element.value;

            return;
          }
          if (element.type === 'filter') {
            dimensions.forEach((dimension) => {
              if (element.value.name === dimension) {
                if (dimension === 'browser') {
                  if (element.value.value) {
                    formFieldData['browser'] = element.value.value;
                  } else {
                    formFieldData['browser'] = element.value.values.join(',');
                  }

                  return;
                }
                if (dimension === 'paymentMethod') {
                  if (element.value.value) {
                    formFieldData['paymentMethod'] = [element.value.value];
                  } else {
                    formFieldData['paymentMethod'] = element.value.values;
                  }

                  return;
                }
                formFieldData[dimension] = element.value.value;
              }
            });
          }
        });
        if (Object.keys(formFieldData).length !== 0) {
          this.widgetService.fieldForms[index - 2] = formFieldData;
        }
      });

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
        (this.addWidgetForm.get('fields') as FormArray).push(
          new FormControl(
            this.fieldData[number - 1] ? this.fieldData[number - 1] : `Field ${number}`,
            Validators.required,
          ),
        );
      });
      setTimeout(() => {
        this.formPreviewDataSource(this.addWidgetForm.value);
      });
      this.addWidgetForm.valueChanges.pipe(tap(this.formPreviewDataSource), takeUntil(this.destroyed$)).subscribe();
    });

    /** On clicking "Done" save widget */
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
                  this.editWidget(data);
                  this.overlayWidgetService.close();
                }
              }
            }
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  /**
   * Edits existing widget and refreshes that widget in dashboard
   *
   * @param data widget data
   */
  editWidget(data) {
    this.apiService
      .editSingleWidget(this.widgetService.currentDashboard?.id, this.overlayData.data.id, {
        widgetSettings: data.widgetSettings,
      })
      .pipe(
        tap((widget: any) => {
          const newWidget = {
            createdAt: widget.createdAt,
            updatedAt: widget.updatedAt,
            id: widget._id,
            widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
            type: widget.type,
            viewType: widget.viewType,
            size: widget.size ?? this.widgetService.widgetSize.Large,
            edit: false,
          };
          const widgetId = this.widgetService.widgets.findIndex(widget => widget.id === newWidget.id);
          this.widgetService.widgets[widgetId] = newWidget;

          this.widgetService.refreshWidget = widget?._id;
          this.cdr.detectChanges();
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

  /** Removes widget */
  onRemove() {
    const contents: ConfirmDialogContentsInterface = {
      title: this.translateService.translate('statistics.confirm_dialog.are_you_sure'),
      subtitle: this.translateService.translate('statistics.confirm_dialog.subtitle_delete_widget'),
      confirmButton: this.translateService.translate('statistics.action.yes'),
      declineButton: this.translateService.translate('statistics.action.no'),
    };
    this.confirmService.openConfirmDialog(this.theme, contents);
    this.confirmService.afterClosed.pipe(take(1)).subscribe((isConfirm) => {
      if (isConfirm) {
        this.apiService
          .removeWidget(this.widgetService.currentDashboard?.id, this.overlayData.data.id)
          .pipe(
            tap(() => {
              this.widgetService.widgets = this.widgetService.widgets.filter(
                widget => widget.id !== this.overlayData.data.id,
              );

              this.overlayRef.close();
            }),
          )
          .subscribe();
      }
    });
  }

  /** Gets widget dimension types */
  getDimensions() {
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
  }

  /** Gets widget metrics types */
  getMetrics() {
    return this.apiService.getMetrics().pipe(
      map((res: any) => {
        this.widgetService.metricTypes = res.filter(item => item.type !== 'BrowserFilter');
        this.widgetService.browsers = res.filter(item => item.type === 'BrowserFilter')[0].list;

        return EMPTY;
      }),
    );
  }
}
