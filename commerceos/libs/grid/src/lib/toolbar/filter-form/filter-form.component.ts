import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { timer } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';


import { AppThemeEnum, AppType, APP_TYPE, EnvService, PeDestroyService, PreloaderState } from '@pe/common';
import { LocaleService, TranslateService } from '@pe/i18n-core';
import { PebTimePickerService, PeDateTimePickerService } from '@pe/ui';

import { PeGridMenuService } from '../../menu';
import { PeGridMenuPosition } from '../../misc/enums';
import {
  PeFilterChange,
  PeFilterKeyInterface,
  PeFilterType,
  PeGridMenu,
  PeGridMenuConfig,
} from '../../misc/interfaces';
import { PeGridToolbarService } from '../toolbar.service';

@Component({
  selector: 'pe-toolbar-filter',
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.scss'],
  providers: [PeDestroyService],
})
export class PeGridToolbarFilterComponent implements OnChanges {
  @SelectSnapshot(PreloaderState.loading) loading: {};
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  @Input() filterConfig: PeFilterKeyInterface[];
  @Input() mobileView = false;

  @Output() addedFilter = new EventEmitter<PeFilterChange>();

  readonly PeFilterType = PeFilterType;

  keysRef: ElementRef;
  @ViewChild('keysRef', { static: false }) set filterElementRef(content: ElementRef) {
    if (content) {
      this.keysRef = content;
      this.resetFilters();
    }
  }

  conditionsRef: ElementRef;
  @ViewChild('conditionsRef', { static: false }) set containsElementRef(content: ElementRef) {
    if (content) {
      this.conditionsRef = content;
      this.resetContains();
    }
  }

  valuesRef: ElementRef;
  @ViewChild('valuesRef', { static: false }) set valuesElementRef(content: ElementRef) {
    if (content) {
      this.valuesRef = content;
      this.resetValues();
    }
  }

  valuesRefFrom: ElementRef;
  @ViewChild('valuesRefFrom', { static: false }) set valuesElementRefFrom(content: ElementRef) {
    if (content) {
      this.valuesRefFrom = content;
      this.resetValues();
    }
  }

  valuesRefTo: ElementRef;
  @ViewChild('valuesRefTo', { static: false }) set valuesElementRefTo(content: ElementRef) {
    if (content) {
      this.valuesRefTo = content;
      this.resetValues();
    }
  }

  @ViewChild('picker', { static: false }) picker: MatDatepicker<any>;

  get valueIsBetween(): boolean {
    return this.toolbarService.isValueBetween(this.searchItem.contain);
  }

  get isDisabled(): boolean {
    return !this.filterForm.get('condition')?.value || this.filterForm.get('value')?.disabled;
  }

  get readOnly(): boolean {
    return this.valueType === PeFilterType.Option
      || this.valueType === PeFilterType.Date
      || this.valueType === PeFilterType.Time;
  }

  get valueType(): PeFilterType {
    return this.toolbarService.getValueType(this.searchItem.filter, this.filterConfig);
  }

  get placeholder(): string {
    switch (this.valueType) {
      case PeFilterType.Date:
        return this.getLabel('select_date');
      case PeFilterType.Option:
        return this.getLabel('select');
      case PeFilterType.Time:
        return this.getLabel('select_time');
      default:
        return this.getLabel('search');
    }
  }

  get isSearch(): boolean {
    return this.valueType === PeFilterType.Number || this.valueType === PeFilterType.String;
  }

  filterForm: FormGroup;
  locale = this.localeService.currentLocale$.value.code;

  @HostBinding('class.mobile-view') get isMobileView() {
    return this.mobileView;
  }

  constructor(
    private envService: EnvService,
    private formBuilder: FormBuilder,
    private timePicker: PebTimePickerService,
    private peGridMenuService: PeGridMenuService,
    private dateTimePicker: PeDateTimePickerService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private localeService: LocaleService,
    public toolbarService: PeGridToolbarService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
    this.filterForm = this.formBuilder.group({
      key: [null, [Validators.required]],
      containsTranslations: [false],
      condition: [null, [Validators.required]],
      value: [null, [Validators.required]],
      valueFrom: [null, [Validators.required]],
      valueTo: [null, [Validators.required]],
    });
  }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  get searchItem(): PeFilterChange {
    const fv = this.filterForm.value;

    return {
      filter: fv.key,
      contain: fv.condition,
      search: this.toolbarService.isValueBetween(fv.condition) ? { from: fv.valueFrom, to: fv.valueTo } : fv.value,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { filterConfig } = changes;
    if (filterConfig?.currentValue && this.keysRef && this.conditionsRef) {
      this.resetFilters();
      this.resetContains();
    }
  }

  getLabel(key: string): string {
    return this.translateService.translate(`grid.labels.${key}`);
  }

  keyPress(event: KeyboardEvent, valueFieldName: string): void {
    if (event) {
      timer(0).pipe(takeUntil(this.destroy$)).subscribe(() => {
        // Have to use timer to have latest added character
        if (this.valueType === PeFilterType.String || this.valueType === PeFilterType.Number) {
          const value = (event.target as HTMLInputElement).value;
          this.filterForm.get(valueFieldName).setValue(value);
        }
        if (event?.key === 'Enter' || event?.keyCode === 13) {
          this.addFilter();
        }
      });
    }
  }

  applyFilter(): void {
    if (this.filterForm.valid) {
      this.addFilter();
    }
  }

  getMenuConfig(offsetX = 0, offsetY = 0, position: PeGridMenuPosition, minWidth?: number): PeGridMenuConfig {
    const config: PeGridMenuConfig = {
      offsetX,
      offsetY,
      position,
    };

    return minWidth ? { minWidth, ...config } : config;
  }

  getOverlayConfig(clientWidth: number): PeGridMenuConfig {
    const offsetY = window.innerWidth <= 720 ? 0 : 12;

    return this.getMenuConfig(0, offsetY, PeGridMenuPosition.LeftBottom, clientWidth);
  }

  openOverlay(elem: EventTarget, menu: PeGridMenu, control: string): void {
    if (!this.filterConfig?.length) {
      return;
    }

    const element: HTMLInputElement = elem as any;
    this.peGridMenuService.open(element, menu, this.getOverlayConfig(element.clientWidth));

    this.peGridMenuService.overlayClosed$.pipe(
      take(1),
      filter(data => !!data),
      tap((data) => {
        this.filterForm.get(control).setValue(data.value);
        element.value = data.label;

        if (control === 'key') {
          this.filterForm.get('containsTranslations').setValue(data.containsTranslations);
          this.resetContains(data.value);
          this.resetValues();
        }
        this.checkIsBetween();
        if (['value', 'valueFrom', 'valueTo'].indexOf(control) >= 0) {
          this.applyFilter();
        }

        this.cdr.detectChanges();
      })
    ).subscribe();
  }

  checkIsBetween() {
    if (this.valueIsBetween) {
      this.filterForm.get('value').disable();
      this.filterForm.get('valueFrom').enable();
      this.filterForm.get('valueFrom').setValidators(Validators.required);
      this.filterForm.get('valueTo').enable();
      this.filterForm.get('valueTo').setValidators(Validators.required);
    } else {
      this.filterForm.get('value').enable();
      this.filterForm.get('valueFrom').disable();
      this.filterForm.get('valueFrom').clearAsyncValidators();
      this.filterForm.get('valueTo').disable();
      this.filterForm.get('valueTo').clearAsyncValidators();
    }
  }

  openValueOverlay(event: MouseEvent, valueFieldName: string): void {
    const element: HTMLInputElement = event.target as any;

    switch (this.valueType) {
      case PeFilterType.Option:
        this.openOverlay(element, this.toolbarService.getValueOptions(this.searchItem.filter, this.filterConfig), 'value');
        break;
      case PeFilterType.Date:
        this.dateOverlay(event, element, valueFieldName);
        break;
      case PeFilterType.Time:
        this.timeOverlay(event, element, valueFieldName);
        break;
    }
  }

  dateOverlay(event, element, valueFieldName) {
    const dialogRef = this.dateTimePicker.open(event, {
      theme: this.theme, position: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: -12,
        offsetY: 12,
      },
      config: { headerTitle: 'Date', range: false, format: 'YYYY-MM-DD', maxDate: null },
    });

    dialogRef.afterClosed.pipe(
      take(1),
      filter(data => !!data),
      tap((data) => {
        const date = new Date(data.start);
        this.filterForm.get(valueFieldName).setValue(date);
        element.value = this.toolbarService.formatDate(date);
        this.applyFilter();
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  timeOverlay(event, element, valueFieldName) {
    const dialogRef = this.timePicker.open(event, {
      theme: this.theme, position: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: -12,
        offsetY: 12,
      },
      timeConfig: { animation: 'fade' },
    });

    dialogRef.afterClosed.pipe(
      take(1),
      filter(time => !!time),
      tap((time) => {
        this.filterForm.get(valueFieldName).setValue(time);
        element.value = time;
        this.applyFilter();
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  private addFilter(): void {
    if (this.filterForm.valid) {
      const fv = this.filterForm.value;
      const key = fv.containsTranslations ? `${fv.key}.${this.locale}` : fv.key;
      const filter = this.searchItem;
      filter.filter = key;
      this.addedFilter.emit(filter);
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.filterForm.reset();
    this.resetFilters();
    this.resetContains();
    this.resetValues();
  }

  private resetFilters(): void {
    if (this.filterConfig?.length) {
      const filter: PeFilterKeyInterface = this.filterConfig[0];
      this.filterForm.get('key').setValue(filter.fieldName);
      this.filterForm.get('containsTranslations').setValue(filter.containsTranslations);
      this.keysRef.nativeElement.value = this.toolbarService.getFilterKeyFormatted(this.searchItem, this.filterConfig);
      this.checkIsBetween();
    } else {
      this.filterForm.get('key').setValue(null);
      this.keysRef.nativeElement.value = '';
    }
    this.cdr.detectChanges();
  }

  private resetContains(key = null): void {
    if (this.filterConfig?.length) {
      const filter: PeFilterKeyInterface = this.filterConfig.find(item => item.fieldName === key) ?? this.filterConfig[0];
      this.filterForm.get('condition').setValue(filter.filterConditions[0]);
      this.conditionsRef.nativeElement.value =
        this.toolbarService.getFilterConditionFormatted(this.searchItem, this.filterConfig);
    } else {
      this.filterForm.get('condition').setValue(null);
      this.conditionsRef.nativeElement.value = '';
    }
    this.cdr.detectChanges();
  }

  private resetValues(): void {
    this.filterForm.get('value').setValue(null);
    this.filterForm.get('valueFrom').setValue(null);
    this.filterForm.get('valueTo').setValue(null);
    if (this.valuesRef) {this.valuesRef.nativeElement.value = '';}
    if (this.valuesRefFrom) {this.valuesRefFrom.nativeElement.value = '';}
    if (this.valuesRefTo) {this.valuesRefTo.nativeElement.value = '';}
  }
}
