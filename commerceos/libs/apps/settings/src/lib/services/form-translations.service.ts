import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

import { TranslateService } from '@pe/i18n';

import { MOBILE_PHONE_PATTERN } from '../misc/constants/validation-patterns.constants';

@Injectable()
export class FormTranslationsService {
  formTranslationNamespace: string;
  private readonly errorsLocalesMap = {
    required: 'common.forms.validations.required',
    email: 'common.forms.validations.email.invalid',
    [`${MOBILE_PHONE_PATTERN.toString()}`]: 'common.forms.validations.pattern.mobile_phone',
  };

  constructor(private translateService: TranslateService) { }

  salutation = [
    { label: this.translateService.translate(`form.create_form.personal_information.salutation.mr`), value: 'mr' },
    { label: this.translateService.translate(`form.create_form.personal_information.salutation.mrs`), value: 'mrs' },
  ];

  getErrorMessage(errorName: string): string {
    return this.translateService.translate(this.errorsLocalesMap[errorName]);
  }

  getAllErrorMessages(errors: ValidationErrors): string[] {
    const allErrorNames = Object.keys(errors || {});

    return allErrorNames.map(errorName => this.getErrorMessage(errorName));
  }

  getFormControlErrorMessage(formControlName: string) {
    const requiredFields = [
      'last_name',
      'first_name',
      'salutation',
      'country',
      'city',
      'street',
      'zip_code',
      'bankAccount.owner',
      'bankAccount.accountNumber',
      'password',
      'repeat_password',
      'current_password',
    ];

    if (requiredFields.includes(formControlName)) {
      return this.translateService.translate(`common.forms.validations.required`);
    }

    if (['email', 'phone'].includes(formControlName)){
      return this.translateService.translate(`${this.formTranslationNamespace}.${formControlName}.label`) + ' ' +
        this.translateService.translate(`form.create_form.errors.${formControlName}_pattern`);
    }

    if (['additional_phone'].includes(formControlName)){
      return this.translateService.translate(`${this.formTranslationNamespace}.${formControlName}.label`) + ' ' +
        this.translateService.translate(`form.create_form.errors.phone_pattern`);
    }
  }

  getFormControlLabel(formControlName: string) {
    return this.translateService.translate(`${this.formTranslationNamespace}.${formControlName}.label`);
  }

  getFormControlPlaceholder(formControlName: string) {
    return this.translateService.translate(`${this.formTranslationNamespace}.${formControlName}.placeholder`);
  }
}
