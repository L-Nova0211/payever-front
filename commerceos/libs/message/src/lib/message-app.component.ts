import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'pe-message-app',
  templateUrl: './message-app.component.html',
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageAppComponent {}
