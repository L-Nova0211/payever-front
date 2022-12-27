import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ColorPickerFormat, ErrorBag, FormAbstractComponent, FormScheme } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { AttributesSection, AttributeTypesEnum } from '../../../../shared/interfaces/section.interface';
import { SectionsService } from '../../../services';
import { LanguageService } from '../../../services/language.service';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'attributes-section',
  templateUrl: 'editor-attributes-section.component.html',
  styleUrls: ['editor-attributes-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorAttributesSectionComponent extends FormAbstractComponent<AttributesSection> implements OnInit {

  attributeTypeOptions: Array<{ label: string; value: AttributeTypesEnum }> = [];

  colorPickerFormat = ColorPickerFormat;

  formScheme: FormScheme;
  protected formStorageKey = 'attributessection.form';
  readonly section: ProductEditorSections = ProductEditorSections.Attributes;

  get attributesForm(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  constructor(
    injector: Injector,
    private sectionsService: SectionsService,
    private translateService: TranslateService,
    private languageService: LanguageService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.attributeTypeOptions = Object.keys(AttributeTypesEnum).map((key: AttributeTypesEnum) => {
      return {
        label: this.translateService.translate(`attributeType.${AttributeTypesEnum[key]}`),
        value: AttributeTypesEnum[key],
      };
    });

    merge(
      this.sectionsService.saveClicked$.pipe(
        tap(() => this.doSubmit())
      ),
      this.languageService.updatedLanguage$.pipe(
        tap(() => {
          const attributes = this.sectionsService.attributesSection;
          this.attributesForm.clear();

          attributes.forEach((attribute) => {
            this.addAttribute(attribute);
          });

          this.changeDetectorRef.detectChanges();
        })
      )
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  addAttribute(attribute?): void {
    attribute = attribute || { type: AttributeTypesEnum.text, name: '', value: '' };
    this.attributesForm.push(
      this.formBuilder.group({
        type: [attribute.type, Validators.required],
        name: [attribute.name, Validators.required],
        value: [attribute.value, Validators.required],
      }),
    );
  }

  removeAttribute(index: number): void {
    this.attributesForm.removeAt(index);
  }

  protected createForm(): void {
    const attributes = this.sectionsService.attributesSection;

    this.form = this.formBuilder.group({
      attributes: this.formBuilder.array([]),
    });

    attributes.forEach((attribute) => {
      this.addAttribute(attribute);
    });

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues): void {
    this.sectionsService.onChangeAttributesSection(formValues.attributes);
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}
