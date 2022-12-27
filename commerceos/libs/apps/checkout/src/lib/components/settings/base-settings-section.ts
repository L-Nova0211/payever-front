import { Directive, Injector, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { CORNERS, CORNERS_ICONS } from './color-and-style/constants';

@Directive({
  providers: [
    PeDestroyService,
  ],
})
export abstract class BaseSettingsSectionComponent {
  @Input() theme: AppThemeEnum;
  @Input() parentForm: FormGroup;

  readonly corners = CORNERS;
  readonly cornersIcons = CORNERS_ICONS;

  public translateService: TranslateService = this.injector.get(TranslateService);
  protected destroyed$: PeDestroyService = this.injector.get(PeDestroyService);

  constructor(
    protected injector: Injector
  ) {
  }
}
