import { Component, Injector, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Validators } from '@angular/forms';
import { cloneDeep, isEqual } from 'lodash-es';
import { Subject } from 'rxjs';

import { FieldSettingsInterface, FormAbstractComponent, FormScheme, FormSchemeField } from '@pe/forms';

import { AccordionPanelInterface, FieldsetData, InfoBoxActionInterface, InfoBoxNestedElementsInterface } from '../../interfaces';

export type DynamicInfoBoxGeneratorFormData = any;

interface ControlsConfigInterface {
  [key: string]: any;
}

@Component({
  selector: 'pe-info-box-generator-form',
  exportAs: 'infoBoxGeneratorForm',
  styleUrls: ['./info-box-generator-form.component.scss'],
  templateUrl: './info-box-generator-form.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class InfoBoxGeneratorFormComponent extends FormAbstractComponent<DynamicInfoBoxGeneratorFormData> implements OnInit {

  @Input() action: InfoBoxActionInterface;
  @Input() set fieldset(fieldset: FormSchemeField[]) {
    this.formScheme = {
      fieldsets: { fieldset: this.fixFieldsetStyles(fieldset) },
    };
  }

  get fieldset(): FormSchemeField[] {
    return this.formScheme && this.formScheme.fieldsets.fieldset;
  }

  @Input() fieldsetData: DynamicInfoBoxGeneratorFormData;
  @Input() submitOnChange = false;
  @Input() loading: boolean;
  @Input() nestedElements: InfoBoxNestedElementsInterface;

  @Output() change: Subject<DynamicInfoBoxGeneratorFormData> = new Subject();
  @Output() submit: Subject<DynamicInfoBoxGeneratorFormData> = new Subject();
  formScheme: FormScheme;
  formStorageKey = 'formStorageKey';
  lastFormValue: any = null;

  constructor(
    injector: Injector,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.tryInstantiateForm();
  }

  createForm(): void {
    if (this.fieldset) {
      this.fieldset.forEach(({ name, fieldSettings }) => {
        if (fieldSettings) {
          const settings = fieldSettings as FieldSettingsInterface;
          if (settings && settings.classList && settings.classList.includes('disabled')) {
            this.toggleControl(name, false);
          }
        }
      });
    }
  }

  onUpdateFormData(): void {
    if (!isEqual(this.lastFormValue, this.form.value)) {
      const firstRun: boolean = this.lastFormValue === null;
      this.lastFormValue = this.form.value;
      if (!firstRun) {
        if (this.submitOnChange) {
          this.submitForm();
        }
        this.change.next(this.form.value as DynamicInfoBoxGeneratorFormData);
      }
    }
  }

  onSuccess(): void {
    this.submitForm();
  }

  private submitForm(): void {
    this.submit.next(this.form.value as DynamicInfoBoxGeneratorFormData);
  }

  private tryInstantiateForm(): void {
    if (!this.form && this.fieldset && this.fieldsetData) {
      const nestedElements = this.handleNestedElements();
      this.form = this.formBuilder.group(
        this.normalizeFormScheme([...this.fieldset, ...nestedElements.fieldset], { ...this.fieldsetData, ...nestedElements.fieldsetData })
      );
    }
  }

  private normalizeFormScheme(
    fieldset: FormSchemeField[],
    fieldsetData: DynamicInfoBoxGeneratorFormData
  ): ControlsConfigInterface {
    const controlsConfig: ControlsConfigInterface = {};

    fieldset.forEach(({ name, type, fieldSettings }) => {
      controlsConfig[name] = [
        fieldsetData[name],
        (fieldSettings as FieldSettingsInterface).required ?
          [Validators.required] :
          [],
      ];
    });

    return controlsConfig;
  }

  private fixFieldsetStyles(fieldset: FormSchemeField[]): FormSchemeField[] {
    fieldset = cloneDeep(fieldset) || [];
    fieldset.forEach(({ name, type, fieldSettings }) => {
      if (fieldSettings && (fieldSettings as FieldSettingsInterface).classList) {
        (fieldSettings as FieldSettingsInterface).classList += ' form-fieldset-field-padding-24';
      }
      if (type === 'checkbox') {
        (fieldSettings as FieldSettingsInterface).classList += ' connect-checkbox connect-checkbox-nowrap';
      }
    });

    return fieldset;
  }

  private handleNestedElements(): {fieldset: FormSchemeField[], fieldsetData: FieldsetData} {
    const resultObj: {fieldset: FormSchemeField[], fieldsetData: FieldsetData} = { fieldset: [], fieldsetData: {} };

    if (!this.nestedElements) {
      return resultObj;
    }

    for (const prop in this.nestedElements) {
      if (this.nestedElements.hasOwnProperty(prop) && prop === 'accordion') {
        const accordionFormData = this.handleNestedAccordion(this.nestedElements[prop]);
        resultObj.fieldset = [...resultObj.fieldset, ...accordionFormData.fieldset];
        resultObj.fieldsetData = { ...resultObj.fieldsetData, ...accordionFormData.fieldsetData };
      }
    }

    return resultObj;
  }

  private handleNestedAccordion(accordion: AccordionPanelInterface[]): {fieldset: FormSchemeField[], fieldsetData: FieldsetData} {
    let fieldset: FormSchemeField[] = [],
      fieldsetData: FieldsetData = {};

    accordion.forEach((panel) => {
      fieldset = [...fieldset, ...panel.fieldset];
      fieldsetData = { ...fieldsetData, ...panel.fieldsetData };
    });

    return { fieldset, fieldsetData };
  }
}
