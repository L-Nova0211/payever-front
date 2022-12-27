import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';

import { BaseSettingsSectionComponent } from '../../base-settings-section';
import { ScreenTypeEnum, StyleItemTypeEnum } from '../../enums';
import { FormSchemeInterface } from '../../interfaces';

@Component({
  selector: 'pe-header-styles',
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
export class HeaderStylesComponent extends BaseSettingsSectionComponent implements OnInit {
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
          controlName: 'businessHeaderBackgroundColor',
          labelKey: 'settings.colorAndStyle.panelBusinessHeader.controls.businessHeaderBackgroundColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'businessHeaderBorderColor',
          labelKey: 'settings.colorAndStyle.panelBusinessHeader.controls.businessHeaderBorderColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        }],
      },
      {
        controls: [{
          controlName: 'businessHeaderDesktopHeight',
          labelKey: 'settings.colorAndStyle.panelBusinessHeader.controls.businessHeaderDesktopHeight',
          type: StyleItemTypeEnum.InputPx,
          screen: [ScreenTypeEnum.Desktop],
        },
        {
          controlName: 'businessHeaderMobileHeight',
          labelKey: 'settings.colorAndStyle.panelBusinessHeader.controls.businessHeaderMobileHeight',
          type: StyleItemTypeEnum.InputPx,
          screen: [ScreenTypeEnum.Mobile],
        }],
      }],
    }
  }
}
