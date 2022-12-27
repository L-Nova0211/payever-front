import { Directive, Injector, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { AppThemeEnum } from '@pe/common';

@Directive()
export abstract class BaseStyleItemComponent {
  @Input() theme: AppThemeEnum;
  @Input() control: AbstractControl;
  @Input() buttonLabelTranslateKey: string;
  @Input() labelTranslateKey: string;

  constructor(
    protected injector: Injector
  ) {}
}
