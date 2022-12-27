import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';

import { BaseSettingsSectionComponent } from '../../base-settings-section';
import { StyleItemTypeEnum } from '../../enums';
import { FormSchemeInterface } from '../../interfaces';

@Component({
  selector: 'pe-input-style',
  template: `
    <pe-style-from-scheme
      *ngIf="formScheme"
      [theme]="theme"
      [formScheme]="formScheme"
      [parentForm]="parentForm"
    ></pe-style-from-scheme>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputStyleComponent extends BaseSettingsSectionComponent implements OnInit {
  formScheme: FormSchemeInterface;

  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.formScheme = {
      groups: [{
        controls: [{
          controlName: 'inputTextPrimaryColor',
          labelKey: 'settings.colorAndStyle.panelInputs.controls.inputTextPrimaryColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'inputTextSecondaryColor',
          labelKey: 'settings.colorAndStyle.panelInputs.controls.inputTextSecondaryColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'inputBackgroundColor',
          labelKey: 'settings.colorAndStyle.panelInputs.controls.inputBackgroundColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'inputBorderColor',
          labelKey: 'settings.colorAndStyle.panelInputs.controls.inputBorderColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'inputBorderRadius',
          labelKey: 'settings.colorAndStyle.panelInputs.titleCorners',
          type: StyleItemTypeEnum.CornerSelect,
        }],
      }],
    }
  }
}
