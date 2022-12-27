import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { BBox } from 'rbush';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { PebScreen, pebScreenContentWidthList, pebScreenDocumentWidthList } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';


@Component({
  selector: 'peb-section-borders',
  template: `
    <svg class='container' [attr.viewBox]="'0 0 ' + this.width + ' ' + this.height" xmlns='http://www.w3.org/2000/svg'>
      <line
        class='line'
        *ngFor='let line of lines$ | async'
        [attr.x1]='line.x1'
        [attr.y1]='line.y1'
        [attr.x2]='line.x2'
        [attr.y2]='line.y2'
        stroke='#666666'
      />
    </svg>
  `,
  styles: [
    `:host {
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

    .line {
      vector-effect: non-scaling-stroke;
      stroke-width: 1px;
      stroke-dasharray: 3 3;
    }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebSectionComponent {

  @Select(PebEditorOptionsState.screen) private screen$!: Observable<PebScreen>;

  @Input() set sections(value: BBox[]) {
    this.sections$.next(value);
  }

  @Input() set height(value: number) {
    if (value !== this._height) {
      this._height = value;
    }
  }

  get height(): number {
    return this._height;
  }

  @Input()  set width(value: number) {
    if (value !== this._width) {
      this._width = value;
    }
  }

  get width(): number {
    return this._width;
  }

  private _width = 0;
  private _height = 0;

  sections$ = new ReplaySubject<BBox[]>(1);

  lines$ = combineLatest([this.sections$, this.screen$]).pipe(
    map(([value, screen]) => {
      const lines = value.reduce((acc, y, i) => {
        if (i > 0) {
          acc.push({ x1: 0, y1: y.minY, x2: y.maxX, y2: y.minY });
        }

        return acc;
      }, []);

      if (value.length && screen === PebScreen.Desktop) {
        const left = (pebScreenDocumentWidthList[screen] - pebScreenContentWidthList[screen]) / 2;
        const right = pebScreenDocumentWidthList[screen] - left;
        const height = value[value.length - 1].maxY;
        lines.push(
          { x1: left, y1: 0, x2: left, y2: height },
          { x1: right, y1: 0, x2: right, y2: height },
        );
      }

      return lines;
    }),
  )
}
