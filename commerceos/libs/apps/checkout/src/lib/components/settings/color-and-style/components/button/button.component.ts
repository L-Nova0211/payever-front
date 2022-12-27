import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';

import { BaseSettingsSectionComponent } from '../../base-settings-section';
import { StyleItemTypeEnum } from '../../enums';
import { FormSchemeInterface } from '../../interfaces';

@Component({
  selector: 'pe-button-styles',
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
export class ButtonStylesComponent extends BaseSettingsSectionComponent implements OnInit {
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
          controlName: 'buttonTextColor',
          labelKey: 'settings.colorAndStyle.panelButtons.controls.buttonTextColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'buttonBackgroundColor',
          labelKey: 'settings.colorAndStyle.panelButtons.controls.buttonBackgroundColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'buttonBackgroundDisabledColor',
          labelKey: 'settings.colorAndStyle.panelButtons.controls.buttonBackgroundDisabledColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'buttonBorderRadius',
          labelKey: 'settings.colorAndStyle.panelButtons.titleCorners',
          type: StyleItemTypeEnum.CornerSelect,
        }],
      }],
    }
  }
}

