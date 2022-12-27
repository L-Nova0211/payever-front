import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { animationFrameScheduler, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  startWith,
  throttleTime,
  withLatestFrom
} from 'rxjs/operators';

import { PebElementDef, PebElementType } from '@pe/builder-core';
import { PebAbstractElement, PebRTree } from '@pe/builder-renderer';
import { PebElementSelectionState } from '@pe/builder-state';

import { PebEventType, PebPointerEventsService } from '../pointer';

import { isAnchor } from './anchors';


@Component({
  selector: 'peb-control-hover',
  template: `
    <svg
      class="container"
      overflow="visible"
      [attr.viewBox]="'0 0 ' + this.width + ' ' + this.height"
      xmlns:svg="http://www.w3.org/2000/svg"
    >
      <svg:rect
        vector-effect="non-scaling-stroke"
        fill="none"
        stroke="#0371e2"
        *ngIf="hovered$ | async as elm"
        [attr.x]="elm.minX"
        [attr.y]="elm.minY"
        [attr.width]="elm.maxX - elm.minX"
        [attr.height]="elm.maxY - elm.minY"
        [attr.stroke-width]="elm.strokeWidth"
      />
    </svg>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
    }

    .container {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebHoverComponent {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  @Input() width = 0;
  @Input() height = 0;

  private readonly enabled$ = this.eventsService.events$.pipe(
    filter(ev => [PebEventType.mousedown, PebEventType.mouseup].includes(ev.type)),
    map(({ type }) => type !== PebEventType.mousedown),
    startWith(true),
  );

  hovered$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mousemove && !isAnchor(ev.target)),
    throttleTime(0, animationFrameScheduler, { trailing: true }),
    withLatestFrom(this.selectedElements$, this.enabled$),
    map(([ev, selected, enabled]) => {
      if (!enabled) {
        return null;
      }

      const target = ev.target as PebAbstractElement;

      if (target.parent?.element.type === PebElementType.Grid) {
        const isGridSelected = selected.some(elm => target.parent.element.id === elm.id);

        if (isGridSelected) {
          return { ...this.tree.toBBox(target), strokeWidth: 1 };
        }

        return { ...this.tree.toBBox(target.parent), strokeWidth: 1 };
      }

      if (target.parent?.parent?.element.type === PebElementType.Grid) {
        const isGridSelected = selected.some(elm => target.parent.parent.element.id === elm.id);
        const isCellSelected = selected.some(elm => target.parent.element.id === elm.id);

        if (isGridSelected && isCellSelected) {
          return { ...this.tree.toBBox(target), strokeWidth: 1 };
        }

        if (isGridSelected) {
          return { ...this.tree.toBBox(target.parent), strokeWidth: 1 };
        }

        return { ...this.tree.toBBox(target.parent.parent), strokeWidth: 1 };
      }

      return target.element.type === PebElementType.Document
        ? null
        : { ...this.tree.toBBox(target), strokeWidth: target.element.type === PebElementType.Section ? 2 : 1 };
    }),
    distinctUntilChanged(),
  );

  constructor(
    private readonly tree: PebRTree<PebAbstractElement>,
    private readonly eventsService: PebPointerEventsService,
  ) {
  }
}
