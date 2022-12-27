import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { merge } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';

import { PebSelectionService } from './selection.service';


@Component({
  selector: 'peb-selection',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      style="overflow: visible"
      [attr.viewBox]="'0 0 ' + this.width + ' ' + this.height"
    >
      <ng-container *ngIf="rect$ | async as rect">
        <path class="selection" [attr.d]="rect"/>
        <path class="selection__outline" [attr.d]="rect"/>
      </ng-container>
    </svg>
  `,
  styles: [
    `
      :host {
        position: absolute;
        pointer-events: none;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        overflow: visible;
      }

      .selection {
        fill: black;
        opacity: 0.1;
      }

      .selection__outline {
        fill: none;
        stroke: white;
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebSelectionComponent {

  @Input() width = 0;
  @Input() height = 0;

  constructor(
    private readonly selectionService: PebSelectionService,
  ) {
  }

  rect$ = merge(
    this.selectionService.mousemove$.pipe(
      map((value) => {
        if (value) {
          const { x1, y1, x2, y2 } = value;

          return `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`;
        }

        return null;
      }),
    ),
    this.selectionService.mouseup$.pipe(mapTo(null)),
  );
}
