import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeAppointmentsFieldTypesEnum } from '../../enums';
import { FieldDto } from '../../interfaces';

@Component({
  selector: 'pe-custom-field-editor',
  templateUrl: './custom-field-editor.component.html',
  styleUrls: ['./custom-field-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeAppointmentsCutomFieldEditorComponent implements OnInit {
  public readonly fieldTypes = Object.values(PeAppointmentsFieldTypesEnum);
  public readonly customFieldForm = this.formBuilder.group({
    defaultValues: this.formBuilder.array([]),
    editableByAdmin: [false],
    filterable: [true],
    showDefault: [false],
    title: ['', Validators.required],
    type: [PeAppointmentsFieldTypesEnum.Text],
  });

  public errors = {
    defaultValues: [],
    title: {
      hasError: false,
      message: '',
    },
  };

  public readonly theme = this.peOverlayConfig.theme;

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,

    @Inject(PE_OVERLAY_DATA) private peOverlayData: FieldDto,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    private translate: TranslateService,
  ) {
    this.peOverlayConfig.doneBtnCallback = () => {
      this.save();
    }
    this.peOverlayConfig.backBtnCallback = () => {
      this.peOverlayConfig.onSaveSubject$.next(null);
    }
  }

  ngOnInit(): void {
    const customField = this.peOverlayData;
    if (customField) {
      this.customFieldForm.patchValue(customField);
      this.defaultValues.reset();
      customField.defaultValues.forEach((option) => { 
        this.addOptionToForm(option); 
      });
      this.cdr.detectChanges();
    }
  }

  public get defaultValues(): FormArray {
    return this.customFieldForm.controls.defaultValues as FormArray;
  }

  public get showOptions(): Boolean {
    return this.hasOptions(this.customFieldForm.controls.type.value);
  }

  private hasOptions(fieldType: PeAppointmentsFieldTypesEnum): Boolean {
    return [
      PeAppointmentsFieldTypesEnum.Dropdown,
      PeAppointmentsFieldTypesEnum.Multiselect,
      PeAppointmentsFieldTypesEnum.RadioButton,
    ].includes(fieldType);
  }

  private deleteAdditionalOptions(startIndex: number): void {
    let length = this.defaultValues.value.length
    for (let i = startIndex; i < length; i++)
    {
      if (this.defaultValues.value[i].name === '')
      {
        this.onDeleteOption(i);
        length--;
        i--;
        this.cdr.detectChanges();
      }
    }
  }

  public onUpdateOptionsList(fieldType: PeAppointmentsFieldTypesEnum): void {
    if (this.hasOptions(fieldType)) {
      const quantityOfOptions = fieldType === PeAppointmentsFieldTypesEnum.RadioButton ? 2 : 1;
      this.updateOptionList(quantityOfOptions);
    }
  }

  private updateOptionList(startIndex: number): void {
    if (this.defaultValues.value.length < startIndex) {
      this.onAddOption();
      this.updateOptionList(startIndex);
    } else if (this.defaultValues.value.length > startIndex) {
      this.deleteAdditionalOptions(startIndex);
    }
  }

  public onAddOption(): void {
    this.addOptionToForm('');
    this.cdr.detectChanges();
  }

  private addOptionToForm(option = ''): void {
    this.errors.defaultValues.push({});
    this.defaultValues.push(this.formBuilder.group({ name: [option, Validators.required] }));
  }

  public onDropSortOptions(event: CdkDragDrop<string[]>): void {
    this.swapOptions(event.previousIndex, event.currentIndex);
  }

  public swapOptions(previousIndex: number, currentIndex: number): void {
    const ascOrder = previousIndex < currentIndex;
    for (
      let i = previousIndex + +ascOrder;
      (ascOrder && i <= currentIndex) || (!ascOrder && i > currentIndex);
      i += ascOrder ? 1 : -1
    ) {
      this.moveItemInFormArray(this.defaultValues, i, i - 1);
    }
    this.cdr.detectChanges();
  }

  public moveItemInFormArray(formArray: FormArray, fromIndex: number, toIndex: number): void {
    const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));
    const from = clamp(fromIndex, formArray.length - 1);
    const to = clamp(toIndex, formArray.length - 1);

    if (from === to) {
      return;
    }

    const previous = formArray.at(from);
    const current = formArray.at(to);
    formArray.setControl(to, previous);
    formArray.setControl(from, current);
  }

  public checkInArrayErrors(index: number): void {
    const field = 'defaultValues';
    if (this.defaultValues.controls[index].invalid && this.errors[field][index]) {
      (this.errors[field][index] as any).hasError = true;
      if ((this.defaultValues.controls[index] as FormGroup).controls.name.errors.required) {
        (this.errors[field][index] as any).message = this.translate.translate(`custom_field.messages.option`)
      }

      return;
    }
  }

  public checkErrors(field): void {
    const form = this.customFieldForm.get(field);
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

  public canDeleteOption(): boolean {
    return this.customFieldForm.controls.type.value === PeAppointmentsFieldTypesEnum.RadioButton
      ? this.defaultValues.value.length <= 2
      : this.defaultValues.value.length <= 1;
  }

  public onDeleteOption(index): void {
    this.defaultValues.removeAt(index);
    this.errors.defaultValues.splice(index, 1);
    this.cdr.detectChanges();
  }

  public resetError(field): void {
    this.errors[field].hasError = false;
  }

  public resetInArrayErrors(index): void {
    const field = 'defaultValues';
    this.errors[field][index].hasError = false;
  }

  close(): void {
    this.peOverlayConfig.onSaveSubject$.next(null);
  }

  save(): void {
    if (this.customFieldForm.valid) {
      const itemToSave = this.customFieldForm.value;
      itemToSave.defaultValues = this.defaultValues.value.map(item => item.name);
      itemToSave._id = this.peOverlayData?._id;
      this.peOverlayConfig.onSaveSubject$.next(itemToSave);
    } else {
      this.checkErrors('title');
      this.defaultValues.value.forEach((_, index) => {
        this.checkInArrayErrors(index);
      })
      this.cdr.detectChanges();
    }
  }
}
