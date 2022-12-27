import { Injectable } from '@angular/core';

import { PebEvent } from '@pe/builder-controls';
import { PebElementType } from '@pe/builder-core';
import { PebGridMakerElement } from '@pe/builder-elements';
import { PebAbstractElement, PebRTree } from '@pe/builder-renderer';

import { PebControlAnchorType, PebControlColor, PebControlCommon } from './controls';
import { findTotalArea } from './selection';

@Injectable({ providedIn: 'any' })
export class PebContextGridService {
  constructor(
    private readonly tree: PebRTree<PebAbstractElement>,
  ) {
  }

  getContextGridEventTarget(ev: PebEvent, elm: PebGridMakerElement): PebAbstractElement {
    const { x, y } = this.getContextGridPointerEvent(ev, elm);
    const bbox = { minX: x, minY: y, maxX: x, maxY: y };

    const smallest = (bbox) => {
      const boundaries = this.tree.search(bbox).map((elm) => {
        const { minX, minY, maxX, maxY } = this.tree.toBBox(elm);

        return { elm, width: maxX - minX, height: maxY - minY };
      });

      return boundaries.sort((a, b) => a.width - b.width || a.height - b.height).shift().elm;
    }

    return smallest(bbox);
  }

  private getContextGridPointerEvent(ev: PebEvent, elm: PebGridMakerElement): PebEvent {
    const bbox = this.tree.toBBox(elm);

    const x = elm.styles.gridTemplateColumns.reduce((acc, value) => {
      const shifted = acc - value;

      return shifted > bbox.minX ? shifted : acc;
    }, ev.x);

    const y = elm.styles.gridTemplateRows.reduce((acc, value) => {
      const shifted = acc - value;

      return shifted > bbox.minY ? shifted : acc;
    }, ev.y);

    return { ...ev, x, y };
  }

  createContextGridControls(ev: PebEvent, grid: PebGridMakerElement, elements: PebAbstractElement[]) {
    const origin = this.tree.toBBox(grid);

    const boundings = elements.filter(elm =>
      [PebElementType.Shape, PebElementType.Text].includes(elm.element.type)
    ).map(elm => {
      return {
        ...this.tree.toBBox(elm),
        cell: elm.parent.element.type === PebElementType.Grid,
      }
    });

    if (!boundings.length) {
      return [];
    }

    const bbox = findTotalArea(boundings);

    const columns = grid.styles.gridTemplateColumns.reduce((acc, col) => {
      const [last] = acc.slice(-1);
      acc.push(last + col);

      return acc;
    }, [0]);

    const rows = grid.styles.gridTemplateRows.reduce((acc, row) => {
      const [last] = acc.slice(-1);
      acc.push(last + row);

      return acc;
    }, [0]);

    columns.splice(-1, 1);
    rows.splice(-1, 1);

    const controls: PebControlCommon[] = [];

    columns.forEach((col, i, colArr) => {
      rows.forEach((row, j, rowArr) => {
        /** Render controls for nested selected elements */
        if (boundings.length > 1) {
          boundings.forEach((bb) => {
            controls.push({
              anchorType: PebControlAnchorType.None,
              color: PebControlColor.Default,
              minX: bb.minX + col,
              minY: bb.minY + row,
              maxX: bb.maxX + col,
              maxY: bb.maxY + row,
            });
          });
        }

        let anchorType = PebControlAnchorType.None;
        const dx = ev.x - origin.minX;
        const dy = ev.y - origin.minY;
        const maxX = colArr[i + 1] ?? grid.styles.width;
        const maxY = rowArr[j + 1] ?? grid.styles.height;
        if (col < dx && dx < maxX && row < dy && dy < maxY) {
          anchorType = PebControlAnchorType.Default;
        }

        controls.push({
          anchorType,
          color: PebControlColor.Default,
          minX: bbox.minX + col,
          minY: bbox.minY + row,
          maxX: bbox.maxX + col,
          maxY: bbox.maxY + row,
        });
      });
    });

    return controls;
  }
}
