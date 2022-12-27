import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { DynamicFormServiceService, FormFieldInterface, FormFieldTypeEnum } from '@pe/shared/business-form';

import { CustomValidatorsService, DynamicFormService, ShortPhoneFieldName } from '../../services';
import { ControlDateService } from '../../services/control-date.service';
import { BaseBusinessFormComponent } from '../base-business-form.component';

@Component({
  selector: 'entry-dynamic-business-form',
  templateUrl: './dynamic-business-form.component.html',
  styleUrls: ['./dynamic-business-form.component.scss'],
  providers: [
    ControlDateService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicBusinessFormComponent extends BaseBusinessFormComponent implements OnInit {
  @Input() set businessForm(scheme: FormFieldInterface[]) {
    this.formScheme = scheme;
    this.createForm();
  };

  errorMessage = {};
  formScheme: FormFieldInterface[];
  FormFieldType: typeof FormFieldTypeEnum = FormFieldTypeEnum;

  formIsReady$ = new BehaviorSubject<boolean>(false);

  private controlDate: ControlDateService = this.injector.get(ControlDateService);
  private formServiceService: DynamicFormServiceService = this.injector.get(DynamicFormServiceService);
  private customValidatorsService: CustomValidatorsService = this.injector.get(CustomValidatorsService);
  private dynamicFormService: DynamicFormService = this.injector.get(DynamicFormService);

  customValidators = {
    [FormFieldTypeEnum.Phone]: this.customValidatorsService.phone(),
  }

  get isSubmitted(): boolean {
    return this._allowValidation;
  }

  ngOnInit(): void {
    this.updateValues();
  }

  trackByFn(index: number): number {
    return index;
  }

  createForm(): void {
    if (this.formScheme?.length) {
      this.form = this.formBuilder.group({});

      this.formScheme.forEach((field: FormFieldInterface) => {
        const deepControls = this.formServiceService.splitName(field.name);
        if (deepControls.length > 1) {
          this.createGroup(field, deepControls);
        } else {
          this.createControl(field);
          this.errorMessage = {
            ...this.errorMessage,
            [field.name]: '',
          }
        }
      });

      this.selectedPhoneCode();

      this.formIsReady$.next(true);
    }
  }

  getControl(controlName: string): AbstractControl {
    return this.form.get(controlName);
  }

  checkErrors(): void {
    this.formScheme.forEach((field: FormFieldInterface) => {
      if (this.form.get(field.name).invalid) {
        const entries = Object.entries(this.form.get(field.name).errors);
        entries.forEach(([key, value]) => {
          if (typeof value === 'object') {
            this.setErrorMessage(field.name, key, { field: this.fieldLabel(field.title), ...value });

            return;
          }

          this.setErrorMessage(field.name, key, { field: this.fieldLabel(field.title) });
        })
      }
    });
  }

  openDatepicker(event: MouseEvent, dateControl: AbstractControl): void {
    this.controlDate.openDatepicker(event, dateControl);
  }

  private selectedPhoneCode(): void {
    this.dynamicFormService.isSelectPhoneCode$.pipe(
      filter(d => d),
      take(1),
      switchMap(() => {
        this.createControl({
          name: ShortPhoneFieldName,
          type: FormFieldTypeEnum.Phone,
          required: true,
          placeholder: '',
          title: '',
        });

        return this.form.get(ShortPhoneFieldName).valueChanges.pipe(
          withLatestFrom(this.dynamicFormService.countryPhoneCode$),
          tap(([ value, countryPhoneCode ]: [string, string]) => {
            this.form.get(this.dynamicFormService.phoneFieldName).setValue(`${countryPhoneCode}${value}`);
            this.form.get(this.dynamicFormService.phoneFieldName).updateValueAndValidity();
          })
        )
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private setErrorMessage(fieldName: string, key: string, data: { [key: string]: string }): void {
    this.errorMessage[fieldName] = this.translateService.translate(`forms.registration.errors.${key}`, data);
  }

  private fieldLabel(controlName: string): string {
    return this.translateService.translate(controlName);
  }

  private createGroup(field: FormFieldInterface, deepControls: string[], index = 0, fromGroup = this.form) {
    const controls = cloneDeep(deepControls)

    const lastIndex = Math.max(controls.length - 1, 0);
    let group: FormGroup = fromGroup;

    controls.forEach((controlName, i) => {
      if (index !== lastIndex) {
        fromGroup.addControl(controlName, new FormGroup({}));
        group = fromGroup.controls[controlName] as FormGroup;

        controls.shift();
        this.createGroup(field, controls, i, group);
      } else {
        this.createControl(field, group, controlName);
      }
    })


  }

  private createControl(field: FormFieldInterface, group?: FormGroup, name?: string): void {
    const formGroup = group ?? this.form;

    formGroup.addControl(
      name ?? field.name,
      new FormControl(
        [FormFieldTypeEnum.Boolean].includes(field.type) ? false : null,
        this.fieldValidators(field)
      )
    );
  }

  private fieldValidators(field: FormFieldInterface): ValidatorFn[] {
    const validators: ValidatorFn[] = field.required ? [Validators.required] : [];

    if (this.customValidators[field.type]) {
      validators.push(this.customValidators[field.type]);
    }

    return validators;
  }
}
