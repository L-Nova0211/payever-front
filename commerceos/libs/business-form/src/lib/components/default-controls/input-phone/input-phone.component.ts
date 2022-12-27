import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { DynamicFormService, ShortPhoneFieldName } from '../../../services';
import { BaseControlComponent } from '../base-control.component';

@Component({
  selector: 'pe-input-phone',
  templateUrl: './input-phone.component.html',
  styleUrls: ['../control-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPhoneComponent extends BaseControlComponent implements OnInit {

  private dynamicFormService: DynamicFormService = this.injector.get(DynamicFormService);

  get useShortNumber(): boolean {
    return this.dynamicFormService.useShortNumber;
  }

  get shortPhoneFieldName(): string {
    return ShortPhoneFieldName;
  }

  ngOnInit(): void {
    this.dynamicFormService.phoneFieldName = this.controlScheme.name;
  }

}
