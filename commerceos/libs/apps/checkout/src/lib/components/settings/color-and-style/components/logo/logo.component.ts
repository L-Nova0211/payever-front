import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';

import { BaseSettingsSectionComponent } from '../../base-settings-section';
import { ALIGNMENTS } from '../../constants';
import { StyleItemTypeEnum, ScreenTypeEnum } from '../../enums';
import { FormSchemeInterface } from '../../interfaces';
import { ScreenTypeStylesService } from '../../services/screen-type.service';

@Component({
  selector: 'pe-logo-styles',
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
export class LogoStylesComponent extends BaseSettingsSectionComponent implements OnInit {
  readonly alignmentIcons = ALIGNMENTS;

  formScheme: FormSchemeInterface;

  constructor(
    protected injector: Injector,
    private screenTypeStylesService: ScreenTypeStylesService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.formScheme = {
      groups: [{
        controls: [{
          controlName: 'businessLogoDesktopWidth',
          labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoWidth',
          type: StyleItemTypeEnum.InputPx,
          screen: [ScreenTypeEnum.Desktop],
        },
        {
          controlName: 'businessLogoMobileWidth',
          labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoWidth',
          type: StyleItemTypeEnum.InputPx,
          screen: [ScreenTypeEnum.Mobile],
        },
        {
          controlName: 'businessLogoDesktopHeight',
          labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoHeight',
          type: StyleItemTypeEnum.InputPx,
          screen: [ScreenTypeEnum.Desktop],
        },
        {
          controlName: 'businessLogoMobileHeight',
          labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoHeight',
          type: StyleItemTypeEnum.InputPx,
          screen: [ScreenTypeEnum.Mobile],
        }],
      }, {
        modals: [{
          titleKey: 'settings.colorAndStyle.panelLogo.modals.padding',
          controls: [{
            controlName: 'businessLogoDesktopPaddingTop',
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingTop',
            type: StyleItemTypeEnum.InputPx,
            screen: [ScreenTypeEnum.Desktop],
          },
          {
            controlName: 'businessLogoMobilePaddingTop',
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingTop',
            type: StyleItemTypeEnum.InputPx,
            screen: [ScreenTypeEnum.Mobile],
          },
          {
            controlName: 'businessLogoDesktopPaddingRight',
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingRight',
            type: StyleItemTypeEnum.InputPx,
            screen: [ScreenTypeEnum.Desktop],
          },
          {
            controlName: 'businessLogoMobilePaddingRight',
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingRight',
            type: StyleItemTypeEnum.InputPx,
            screen: [ScreenTypeEnum.Mobile],
          },
          {
            controlName: 'businessLogoDesktopPaddingBottom',
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingBottom',
            type: StyleItemTypeEnum.InputPx,
            screen: [ScreenTypeEnum.Desktop],
          },
          {
            controlName: 'businessLogoMobilePaddingBottom',
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingBottom',
            type: StyleItemTypeEnum.InputPx,
            screen: [ScreenTypeEnum.Mobile],
          },
          {
            controlName: 'businessLogoDesktopPaddingLeft',
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingLeft',
            type: StyleItemTypeEnum.InputPx,
            screen: [ScreenTypeEnum.Desktop],
          },
          {
            controlName: 'businessLogoMobilePaddingLeft',
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingLeft',
            type: StyleItemTypeEnum.InputPx,
            screen: [ScreenTypeEnum.Mobile],
          }],
        },
        {
          titleKey: 'settings.colorAndStyle.panelLogo.modals.alignment',
          controls: [{
            controlName: 'businessLogoDesktopAlignment',
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoAlignment.title',
            type: StyleItemTypeEnum.Alignment,
            screen: [ScreenTypeEnum.Desktop],
          },
          {
            controlName: 'businessLogoMobileAlignment',
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoAlignment.title',
            type: StyleItemTypeEnum.Alignment,
            screen: [ScreenTypeEnum.Mobile],
          }],
        }],
      }],
    };
  }
}
