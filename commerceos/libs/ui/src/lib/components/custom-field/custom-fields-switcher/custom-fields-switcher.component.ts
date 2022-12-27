import {
  Component, ChangeDetectionStrategy, Input,
} from '@angular/core';

import { VirtualData } from '../../select';
import { FieldTypesEnum } from '../enums';
// import { FieldDto } from '../interfaces';

@Component({
  selector: 'pe-custom-fields-switcher',
  templateUrl: './custom-fields-switcher.component.html',
  styleUrls: ['./custom-fields-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeCutomFieldsSwitcherComponent {

  @Input() item!: any;
  @Input() animated = true;

  FieldTypesEnum = FieldTypesEnum;
}
