import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { SelectOptionInterface } from '@pe/forms';

import { VariantOptionSectionType } from '../../shared/interfaces/section.interface';

@Injectable()
export class VariantStorageService {
  private temporaryVariant?: FormGroup;
  private colorOptions: SelectOptionInterface[] = [
    { value: 'Blue', label: 'Blue', hexColor: '#48A0F8' },
    { value: 'Green', label: 'Green', hexColor: '#81D552' },
    { value: 'Yellow', label: 'Yellow', hexColor: '#EEBD40' },
    { value: 'Pink', label: 'Pink', hexColor: '#DE68A5' },
    { value: 'Brown', label: 'Brown', hexColor: '#594139' },
    { value: 'Black', label: 'Black', hexColor: '#000000' },
    { value: 'White', label: 'White', hexColor: '#FFFFFF' },
    { value: 'Grey', label: 'Grey', hexColor: '#434243' },
  ];

  private sizeOptions: string[] = ['S', 'M', 'L'];
  private isEdit = false;
  private variantId = '';
  private colorFormControl?: FormControl;

  constructor(private formBuilder: FormBuilder) {}

  setVariantForm(isEdit: boolean, variantId: string, value?: FormGroup, colorFormControl?: FormControl): void {
    this.temporaryVariant = value;
    this.isEdit = isEdit;
    this.variantId = variantId;
    this.colorFormControl = colorFormControl;
  }

  clearTemporaryData(): void {
    this.temporaryVariant = undefined;
    this.isEdit = false;
    this.variantId = '';
    this.colorFormControl = undefined;
  }

  setNewVariantColor(color: SelectOptionInterface) {
    this.colorOptions = this.colorOptions.filter(({ value }) => value !== color.value).concat(color);
    if (this.colorFormControl) {
      const newValue = this.isEdit ? color.value : [...(this.colorFormControl.value || []), color.value];
      this.colorFormControl.patchValue(newValue);
      this.colorFormControl = undefined;
    }
  }

  getVariantForm(): FormGroup | undefined {
    return this.temporaryVariant;
  }

  getVariantColors(): SelectOptionInterface[] {
    return this.colorOptions;
  }

  addNewOption(type: VariantOptionSectionType): void {
    if (!this.temporaryVariant) {
      return;
    }
    const control = this.temporaryVariant.get('options') as FormArray;
    const value: string | any[] = this.getTypeDefaults(type);
    const newOption = this.formBuilder.group({
      name: [type.toLowerCase().replace(/^\w/, c => c.toUpperCase())],
      value: [value],
      type: [type],
    });
    control.push(newOption);
  }

  getIsEdit(): boolean {
    return this.isEdit;
  }

  getVariantId(): string {
    return this.variantId;
  }

  getTypeDefaults(type: VariantOptionSectionType): string | any[] {
    switch (type) {
      case VariantOptionSectionType.SIZE:
        return this.sizeOptions;
      case VariantOptionSectionType.COLOR:
        // tslint:disable-next-line:no-magic-numbers
        return this.colorOptions.slice(0, 3).map(option => option.value);
      default:
        return this.isEdit ? '' : [];
    }
  }
}
