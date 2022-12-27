import { Component, ChangeDetectionStrategy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PebShapeOpacityService } from './shape-opacity-form.service';

@Component({
  selector: 'peb-shape-opacity',
  templateUrl: './shape-opacity-form.component.html',
  styleUrls: [
    './shape-opacity-form.component.scss',
    '../../../../../styles/src/lib/styles/_sidebars.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebShapeOpacityForm {

  constructor(
    public shapeOpacityService: PebShapeOpacityService,
    private destroyed$: PeDestroyService,
  ) {
    this.shapeOpacityService.initService$.pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
   }

}
