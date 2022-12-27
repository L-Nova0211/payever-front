import { formatDate } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import moment from 'moment/moment';
import { merge } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import {
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
  SelectOptionInterface,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { LocaleService } from '@pe/i18n-core';
import { PeDateTimePickerService } from '@pe/ui';

import { ProductEditorSections, ProductTypes } from '../../../../shared/enums/product.enum';
import { ProductModel } from '../../../../shared/interfaces/product.interface';
import { MainSection } from '../../../../shared/interfaces/section.interface';
import { CurrencyService } from '../../../../shared/services/currency.service';
import { SectionsService } from '../../../services';
import { CountryService } from '../../../services/country.service';
import { LanguageService } from '../../../services/language.service';

const allProductTypes = [ProductTypes.Service, ProductTypes.Digital, ProductTypes.Physical];

const greaterThanValidator: ValidatorFn = (control: AbstractControl) => {
  const group = control.parent;
  if (group) {
    const price = group.get('price');

    const greaterThan = Number(control.value) > Number(price.value);

    return greaterThan ? { salePrice: false } : null;
  }

  return null;
};

export const greaterPriceThanSalePriceValidator: ValidatorFn = (form: FormGroup) => {
  const price = form.get('price').value;
  const salePrice = form.get('salePrice').value;

  return price <= salePrice ? { salePriceGreater: true } : null;
};

export const greaterStartDateThanEndDateValidator: ValidatorFn = (form: FormGroup) => {
  const saleStartDate = moment(form.get('saleStartDate').value,'DD.MM.YYYY');
  const saleEndDate = moment(form.get('saleEndDate').value,'DD.MM.YYYY');

  return moment(saleStartDate).isAfter(saleEndDate) ? { saleStartDateGreater: true } : null;
};

export const dateValidator: ValidatorFn = Validators.pattern(
  '((0?[1-9]|[12]\\d|30|31)[.](0?[1-9]|1[0-2])[.]\\d{4})'
);

@Component({
  selector: 'main-section',
  templateUrl: 'editor-main-section.component.html',
  styleUrls: ['editor-main-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorMainSectionComponent extends FormAbstractComponent<MainSection> implements OnInit, AfterViewInit {
  readonly section: ProductEditorSections = ProductEditorSections.Main;

  @Input() theme: string;

  productType: ProductTypes = ProductTypes.Physical;
  currency: string;
  mainSection: MainSection = this.sectionsService.mainSection;
  formScheme: FormScheme;
  formTranslationsScope = 'mainSection.form';
  blobs: string[] = [];
  saleStartDateFormControl: AbstractControl;
  saleEndDateFormControl: AbstractControl;

  public productTypes: SelectOptionInterface[] = [];

  protected formStorageKey = 'mainSection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    public languageService: LanguageService,
    private sectionsService: SectionsService,
    private countryService: CountryService,
    private currencyService: CurrencyService,
    private dateTimePicker: PeDateTimePickerService,
    private localeService: LocaleService,
    private translateService: TranslateService
  ) {
    super(injector);
    this.onToggleSale = this.onToggleSale.bind(this);
  }

  ngOnInit(): void {
    this.currency = this.currencyService.currency;

    merge(
      this.sectionsService.saveClicked$.pipe(
        tap(() => this.doSubmit())
      ),
      this.languageService.updatedLanguage$.pipe(
        tap((productModel: ProductModel) => {
          this.mainSection = this.sectionsService.mainSection;
          this.updateForm(productModel);
          this.onChangePictures(productModel.images);
        })
      ),
      this.countryService.updatedCountry$.pipe(
        tap((product) => {
          this.form.get('price').setValue(product.price);
          this.form.get('salePrice').setValue(product.sale.salePrice);
        }),
      )
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();

    this.sectionsService.recurringBillingChange$
      .pipe(
        takeUntil(this.destroyed$),
        filter(d => !!d),
      )
      .subscribe((data) => {
        this.toggleControl('onSales', !data.enabled);
      });

    this.productTypes = allProductTypes.map((type: ProductTypes) => {
      return {
        label: type[0].toUpperCase() + type.substr(1).toLowerCase(),
        value: type,
      };
    });
    this.productType = this.sectionsService.productType;
    this.sectionsService.productType$.next(this.productType);
  }

  onChangePictures(blobs: string[]): void {
    this.blobs = blobs;
    this.sectionsService.onChangeMainSection(Object.assign({}, this.form.getRawValue(), { images: this.blobs }));
    this.changeDetectorRef.detectChanges();
  }

  onPicturesLoadingChanged(loading: boolean): void {
    this.sectionsService.isUpdating$.next(loading);
  }

  onToggleSale(event: any): void {
    this.form.controls.onSales.setValue(!this.form.controls.onSales.value);
    this.form.controls.onSales.updateValueAndValidity();
  }

  openDatepicker(event, controlName: string): void {
    const dialogRef = this.dateTimePicker.open(event, {
      theme: this.theme,
      config: { headerTitle: '', range: false, minDate: null, maxDate: null },
      position: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetX: 18,
        offsetY: -25,
      },
    });
    dialogRef.afterClosed.subscribe((date) => {
      if (date?.start) {
        this.form.get(controlName)
          .patchValue(moment(date.start).format('DD.MM.YYYY'));
        this.form.get(controlName).markAsTouched();
        event.target.focus();
        this.saleStartDateFormControl.updateValueAndValidity();
        this.saleEndDateFormControl.updateValueAndValidity();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  private updateForm(model: ProductModel) {
    const { productType, title, price, available } = model;
    const salePrice = model.sale.salePrice;
    const onSales = model.sale.onSales;
    const saleEndDate = model.sale.saleEndDate;
    const saleStartDate = model.sale.saleStartDate;

    this.form.setValue({
      productType,
      title,
      price,
      available,
      salePrice,
      onSales,
      saleEndDate,
      saleStartDate,
    });
  }

  protected createForm(initialData: MainSection): void {
    const data: MainSection = this.mainSection;
    data.price = data.price > 0 ? data.price : null;
    this.form = this.formBuilder.group({
      productType: [data.productType, Validators.required],
      title: [data.title, Validators.required],
      price: [data.price, [Validators.required, Validators.min(0)]],
      available: [data.available, Validators.required],
      salePrice: [data.salePrice,
        (data.onSales || data.saleStartDate || data.saleEndDate)
          ? [Validators.required, Validators.min(0)] : []],
      saleStartDate: [data.saleStartDate && formatDate(data.saleStartDate,
        'dd.MM.YYYY', this.localeService.currentLocale$.value.code), [dateValidator]],
      saleEndDate: [data.saleEndDate && formatDate(data.saleEndDate,
        'dd.MM.YYYY', this.localeService.currentLocale$.value.code), [dateValidator]],
      onSales: [data.onSales],
    }, { validators: [greaterPriceThanSalePriceValidator, greaterStartDateThanEndDateValidator] });

    this.saleStartDateFormControl = this.form.controls.saleStartDate;
    this.saleEndDateFormControl = this.form.controls.saleEndDate;
    this.onSalePriceChange(data.salePrice);

    this.languageService.language$.pipe(
      tap(() => {
        this.toggleDisable(this.languageService.selectedAdditionalLanguage);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.form
      .get('onSales')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((change: boolean) => {
        const control = this.form.get('salePrice');
        if (change) {
          control.setValidators([Validators.required, greaterThanValidator]);
        } else {
          control.setValidators([]);
        }

        control.updateValueAndValidity();
      });

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: MainSection): void {
    this.sectionsService.onChangeMainSection(Object.assign({}, this.form.getRawValue(), { images: this.blobs }));
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }

  onPriceChange(value: number): void {
    if (value < 0) {
      this.form.get('price').patchValue(0);
    }
  }

  onSalePriceChange(value: number): void {
      if (value > 0){
        this.saleStartDateFormControl.setValidators([dateValidator, Validators.required]);
        this.saleEndDateFormControl.setValidators([dateValidator, Validators.required]);
      } else {
        this.saleStartDateFormControl.setValidators([dateValidator]);
        this.saleEndDateFormControl.setValidators([dateValidator]);
      }
      this.saleStartDateFormControl.updateValueAndValidity();
      this.saleEndDateFormControl.updateValueAndValidity();
  }

  onSaleDateChange () {
    if (this.form.get('saleStartDate').value?.length > 0 || this.form.get('saleEndDate').value?.length > 0) {
      this.form.controls.salePrice.setValidators([Validators.required, Validators.min(0)]);
    } else {
      this.form.controls.salePrice.setValidators([Validators.min(0)]);
    }
    this.form.controls.salePrice.updateValueAndValidity();
  }

  get saleStartDateInvalid() {
    return (
      this.isSubmitted &&
      (this.form.errors?.saleStartDateGreater ||
        this.saleStartDateFormControl.errors?.pattern ||
        this.saleStartDateFormControl.errors?.required)
    );
  }

  get saleStartDateErrorMessage() {
    if (this.form.errors?.saleStartDateGreater ) {
      return this.translateService.translate('mainSection.form.errors.start_date_greater_than_end');
    }

    if (this.saleStartDateFormControl.errors?.pattern) {
      return this.translateService.translate('mainSection.form.errors.invalid_date_format');
    }

    if (this.saleStartDateFormControl.errors?.required){
      return this.translateService.translate('mainSection.form.errors.start_date_required');
    }
  }

  get saleEndDateInvalid() {
    return (
      this.isSubmitted &&
      (this.saleEndDateFormControl.errors?.pattern || this.saleEndDateFormControl.errors?.required)
    );
  }

  get saleEndDateErrorMessage() {
    if (this.saleEndDateFormControl.errors?.pattern) {
      return this.translateService.translate('mainSection.form.errors.invalid_date_format');
    }

    if (this.saleEndDateFormControl.errors?.required){
      return this.translateService.translate('mainSection.form.errors.start_date_required');
    }
  }

  private toggleDisable(disable: boolean) {
    this.form.get('productType')[disable ? 'disable' : 'enable']();
  }

}
