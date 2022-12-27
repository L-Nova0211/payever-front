import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { filter, takeUntil } from 'rxjs/operators';

import { ErrorBag, FormAbstractComponent, FormScheme } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { Filter } from '../../../../shared/interfaces/filter.interface';
import { CollectionEditorSections, ConditionClause, ConditionProperty, ConditionsType } from '../../../enums';
import { MainSection } from '../../../interfaces';
import { CollectionSectionsService } from '../../../services';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'main-section',
  templateUrl: 'editor-main-section.component.html',
  styleUrls: ['editor-main-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class CollectionEditorMainSectionComponent extends
  FormAbstractComponent<MainSection> implements OnInit, AfterViewInit {
  ConditionsType = ConditionsType;

  protected formStorageKey = 'mainSection.form';
  readonly section: CollectionEditorSections = CollectionEditorSections.Main;

  currency: string;
  mainSection: MainSection = this.sectionsService.mainSection;
  formScheme: FormScheme;
  formTranslationsScope = 'collections.mainSection.form';
  blob = '';

  get conditionsForm(): FormArray {
    // @ts-ignore
    return this.form.get('conditions');
  }

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private readonly translateService: TranslateService,
    private sectionsService: CollectionSectionsService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.sectionsService.saveClicked$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.doSubmit();
    });

    this.sectionsService.recurringBillingChange$.pipe(
      takeUntil(this.destroyed$), filter(d => !!d)).subscribe((data) => {
      this.toggleControl('onSales', !data.enabled);
    });
  }

  onChangePicture(blob: string): void {
    this.blob = blob;
    this.sectionsService.onChangeMainSection(Object.assign({}, this.form.getRawValue(), { image: this.blob }));
  }

  onPicturesLoadingChanged(loading: boolean): void {
    this.sectionsService.isUpdating$.next(loading);
  }

  onDescriptionChange(text: string): void {
    this.form.get('description').setValue(text);
  }

  onAddCondition(condition?: Filter): void {
    condition = condition || { key: ConditionProperty.ProductTitle, value: '', condition: ConditionClause.Is };
    this.conditionsForm.push(
      this.formBuilder.group({
        key: condition.key,
        value: condition.value,
        condition: condition.condition,
      }),
    );
  }

  onDeleteCondition(index: number): void {
    this.conditionsForm.removeAt(index);
  }

  protected createForm(initialData: MainSection): void {
    this.form = this.formBuilder.group({
      name: [this.mainSection.name, Validators.required],
      conditionsType: [this.mainSection.conditions.type, Validators.required],
      conditions: this.formBuilder.array([]),
    });
    if (this.mainSection.conditions.type !== ConditionsType.NoCondition) {
      this.initConditions();
    }
    this.form.get('conditionsType').valueChanges.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((nextConditionsType: ConditionsType) => {
      if (nextConditionsType === ConditionsType.NoCondition) {
        this.resetConditions();
      } else if (this.conditionsForm.controls.length === 0) {
        this.initConditions();
      }
    });

    const conditionsTypes = Object.keys(ConditionsType).map((key: ConditionsType) => {
      return {
        label: this.translateService.translate(`collections.condition_types.${ConditionsType[key]}`),
        value: ConditionsType[key],
      };
    });
    const conditions = Object.keys(ConditionClause).map((key: ConditionClause) => {
      return {
        value: ConditionClause[key],
        label: this.translateService.translate(`collections.conditions.${ConditionClause[key]}`),
      };
    });
    const conditionsProperties = Object.keys(ConditionProperty).map((key: ConditionProperty) => {
      return {
        value: ConditionProperty[key],
        label: this.translateService.translate(`collections.conditions_field.${ConditionProperty[key]}`),
      };
    });

    this.formScheme = {
      fieldsets: {
        main: [
          {
            name: 'name',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-12 form-fieldset-field-padding',
              required: true,
            },
            inputSettings: {
              placeholder: this.translateService.translate('collections.mainSection.form.title.placeholder'),
              autocompleteAttribute: 'off',
            },
          },
        ],
        conditionsType: [
          {
            name: 'conditionsType',
            type: 'select',
            fieldSettings: {
              classList: `col-xs-12`,
              required: true,
            },
            selectSettings: {
              options: conditionsTypes,
              panelClass: 'mat-select-dark',
            },
          },
        ],
        condition: [
          {
            name: 'key',
            type: 'select',
            fieldSettings: {
              classList: `col-xs-4`,
              required: true,
            },
            selectSettings: {
              options: conditionsProperties,
              panelClass: 'mat-select-dark',
            },
          },
          {
            name: 'condition',
            type: 'select',
            fieldSettings: {
              classList: `col-xs-4`,
              required: true,
            },
            selectSettings: {
              options: conditions,
              panelClass: 'mat-select-dark',
            },
          },
          {
            name: 'value',
            type: 'input',
            fieldSettings: {
              classList: `col-xs-4`,
              required: true,
            },
          },
        ],
      },
    };

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: MainSection): void {
    const rawValues: MainSection = this.form.getRawValue();
    rawValues.conditions = {
      type: this.form.getRawValue().conditionsType,
      filters: this.conditionsForm.getRawValue(),
    };
    this.sectionsService.onChangeMainSection(Object.assign({}, rawValues, { image: this.blob }));
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }

  private resetConditions() {
    this.conditionsForm.controls = [];
  }

  private initConditions() {
    if (this.mainSection.conditions.filters.length > 0) {
      this.mainSection.conditions.filters.forEach(condition => this.onAddCondition(condition));
    } else if (!this.sectionsService.isEdit) {
      this.onAddCondition();
    }
  }
}
