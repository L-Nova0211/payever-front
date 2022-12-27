import { Component, Injector } from '@angular/core';
import { isNumber } from 'lodash-es';
import { ReplaySubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { FormScheme } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  settings: {
    verificationType: number
  };
}

@Component({
  selector: 'communications-settings-verifyType',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class SettingsVerifyTypeComponent extends BaseSettingsComponent<FormInterface> {

  fieldsetsKey = 'settings';
  formScheme: FormScheme = {
    fieldsets: {
      settings: [
        {
          name: 'verificationType',
          type: 'select',
          fieldSettings: {
            classList: 'col-xs-12 true-height no-border-radius form-fieldset-field-padding-24',
          },
          selectSettings: {
            panelClass: 'mat-select-dark',
            options: [
              { value: 0, label: this.translateService.translate(
              'categories.communications.form.verificationType.value.0') },
              { value: 1, label: this.translateService.translate(
              'categories.communications.form.verificationType.value.1') },
            ],
          },
        },
      ],
    },
  };

  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(injector: Injector) {
    super(injector);
  }

  createFormDeferred(initialData: FormInterface) {
    this.stateService.getSettingsOnce(this.integrationName).pipe(
      tap((settings) => {
        this.form = this.formBuilder.group({
          settings: this.formBuilder.group({
            verificationType: [
              isNumber(settings['verificationType'])
                ? settings['verificationType']
                : null,
            ],
          }),
        });
        this.afterCreateFormDeferred();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
