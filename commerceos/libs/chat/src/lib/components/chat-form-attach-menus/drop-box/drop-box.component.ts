import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import { PeDestroyService } from '@pe/common';


@Component({
  selector: 'pe-drop-box',
  styleUrls: ['./drop-box.component.scss'],
  templateUrl: './drop-box.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeDropBoxComponent {
  @Input() icon: string;
  @Input() height: string;
  @Input() width: string;
  @Input() subtitle: string;
}
