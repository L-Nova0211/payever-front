import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';

import { BaseSettingsSectionComponent } from '../../base-settings-section';
import { StyleItemTypeEnum } from '../../enums';
import { FormSchemeInterface } from '../../interfaces';

@Component({
  selector: 'pe-page-styles',
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
export class PageStylesComponent extends BaseSettingsSectionComponent implements OnInit {
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
          controlName: 'pageBackgroundColor',
          labelKey: 'settings.colorAndStyle.panelPage.controls.pageBackgroundColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'pageLineColor',
          labelKey: 'settings.colorAndStyle.panelPage.controls.pageLineColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'pageTextPrimaryColor',
          labelKey: 'settings.colorAndStyle.panelPage.controls.pageTextPrimaryColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'pageTextSecondaryColor',
          labelKey: 'settings.colorAndStyle.panelPage.controls.pageTextSecondaryColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        },
        {
          controlName: 'pageTextLinkColor',
          labelKey: 'settings.colorAndStyle.panelPage.controls.pageTextLinkColor',
          type: StyleItemTypeEnum.ColorPicker,
          buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
        }],
      }],
    }
  }
}
