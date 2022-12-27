import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { PebElementDef } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { PebElementSelectionState } from '@pe/builder-state';

import { PebControlAnchorType } from '../controls';

import { PebRadiusMoveService } from './radius-move.service';
import { PebRadiusService } from './radius.service';


@Component({
  selector: 'peb-radius',
  templateUrl: './radius.component.html',
  styleUrls: ['./radius.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeRadiusComponent {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.scale) scale$!: Observable<number>;

  @Input() width = 0;
  @Input() height = 0;

  type = PebControlAnchorType;
  data$ = this.radiusService.controlsData$;

  constructor(
    private readonly radiusService: PebRadiusService,
    private readonly radiusMove: PebRadiusMoveService,
  ) {
  }
}

