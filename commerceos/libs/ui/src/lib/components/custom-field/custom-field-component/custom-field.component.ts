import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

import { PebTranslateService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { FieldTypesEnum } from '../enums';
// import { FieldDto } from '../interfaces';

@Component({
  selector: 'pe-custom-field',
  templateUrl: './custom-field.component.html',
  styleUrls: ['./custom-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeCutomFieldComponent implements OnInit {

  onCloseSubject$ = new Subject<any>();
  onClose$ = this.onCloseSubject$.asObservable();
  field?: any;
  id: string;

  fieldTypes = [
    FieldTypesEnum.Text,
    FieldTypesEnum.Paragraph,
    FieldTypesEnum.Checkbox,
    FieldTypesEnum.Dropdown,
    FieldTypesEnum.Multiselect,
    FieldTypesEnum.RadioButton,
  ];

  newField: FormGroup = this.formBuilder.group({
    title: ['', Validators.required],
    type: [FieldTypesEnum.Text, [Validators.required]],
    filterable: [true, Validators.required],
    editableByAdmin: [false, Validators.required],
    showDefault: [false, Validators.required],
    showOn: [[]],
    defaultValues: this.formBuilder.array([]),
  })  as FormGroup;

  errors = {
    defaultValues: [],
    title: {
      hasError: false,
      message: '',
    },
  };


  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translate:PebTranslateService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef, 
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
  ) {
  }

  ngOnInit(): void {
    if (this.field) {
      this.id = this.field._id;
      this.newField.patchValue(this.field);
      this.defaultValues.reset();
      this.field.defaultValues.forEach(option => { 
        this.addOptionToForm(option); 
      });
      this.cdr.detectChanges()
    }
  }

  get defaultValues(): FormArray {
    return this.newField.get('defaultValues') as FormArray;
  }

  public hasOptions(item: FieldTypesEnum): Boolean {
    return [
      FieldTypesEnum.Dropdown,
      FieldTypesEnum.Multiselect,
      FieldTypesEnum.RadioButton,
    ].includes(item);
  }

  deleteAdditionalOptions(startIndex: number): void {
    let length = this.defaultValues?.value.length
    for(let i = startIndex; i < length; i++)
    {
      if(this.defaultValues?.value[i].name === '')
      {
        this.onDeleteOption(i);
        length--;
        i--;
        this.cdr.detectChanges();
      }
    }
  }

  updateOptionList(startIndex: number): void {
    if (this.defaultValues?.value?.length < startIndex) {
      this.onAddOption();
      this.updateOptionList(startIndex);
    } else if (this.defaultValues?.value?.length > startIndex) {
      this.deleteAdditionalOptions(startIndex);
    }
  }

  onUpdateOptionsList($item): void {
    if(this.hasOptions($item)) {
      switch($item) {
        case FieldTypesEnum.RadioButton: this.updateOptionList(2); break;
        default: this.updateOptionList(1); break;
      }
    }
  }

  public showOptions(): Boolean {
    return this.hasOptions(this.newField.controls.type.value);
  }

  public onDropSortOptions(event: CdkDragDrop<string[]>): void {
    this.swapOptions(event.previousIndex, event.currentIndex);
  }

  public swapOptions(previousIndex: number, currentIndex: number) {
    const ascOrder = previousIndex < currentIndex;
    for(
      let i = previousIndex + +ascOrder; 
      (ascOrder && i <= currentIndex) || (!ascOrder && i > currentIndex);  
      i += ascOrder ? 1 : -1
      ) {
      this.moveItemInFormArray(this.defaultValues, i, i - 1);
    }
    this.cdr.detectChanges();
  }

  clamp(value: number, max: number): number {
    return Math.max(0, Math.min(max, value));
  }

  public moveItemInFormArray(formArray: FormArray, fromIndex: number, toIndex: number): void {
    const from = this.clamp(fromIndex, formArray.length - 1);
    const to = this.clamp(toIndex, formArray.length - 1);

    if (from === to) {
      return;
    }

    const previous = formArray.at(from);
    const current = formArray.at(to);

    formArray.setControl(to, previous);
    formArray.setControl(from, current);
  }

  onAddOption() {
    this.addOptionToForm('');
    this.cdr.detectChanges();
  }

  addOptionToForm(option: string) {
    this.errors.defaultValues.push({});
    this.defaultValues.push(this.formBuilder.group({ name: [option, Validators.required] }))
  }

  checkInArrayErrors(index: number) {
    const field = 'defaultValues';
    if (this.defaultValues.controls[index].invalid && this.errors[field][index]) {
      (this.errors[field][index] as any).hasError = true;
      if ((this.defaultValues.controls[index] as FormGroup).controls.name.errors.required) {
        (this.errors[field][index] as any).message = this.translate.translate(`custom_field.messages.option`)
      }

      return;
    }
  }

  checkErrors(field) {
    const form = this.newField.get(field);
    if (form.invalid && this.errors[field]) {
      this.errors[field].hasError = true;

      if (form.errors.required) {
        this.errors[field].message = this.translate.hasTranslation(`custom_field.messages.${field}`)
        ? this.translate.translate(`custom_field.messages.${field}`)
        : field + this.translate.translate('custom_field.messages.unknown');
      }

      return;
    }
  }

  canDeleteOption() {
    switch(this.newField.controls.type.value) {
      case FieldTypesEnum.RadioButton: return this.defaultValues?.value?.length <= 2;
      default: return this.defaultValues?.value?.length <= 1
    }
  }

  onDeleteOption(index) {
    this.defaultValues.removeAt(index);
    this.errors.defaultValues.splice(index, 1);
    this.cdr.detectChanges();
  }

  resetError(field) {
    this.errors[field].hasError = false;
  }

  resetInArrayErrors(index) {
    const field = 'defaultValues';
    this.errors[field][index].hasError = false;
  }

  close(): void {
    this.onCloseSubject$.next(null);
  }

  save(): void {
    if (this.newField.valid) {
      const itemToSave = this.newField.value;
      itemToSave.defaultValues = this.newField.controls.defaultValues.value.map(item => item.name);
      itemToSave._id = this.id
      this.onCloseSubject$.next(itemToSave);
    } else {
      this.checkErrors('title');
      this.newField.controls.defaultValues.value.forEach((_, index) => {
        this.checkInArrayErrors(index);
      })
      this.changeDetectorRef.detectChanges();
    }
  }
}
