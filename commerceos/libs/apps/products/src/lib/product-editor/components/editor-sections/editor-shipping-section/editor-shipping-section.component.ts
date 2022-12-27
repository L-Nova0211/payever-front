import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { filter, map, skip, takeUntil, tap } from 'rxjs/operators';

import {
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { ProductEditorSections, ProductTypes } from '../../../../shared/enums/product.enum';
import { ShippingSection } from '../../../../shared/interfaces/section.interface';
import { SectionsService } from '../../../services';
import { CountryService } from '../../../services/country.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'shipping-section',
  templateUrl: 'editor-shipping-section.component.html',
  styleUrls: ['editor-shipping-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})

export class EditorShippingSectionComponent extends FormAbstractComponent<ShippingSection> implements OnInit {
  readonly section: ProductEditorSections = ProductEditorSections.Shipping;
  shippingSect2ion: ShippingSection = this.sectionsService.shippingSection;
  formScheme: FormScheme;
  formTranslationsScope = 'shippingSection.form';

  protected formStorageKey = 'shippingSection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private readonly translateService: TranslateService,
    private sectionsService: SectionsService,
    private countryService: CountryService,
  ) {
    super(injector);
  }

  get isPhysicalProduct$(): Observable<boolean> {
    return this.sectionsService.productType$.asObservable().pipe(
      map((item: ProductTypes) => item === ProductTypes.Physical),
    );
  }

  ngOnInit(): void {
    this.sectionsService.saveClicked$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      if (this.sectionsService.productType === ProductTypes.Physical) {
        this.doSubmit();
      }
    });

    this.sectionsService.saveClickedSuccess$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      if (this.sectionsService.productType !== ProductTypes.Physical) {
        this.sectionsService.onChangeShippingSection(null);
      }
    });

    this.isPhysicalProduct$.pipe(filter(Boolean), skip(1), takeUntil(this.destroyed$)).subscribe(() => {
      // this.createForm(this.initialData); remove if all is good
    });
  }

  getErrors() {
    const controls = this.form.controls;

    if (
      controls.weight.errors?.required ||
      controls.width.errors?.required ||
      controls.length.errors?.required ||
      controls.height.errors?.required ||
      controls.weight.errors?.min ||
      controls.width.errors?.min ||
      controls.length.errors?.min ||
      controls.height.errors?.min
    ) {
      return true;
    }

    return false;
  }

  getMessage(type) {
    const controls = this.form.controls;

    if (controls[type].errors?.required) {
      return this.translateService.translate(`shippingSection.errors.${type}_is_required`);
    }
    if (controls[type].errors?.min) {
      return this.translateService.translate(`shippingSection.form.${type}.min_validation`);
    }
  }

  protected createForm(initialData: ShippingSection): void {
    const data: ShippingSection =  this.sectionsService.shippingSection;

    this.form = this.formBuilder.group({
      weight: [data.weight, [Validators.required, Validators.min(0)]],
      width: [data.width, [Validators.required, Validators.min(0)]],
      length: [data.length, [Validators.required, Validators.min(0)]],
      height: [data.height, [Validators.required, Validators.min(0)]],
    });

    this.changeDetectorRef.detectChanges();

    this.countryService.updatedCountry$.pipe(
      tap((product) => {
        this.form.setValue(product.shipping);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  protected onUpdateFormData(formValues: ShippingSection): void {
    this.sectionsService.onChangeShippingSection(this.form.getRawValue());
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}
