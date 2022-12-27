import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { animationFrameScheduler, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, throttleTime } from 'rxjs/operators';

import { PebElementType } from '@pe/builder-core';
import { PebElementDef } from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebElementSelectionState } from '@pe/builder-state';

import { anchorRect, CursorType, PebAnchorType } from '../anchors';
import { PebControlColor, PebControlCommon } from '../controls';

import { PebRadiusAnchorsService } from './radius-anchors.service';


@Injectable()
export class PebRadiusService {

  @Select(PebEditorOptionsState.scale) scale$!: Observable<number>;
  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  controls$ = new Subject<PebControlCommon[]>();
  controlsData$: Observable<any> = combineLatest([
    this.controls$,
    this.scale$,
    this.selectedElements$.pipe(
      map(elements => elements.map(({ id }) => this.tree.find(id))),
      switchMap(elements => combineLatest(elements.map((el) => el.style$)).pipe(
        map((elements) => elements[0]?.overlay || elements[0]?.svgWrap),
        distinctUntilChanged((a, b) => a?.borderRadius === b?.borderRadius),
        map(() => elements),
      )),
    ),
  ]).pipe(
    throttleTime(0, animationFrameScheduler, { trailing: true }),
    map(([controls, scale, selectedElements]) => {

      const [controlElement] = controls;
      const [element] = selectedElements;
      const isShape = element && element.element.type === PebElementType.Shape && element.element.parent.type !== PebElementType.Grid;
      const isNotRound = element && !element.element.meta?.borderRadiusDisabled;

      if (!isShape || !isNotRound || !controlElement || selectedElements.length !== 1) { return null; }

      const { minX = 0, minY = 0 } = controlElement;

      const widthElement = +element.styles.width;
      const heightElement = +element.styles.height;
      const borderRadius = +element.styles.borderRadius || 0;

      const startPosition = minX;
      const stopPosition = minX + widthElement / 2;
      const maxRadius = Math.min(widthElement, heightElement) / 2;
      const distance = stopPosition - startPosition;
      const percent = (borderRadius / maxRadius) * 100;
      const shift = distance * (percent / 100);
      const currentPosition = startPosition + shift;
      const newX = currentPosition > stopPosition ? stopPosition : currentPosition;

      const anchor = {
        type: PebAnchorType.Radius,
        ...anchorRect(newX, minY, scale, 4),
        cursor: CursorType.ColResize,
      };

      this.radiusAnchorService.clear();
      this.radiusAnchorService.load([anchor]);

      const width = anchor.maxX - anchor.minX;
      const height = anchor.maxY - anchor.minY;

      return {
        width,
        height,
        x: anchor.minX + width / 2,
        y: anchor.minY + height / 2,
        color: PebControlColor.Debug,
      }

    }),
  );

  constructor(
    private readonly tree: PebRTree<PebAbstractElement>,
    private readonly radiusAnchorService: PebRadiusAnchorsService,
  ) {
  }

  renderRadius(items: PebControlCommon[]) {
    this.controls$.next(items);
  }

}

