import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { PebElementDef, PebElementType } from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebElementSelectionState } from '@pe/builder-state';

import { PebControlAnchorType } from './controls';
import { PebControlsService } from './controls.service';


@Component({
  selector: 'peb-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeControlsComponent {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.scale) scale$!: Observable<number>;

  @Input() width = 0;
  @Input() height = 0;
  @Input() ruler = 16;

  type = PebControlAnchorType;

  data$ = this.controlsService.controlsData$.pipe(
    /** Create clipping mask for grid controls */
    withLatestFrom(this.selectedElements$, this.scale$),
    map(([value, selected, scale]) => {
      const grids = value.controls.filter(ctrl => ctrl.anchorType === PebControlAnchorType.Grid);
      const masks = grids.map((grid) => {
        const ruler = this.ruler / scale;
        const search = this.tree.search({
          minX: grid.x - ruler,
          minY: grid.y - ruler,
          maxX: grid.x + grid.width + ruler,
          maxY: grid.y + grid.height + ruler,
        });

        const result = search.filter(elm =>
          ![PebElementType.Document, PebElementType.Section].includes(elm.element.type)
            && selected.some(e => e.id === elm.element.id)
        ).map((elm: any) => this.tree.toBBox(elm));

        let mask = `M ${grid.x - ruler - 1} ${grid.y - ruler - 1} H ${grid.x + grid.width + ruler + 1} V ${grid.y + grid.height + ruler + 1} H ${grid.x - ruler - 1} Z`;
        result.forEach((bbox) => {
          mask += ` M ${bbox.minX} ${bbox.minY} V ${bbox.maxY} H ${bbox.maxX} V ${bbox.minY} Z`;
        });

        return mask;
      });

      return { ...value, masks };
    }),
  );

  constructor(
    private readonly controlsService: PebControlsService,
    private readonly tree: PebRTree<PebAbstractElement>,
  ) {
  }
}

