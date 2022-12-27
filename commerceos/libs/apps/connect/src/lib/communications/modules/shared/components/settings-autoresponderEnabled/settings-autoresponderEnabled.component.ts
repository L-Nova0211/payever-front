import { Component, Injector } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { FormScheme, SlideToggleLabelPosition } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  settings: {
    autoresponderEnabled: boolean
  };
}

@Component({
  selector: 'communications-settings-autoresponderEnabled',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class SettingsAutoresponderEnabledComponent extends BaseSettingsComponent<FormInterface> {

  fieldsetsKey = 'settings';
  isSaveAsFormOptions = true;

  formScheme: FormScheme = {
    fieldsets: {
      settings: [
        {
          name: 'autoresponderEnabled',
          type: 'slide-toggle',
          fieldSettings: {
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24form-fieldset-field-no-padding-mobile',
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
            autoresponderEnabled: [Boolean(settings['autoresponderEnabled'])],
          }),
        });
        this.afterCreateFormDeferred();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
