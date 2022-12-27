import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

import { AppThemeEnum } from '@pe/common';

@Component({
  selector: 'pe-message-overlay',
  templateUrl: 'message-overlay.component.html',
  styleUrls: ['./message-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeMessageOverlayComponent {
  theme: AppThemeEnum;
  businessId: string;
}
