import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { AppThemeEnum } from '@pe/common';

import { StyleItemTypeEnum } from '../../enums';

@Component({
  selector: 'pe-style-item',
  templateUrl: './style-item.component.html',
  styles: [`
    :host {
      display: contents;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleItemComponent {
  @Input() theme: AppThemeEnum;
  @Input() control: AbstractControl;
  @Input() type: StyleItemTypeEnum;
  @Input() buttonLabelTranslateKey: string;
  @Input() labelTranslateKey: string;

  StyleItemTypeEnum: typeof StyleItemTypeEnum = StyleItemTypeEnum
}
