import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { get, omit } from 'lodash-es';
import moment from 'moment';
import { BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { finalize, map, skip, skipWhile, take, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService } from '@pe/common';
import {
  AutocompleteChipsSettingsInterface,
  AutocompleteChipsSize,
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
  FormSchemeField,
  PeValidators,
  SelectOptionInterface,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { LocaleService } from '@pe/i18n-core';
import { PeDateTimePickerService } from '@pe/ui';

import { DialogService } from '../../../products-list/services/dialog-data.service';
import { ProductModel } from '../../../shared/interfaces/product.interface';
import {
  ExternalError,
  OptionsSection,
  OptionsSectionGrouped,
  VariantOptionSectionType,
  VariantsCreateFormData,
  VariantsEditFormData,
  VariantsSection,
} from '../../../shared/interfaces/section.interface';
import { SectionsService } from '../../services';
import { VariantStorageService } from '../../services/variant-storage.service';
import { initialState, VariantState } from '../../store';
import { cleanVariant, loadVariant, updateVariant } from '../../store/variant.actions';
import { mapVariantFormDataToVariant, mapVariantToFormData } from '../../utils';
import {
  dateValidator,
  greaterPriceThanSalePriceValidator,
  greaterStartDateThanEndDateValidator,
} from '../editor-sections/editor-main-section/editor-main-section.component';

@Component({
  selector: 'variant-editor',
  templateUrl: 'variant-editor.component.html',
  styleUrls: ['variant-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class VariantEditorComponent extends FormAbstractComponent<any> implements OnInit, OnDestroy {
  @Input() currency: string;
  @Input() externalError: Subject<ExternalError>;
  @Select(VariantState.getLoaded) private loadedVariants$;
  @Select(VariantState.getVariant) private variants$;

  dragulaBag = 'options-bag';

  modalHeaderControls: any[] = [
    {
      position: 'center',
      type: 'text',
      text: this.translateService.translate(
        this.activatedRoute.snapshot.data.isVariantEdit ? 'variantEditor.edit_variant' : 'variantEditor.title',
      ),
    },
    {
      position: 'right',
      type: 'link',
      text: this.translateService.translate('ng_kit.tooltips.toolbar.save'),
      classes: 'mat-button-fit-content',
      queryParams: this.activatedRoute.snapshot.queryParams, // to prevent removing of get params
      onClick: () => this.done(),
    },
  ];

  private navigationOptions: NavigationExtras = {
    skipLocationChange: true,
    queryParams: {
      addExisting: true,
    },
    queryParamsHandling: 'merge',
  };

  variant$: BehaviorSubject<VariantsEditFormData | VariantsCreateFormData>;
  loaded$ = new BehaviorSubject<boolean>(false);
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  optionsFormArray: any = this.formBuilder.array([]);
  formScheme: FormScheme;
  isSubmitting = false;
  protected formStorageKey = 'variantsSection.form';
  private colorOptions: SelectOptionInterface[] = [];
  isVariantEdit = false;
  formTranslationsScope = 'variantsSection.form';
  saleStartDateFormControl: AbstractControl;
  saleEndDateFormControl: AbstractControl;

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private sectionsService: SectionsService,
    private envService: EnvService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private variantStorageService: VariantStorageService,
    public confirmDialog: DialogService,
    private dateTimePicker: PeDateTimePickerService,
    private localeService: LocaleService,
  ) {
    super(injector);
  }

  get descriptionInvalid(): boolean {
    const control: AbstractControl = this.form.get('description');

    return this.isSubmitted && control.invalid;
  }

  get skuError() {
    const externalErr = this.errorBag.getError('sku');
    if (this.form.controls?.sku?.errors?.exist) {
      return externalErr;
    } else if (this.form.controls?.sku?.errors?.SKU === '') {
      return this.translateService.translate('variantEditor.errors.wrong_sku');
    } else if (this.form.get('sku').hasError('required')) {
      return this.translateService.translate('variantEditor.errors.sku_is_required');
    } else if (this.form.get('sku').hasError('external')) {
      return this.form.controls.sku.errors.external;
    } else if (this.form.get('sku').hasError('existingSKU')) {
      return this.translateService.translate('variantEditor.errors.existing_sky');
    }

    return '';
  }

  uniqueSKUInVariants(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value || this.sectionsService.variantsSection.length == 1) {
        return null;
      }

      const error = this.sectionsService.variantsSection?.filter(
        variant => variant.id !== this.activatedRoute.snapshot.params?.variantId ?? this.form?.get('id').value
      ).some((variant) => {
        return variant.sku === control.value;
      });

      return error ? { existingSKU: { value: control.value } } : null;
    };
  };

  ngOnInit(): void {
    this.isVariantEdit = this.activatedRoute.snapshot.data.isVariantEdit;
    const initialVariant: VariantsSection = initialState.variant;
    const formVariant: VariantsEditFormData | VariantsCreateFormData = this.isVariantEdit
      ? { ...initialVariant, type: 'edit' }
      : { ...initialVariant, options: [], type: 'create' };
    this.variant$ = new BehaviorSubject(formVariant);
    if (this.isVariantEdit) {
      const product: ProductModel = get(this.activatedRoute.snapshot, ['data', 'product', 'data', 'product'], null);
      if (product) {
        this.sectionsService.setProduct(product);
      }
    }

    const variantId = this.activatedRoute.snapshot.params.variantId;
    if (!this.variantStorageService.getVariantForm()) {
      this.store.dispatch(new loadVariant(variantId, !this.isVariantEdit));
    }

    this.loadedVariants$.pipe(takeUntil(this.destroyed$)).subscribe(this.loaded$);

    this.variants$
      .pipe(
        takeUntil(this.destroyed$),
        map((val: any) => this.mergeVariantData(val)),
        map((val: any) => mapVariantToFormData(val, this.isVariantEdit)),
      )
      .subscribe(this.variant$);

    this.variant$
      .pipe(
        skipWhile(() => !this.loaded$.value),
        take(1),
      )
      .subscribe((variant) => {
        this.initForm(variant);
      });
  }

  close(): void {
    this.confirmDialog.open({
      title: this.isVariantEdit
        ? this.translateService.translate('variantEditor.edit_variant')
        : this.translateService.translate('variantEditor.add_variant'),
      subtitle: this.isVariantEdit
        ? this.translateService.translate('variantEditor.dialog_leave.description_editing')
        : this.translateService.translate('variantEditor.dialog_leave.description_adding'),
      confirmBtnText: this.translateService.translate('variantEditor.dialog_leave.yes'),
      declineBtnText: this.translateService.translate('variantEditor.dialog_leave.no'),
    });

    this.confirmDialog.confirmation$.pipe(
      skip(1),
      take(2),
    ).subscribe(() => {
      this.navigateToProduct();
    });
  }

  getUrl(url: any) {
    const baseUrl = ['business', this.envService.businessId, 'products', 'list'];
    const productId = this.activatedRoute.snapshot.parent.params.productId || null;
    const editor = ['products-editor', productId ? 'edit' : 'add'];

    if (productId) { editor.push(productId); }

    editor.push(url);

    return [...baseUrl, { outlets: { editor } }];
  }

  done(): void {
    this.doSubmit();
  }

  onDropSortImg(event: CdkDragDrop<string[]>): void {
    this.swapOptions(event.previousIndex, event.currentIndex);
  }

  swapOptions(previousIndex: number, currentIndex: number) {
    moveItemInArray(this.optionsFormArray.controls, previousIndex, currentIndex);
  }

  onChangePictures(images: string[]): void {
    this.store.dispatch(new updateVariant({ images }));
  }

  onDeleteOption(index: number) {
    if (this.optionsFormArray.length === 1) {
      return;
    }
    this.optionsFormArray.removeAt(index);

    this.validateOptions();
  }

  onAddOption() {
    this.variantStorageService.setVariantForm(this.isVariantEdit, this.variant$.value.id, this.form);
    const url = { outlets: { auxiliary: ['option-type-picker'] } };
    this.router.navigate(this.sectionsService.getUrl(url, this.activatedRoute), { skipLocationChange: true });
  }

  onToggleSale(onSales: any): void {
    if (onSales) {
      this.form.controls.salePrice.setValidators([Validators.required, Validators.min(0)]);
      this.saleStartDateFormControl.setValidators([dateValidator, Validators.required]);
      this.saleEndDateFormControl.setValidators([dateValidator, Validators.required]);
    } else {
      this.form.controls.salePrice.clearValidators();
      this.saleStartDateFormControl.setValidators([dateValidator]);
      this.saleEndDateFormControl.setValidators([dateValidator]);
    }
    this.form.controls.salePrice.updateValueAndValidity();
    this.saleStartDateFormControl.updateValueAndValidity();
    this.saleEndDateFormControl.updateValueAndValidity();
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

  onDescriptionChange(text: string): void {
    this.form.get('description').setValue(text);
  }

  getOptionFieldScheme(control: FormGroup): FormSchemeField[] {
    const type = control.get('type').value;
    if (type === VariantOptionSectionType.COLOR) {
      return this.formScheme.fieldsets.colorOptions;
    }

    return this.formScheme.fieldsets.defaultOptions;
  }

  goToColorPicker(formControl: FormControl): void {
    this.variantStorageService.setVariantForm(this.isVariantEdit, this.variant$.value.id, this.form, formControl);
    const url = { outlets: { auxiliary: ['color-picker'] } };
    this.router.navigate(this.sectionsService.getUrl(url, this.activatedRoute), { skipLocationChange: true });
  }

  protected createForm(initialData: VariantsSection): void {
    /* tslint:disable:no-empty */
  }

  protected onUpdateFormData(formValues: VariantsSection): void {
    this.optionsFormArray.controls.forEach((control) => {
      const isNotEqual =
        (!!control.value.name && !control.value.value.length) || (!control.value.name && !!control.value.value.length);
      if (isNotEqual) {
        control.get('name').setValidators([...this.newOptionValidator('name'), Validators.required]);
        control.get('value').setValidators([...this.newOptionValidator('value'), Validators.required]);
        control.get('name').updateValueAndValidity({
          onlySelf: true,
          emitEvent: false,
        });
        control.get('value').updateValueAndValidity({
          onlySelf: true,
          emitEvent: false,
        });
      }
    });
  }

  protected onSuccess(): void {
    if (this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    const variants: VariantsSection[] = mapVariantFormDataToVariant({
      ...this.variant$.value,
      ...this.form.getRawValue(),
    });
    if (this.isVariantEdit) {
      const variant = variants[0];
      this.sectionsService.setVariantAsync(variant, false);
      this.isSubmitting = false;
      this.proceedSuccess();
    } else {
      const requests$ = variants.map((variant, i) => {

        return this.sectionsService
          .getVariantAsync('', !this.isVariantEdit)
          .pipe(tap(({ id }) => this.sectionsService.setVariantAsync({ ...variant, id }, true)));
      });
      forkJoin([...requests$])
        .pipe(
          takeUntil(this.destroyed$),
          take(1),
          finalize(() => (this.isSubmitting = false)),
        )
        .subscribe(() => this.proceedSuccess());
    }
  }

  protected onFormInvalid(): void { }

  private proceedSuccess(): void {
    this.sectionsService.variantsChange$.next(this.sectionsService.model.variants);
    this.variantStorageService.clearTemporaryData();
    // this value is listening in product resolver, false means that not need to reload product
    this.sectionsService.resetState$.next(false);

    this.store.dispatch(new cleanVariant());

    const productId: string = this.activatedRoute.snapshot.params.productId || '';
    this.router.navigate(this.sectionsService.getUrl(productId, this.activatedRoute), this.navigationOptions);
  }

  private initForm(variant: VariantsCreateFormData | VariantsEditFormData): void {
    this.colorOptions = this.variantStorageService.getVariantColors();
    const formFromStorage = this.variantStorageService.getVariantForm();
    const existingOptions = formFromStorage && (formFromStorage.get('options'));
    this.optionsFormArray = existingOptions || this.createOptionsFormArray(variant.options);
    if (!this.optionsFormArray.length) {
      this.pushNewOptionToArray();
    }
    this.form =
      formFromStorage ||
      this.formBuilder.group({
        id: variant.id,
        options: this.optionsFormArray,
        description: [variant.description],
        price: [variant.price, Validators.required],
        salePrice: [variant.salePrice,
          (variant.onSales || variant.saleStartDate || variant.saleEndDate)
            ? [Validators.required, Validators.min(0)] : []],
        saleStartDate: [variant.saleStartDate && formatDate(variant.saleStartDate,'dd.MM.YYYY',
          this.localeService.currentLocale$.value.code), [dateValidator]],
        saleEndDate: [variant.saleEndDate && formatDate(variant.saleEndDate,'dd.MM.YYYY',
          this.localeService.currentLocale$.value.code), [dateValidator]],
        onSales: [variant.onSales],
        sku: [
          variant.sku,
          [
            PeValidators.validSKU(),
            this.uniqueSKUInVariants(),
          ],
          this.sectionsService.isSkuUniqAsync(this.variant$.value.sku),
        ],
        inventory: [variant.inventory || 0, [Validators.min(0)]],
        inventoryTrackingEnabled: [variant.inventoryTrackingEnabled],
        barcode: [variant.barcode],
      });
    this.formScheme = this.createFieldSet();
    this.saleStartDateFormControl = this.form.controls.saleStartDate;
    this.saleEndDateFormControl = this.form.controls.saleEndDate;

    if (this.isVariantEdit) {
      this.form.setValidators([greaterPriceThanSalePriceValidator, greaterStartDateThanEndDateValidator]);
    }
    this.cdr.detectChanges();
  }

  private pushNewOptionToArray(): void {
    const value: string | string[] = this.isVariantEdit ? '' : [];
    const newGroup: FormGroup = this.formBuilder.group({
      name: [this.translateService.translate('typePicker.default'), this.newOptionValidator('name')],
      value: [value, this.newOptionValidator('value')],
      type: [VariantOptionSectionType.DEFAULT],
    });
    this.optionsFormArray.push(newGroup);
  }

  private createOptionsFormArray(options: Array<OptionsSection | OptionsSectionGrouped>): FormArray {
    const groups: FormGroup[] = (options || []).map(option =>
      this.formBuilder.group({
        name: [option.name, this.newOptionValidator('name')],
        value: [option.value, this.newOptionValidator('value')],
        type: [option.type],
      }),
    );

    return this.formBuilder.array([...groups]);
  }

  private newOptionValidator(type: 'name' | 'value'): ValidatorFn[] {
    let validators = !this.optionsFormArray.length ? [Validators.required] : [];
    if (type === 'name') {
      validators = [...validators, this.sameOptionsName()];
    }

    return validators;
  }

  private createFieldSet(): FormScheme {
    const defaultOptionName: FormSchemeField = this.createOptionNameFieldSet();
    const defaultOptionValue: FormSchemeField = this.isVariantEdit
      ? this.createDefaultSingleOptionValueFieldSet()
      : this.createDefaultMultipleOptionValueFieldSet();
    const colorOptionValue: FormSchemeField = this.createColorOptionValueFieldSet();

    return {
      fieldsets: {
        defaultOptions: [defaultOptionName, defaultOptionValue],
        colorOptions: [defaultOptionName, colorOptionValue],
        sizeOptions: [],
      },
    };
  }

  private sameOptionsName(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value.length) {
        return null;
      }
      const existingNames: string[] = this.optionsFormArray.controls
        .filter((group: FormGroup) => group.get('name') !== control)
        .map((group: FormGroup) => group.value.name.toLowerCase());
      const error = existingNames.some(name => name === control.value.toLowerCase());

      return error ? { existingOptionsName: { value: control.value } } : null;
    };
  }

  private validateOptions() {
    const optionsControls: any = this.form.get('options');
    if (optionsControls && optionsControls.controls) {
      for (const i in optionsControls.controls) {
        if (optionsControls.controls.hasOwnProperty(i)) {
          optionsControls.controls[i].get('name').updateValueAndValidity();
        }
      }
    }
  }

  private createOptionNameFieldSet(): FormSchemeField {
    return {
      name: `name`,
      type: 'input',
      fieldSettings: {
        label: this.translateService.translate('variantEditor.placeholders.option_name'),
      },
      inputSettings: {
        placeholder: this.translateService.translate('variantEditor.placeholders.option_name'),
        autocompleteAttribute: 'off',
      },
    };
  }

  private createColorOptionValueFieldSet(): FormSchemeField {
    const onClick = this.goToColorPicker.bind(this);
    const addOptionButton = {
      onClick,
      name: this.translateService.translate('addDropdownOption'),
    };
    const saveOptionButton = {
      onClick,
      name: this.translateService.translate('saveDropdownOption'),
    };

    return {
      name: 'value',
      type: 'select',
      fieldSettings: {
        classList: `color-options-input`,
        label: this.translateService.translate('variantEditor.placeholders.option_value'),
        fullStoryHide: true,
      },
      inputSettings: {
        placeholder: this.translateService.translate('variantEditor.placeholders.option_value'),
        autocompleteAttribute: 'off',
      },
      selectSettings: {
        options: this.colorOptions,
        multiple: !this.isVariantEdit,
        panelClass: 'mat-select-dark autocomplete-panel-non-scrollable variant-editor__color-dropdown',
        singleLineMode: true,
        singleLineMoreText: this.translateService.translate('more'),
        optionClass: 'badge-checkbox color-input-field',
        addOptionButton,
        saveOptionButton,
      },
    };
  }

  private createDefaultMultipleOptionValueFieldSet(): FormSchemeField {
    return {
      name: 'value',
      type: 'autocomplete-chips',
      fieldSettings: {
        label: this.translateService.translate('variantEditor.placeholders.option_value'),
        fullStoryHide: true,
        required: true,
      },
      inputSettings: {
        placeholder: this.translateService.translate('variantEditor.placeholders.option_value'),
        autocompleteAttribute: 'off',
      },
      autocompleteChipsSettings: {
        options: [],
        placeholder: this.translateService.translate('variantEditor.placeholders.option_value'),
        separatorKeys: [COMMA, ENTER],
        autoActiveFirstOption: true,
        autocompleteClassList: `pr-variants-autocomplete theme-${this.theme}`,
        chipsSize: AutocompleteChipsSize.Default,
      } as AutocompleteChipsSettingsInterface,
    };
  }

  private createDefaultSingleOptionValueFieldSet(): FormSchemeField {
    return {
      name: 'value',
      type: 'input',
      fieldSettings: {
        label: this.translateService.translate('variantEditor.placeholders.option_value'),
        fullStoryHide: true,
      },
      inputSettings: {
        placeholder: this.translateService.translate('variantEditor.placeholders.option_value'),
        autocompleteAttribute: 'off',
      },
    };
  }

  private mergeVariantData(variant: VariantsSection): VariantsSection {
    const { images, price, salePrice, onSales, saleEndDate, saleStartDate } = this.sectionsService.mainSection;

    const { description } = this.sectionsService.contentSection;
    const { sku, barcode, inventory, inventoryTrackingEnabled } = this.sectionsService.inventorySection;

    return {
      images,
      description,
      price,
      salePrice,
      onSales: onSales ? onSales : true,
      saleEndDate,
      saleStartDate,
      sku,
      barcode,
      inventoryTrackingEnabled,
      inventory,
      ...omit(variant, ['lowInventory', 'emailLowStock']),
    };
  }

  private navigateToProduct(): void {
    this.sectionsService.resetState$.next(false);

    this.store.dispatch(new cleanVariant());
    this.variantStorageService.clearTemporaryData();
    const productId = this.activatedRoute.snapshot.params.productId || '';
    this.router.navigate(this.sectionsService.getUrl(productId, this.activatedRoute), this.navigationOptions);
  }

  onSaleDateChange () {
    const onSales = this.form.get('onSales').value;
    const startDate = this.saleStartDateFormControl.value;
    const endDate = this.saleEndDateFormControl.value;

    if (startDate?.length > 0 || endDate?.length > 0 || onSales === true) {
      this.form.controls.salePrice.setValidators([Validators.required, Validators.min(0)]);
    } else if (onSales !== true) {
      this.form.controls.salePrice.setValidators([]);
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
}
