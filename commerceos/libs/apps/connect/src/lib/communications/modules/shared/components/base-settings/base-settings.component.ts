import { EventEmitter, Injector, Input, Output, Directive } from '@angular/core';
import { cloneDeep, isEqual } from 'lodash-es';

import { BaseFormComponent } from '../base-form.component';
import { SettingsOptionsInterface } from '../base-main.component';

@Directive()
export abstract class BaseSettingsComponent<T> extends BaseFormComponent<T> {

  @Input() integrationName: string;
  @Output() changed: EventEmitter<SettingsOptionsInterface> = new EventEmitter();

  startValue: T = {} as any;
  hideDisabled = false;

  constructor(injector: Injector) {
    super(injector);
  }

  get integrationNameValue() {
    return this.integrationName;
  }

  formStorageKey = 'communications-settings-' + this.integrationNameValue;

  afterCreateFormDeferred() {
  }

  protected onUpdateFormData(formValues: any): void {
    if (this.startValue && formValues && !isEqual(this.startValue, formValues)) {
      this.startValue = cloneDeep(this.form.value);
      this.changed.emit(this.form.value);
    }
  }

  onSuccess(): void {
    return;
  }
}
