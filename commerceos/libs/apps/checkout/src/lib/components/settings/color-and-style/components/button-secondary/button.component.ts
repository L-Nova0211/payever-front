import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';

import { BaseSettingsSectionComponent } from '../../base-settings-section';
import { StyleItemTypeEnum } from '../../enums';
import { FormSchemeInterface } from '../../interfaces';

@Component({
  selector: 'pe-button-secondary-styles',
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
export class ButtonSecondaryStylesComponent extends BaseSettingsSectionComponent implements OnInit {
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
          controlName: 'buttonSecondaryTextColor',
          labelKey: 'settings.colorAndStyle.panelButtons.controls.buttonTextColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'buttonSecondaryBackgroundColor',
          labelKey: 'settings.colorAndStyle.panelButtons.controls.buttonBackgroundColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'buttonSecondaryBackgroundDisabledColor',
          labelKey: 'settings.colorAndStyle.panelButtons.controls.buttonBackgroundDisabledColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'buttonSecondaryBorderRadius',
          labelKey: 'settings.colorAndStyle.panelButtons.titleCorners',
          type: StyleItemTypeEnum.CornerSelect,
        }],
      }],
    }
  }
}

