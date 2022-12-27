import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PebScreen } from '@pe/builder-core';

@Component({
  selector: 'peb-viewer-device-frame',
  templateUrl: './device-frame.component.html',
  styleUrls: ['./device-frame.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ transform: 'scale(0.75)', opacity: 0 }),
            animate('0.3s ease-out',
                    style({ transform: 'scale(1)', opacity: 1 })),
          ],
        ),
      ],
    ),
  ],
})
export class PebViewerDeviceFrameComponent {
  @Input() type: PebScreen;

  PebScreen = PebScreen;
}
