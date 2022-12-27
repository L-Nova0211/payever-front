import { Component, Injector } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';

import { FormScheme, SlideToggleLabelPosition } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  settings: {
    secondFactor: boolean,
  };
}

@Component({
  selector: 'communications-settings-secondFactor',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class SettingsSecondFactorComponent extends BaseSettingsComponent<FormInterface> {

  fieldsetsKey = 'settings';
  isSaveAsFormOptions = true;

  formScheme: FormScheme = {
    fieldsets: {
      settings: [
        {
          name: 'secondFactor',
          type: 'slide-toggle',
          fieldSettings: {
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24 form-fieldset-field-no-padding-mobile',
          },
          slideToggleSettings: {
            fullWidth: true,
            labelPosition: SlideToggleLabelPosition.Before,
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
            secondFactor: [Boolean(settings['secondFactor'])],
          }),
        });
        this.afterCreateFormDeferred();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
