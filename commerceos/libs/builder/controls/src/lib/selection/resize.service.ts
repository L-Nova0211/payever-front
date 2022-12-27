import { Injectable } from '@angular/core';

import {
  PebElementDef,
  PebElementId,
  PebElementType,
  PebScreen,
  pebScreenContentWidthList,
  pebScreenDocumentWidthList,
} from '@pe/builder-core';
import { PebAbstractElement, PebRTree } from '@pe/builder-renderer';

import { PebEvent } from '../pointer';

import { PebAnchorType } from './anchors';
import { getMinElementsDimensions, round } from './helpers';
import { PebSelectionBBox } from './selection';

@Injectable()
export class PebResizeService {
  constructor(
    private readonly tree: PebRTree<PebAbstractElement>,
  ) {}

  getResizeDirection(anchorType: PebAnchorType) {

    const s = [PebAnchorType.SW, PebAnchorType.S, PebAnchorType.SE, PebAnchorType.NS].includes(anchorType);
    const w = [PebAnchorType.NW, PebAnchorType.W, PebAnchorType.SW ].includes(anchorType);
    const n = [PebAnchorType.NW, PebAnchorType.N, PebAnchorType.NE ].includes(anchorType);
    const e = [PebAnchorType.NE, PebAnchorType.E, PebAnchorType.SE, PebAnchorType.EW].includes(anchorType);

    return { s, w, n, e };
  }

   getLimitsIntersectionWithChildren(deltaX: number, deltaY: number, elements: PebAbstractElement[]) {
    // todo: just stub right now

    return { deltaX: Math.min(deltaX), deltaY:Math.min(deltaY) };

  }


  resizeGridColumnsRows(gridId: PebElementId, index: number, type:PebAnchorType, event : PebEvent ):
    {gridTemplateRows?: Array<number>; gridTemplateColumns?: Array<number>} {

    let grid = this.tree.find(gridId);
    const gridBbox = this.tree.toBBox(grid);

    const gridTemplateRows = [...grid.styles.gridTemplateRows];
    const gridTemplateColumns = [...grid.styles.gridTemplateColumns];

    const boundaryColumn = gridTemplateColumns.slice(0, index + 1).reduce((acc, col) => acc + col, gridBbox.minX);
    const boundaryRow = gridTemplateRows.slice(0, index + 1).reduce((acc, col) => acc + col, gridBbox.minY);

    let dX = event.x - boundaryColumn;
    let dY = event.y - boundaryRow;

    // todo: need get cell for current column/row use index
    const { deltaX, deltaY } = this.getLimitsIntersectionWithChildren(dX, dY, grid.children);
    dX = deltaX;
    dY = deltaY;

    let { width: minWidth, height: minHeight } = getMinElementsDimensions(grid);

    if (type === PebAnchorType.ColResize) {
      const sum = gridTemplateColumns[index] + gridTemplateColumns[index + 1];
      if (dX < 0 && gridTemplateColumns[index] + dX < minWidth){
        // if we resize to left and cell less than minWidth
        dX = 0;
        gridTemplateColumns[index] = minWidth;
        gridTemplateColumns[index + 1] = sum - minWidth;
      }
      if (dX > 0 && gridTemplateColumns[index + 1] - dX < minWidth) {
        // if we resize to right and cell less than minWidth
        dX = 0;
        gridTemplateColumns[index + 1]  = minWidth;
        gridTemplateColumns[index] = sum - minWidth;
      }

      gridTemplateColumns[index] = gridTemplateColumns[index] + dX;
      gridTemplateColumns[index + 1] = gridTemplateColumns[index + 1] - dX;
    }

    if (type === PebAnchorType.RowResize) {
      const sum = gridTemplateRows[index] + gridTemplateRows[index + 1];
      if (dY < 0 && gridTemplateRows[index] + dY < minHeight){
        // if we resize to left and cell less than minWidth
        dY = 0;
        gridTemplateRows[index] = minHeight;
        gridTemplateRows[index + 1] = sum - minHeight;
      }
      if (dY > 0 && gridTemplateRows[index + 1] - dY < minHeight) {
        // if we resize to right and cell less than minWidth
        dY = 0;
        gridTemplateRows[index + 1]  = minHeight;
        gridTemplateRows[index] = sum - minHeight;
      }
      gridTemplateRows[index] = gridTemplateRows[index] + dY;
      gridTemplateRows[index + 1] = gridTemplateRows[index + 1] - dY;
    }

    return { gridTemplateRows, gridTemplateColumns }
  }

  isSectionIntersectedWithChildren( dy: number , sectionId: PebElementId) {
    const children = [];
    const sectionBBox = this.tree.toBBox(this.tree.find(sectionId));

    this.tree.elements.forEach((abstractElement) => {
      if (sectionId !== abstractElement.element.id
        && abstractElement.parent?.element.id === sectionId) {
        children.push(abstractElement);
      }
    });

    return children.some((editorElement) => {
      const child = this.tree.toBBox(this.tree.find(editorElement.element.id));

      return child.maxY > sectionBBox.maxY + dy;
    });
  }

  intersected(dx: number, dy: number,  elementDefs, screen) {
    let beyond = false;
    let intersect = false;

    elementDefs.forEach((elementDef) => {
      const elem = this.tree.find(elementDef.id);
      const element = this.tree.toBBox(this.tree.find(elem.element.id));
      const parent = this.tree.toBBox(elem.parent);

      if (elem.parent.element.type === PebElementType.Section && screen === PebScreen.Desktop) {
        const padding = (pebScreenDocumentWidthList[screen] - pebScreenContentWidthList[screen]) / 2;

        parent.minX = parent.minX + padding;
        parent.maxX = parent.maxX - padding;
      }

      const beyonded = element.minX < parent.minX
        || element.maxX + dx > parent.maxX
        || element.minY < parent.minY
        || element.maxY + dy > parent.maxY;

      const siblings = elem.parent.children.filter((el) => el.element.id !== elementDef.id);

      const intersected = siblings.some((editorElement) => {
        const sibling = this.tree.toBBox(this.tree.find(editorElement.element.id));

        return sibling.maxY > element.minY
          && sibling.maxX > element.minX
          && sibling.minY < element.maxY + dy
          && sibling.minX < element.maxX + dx;
      });

      beyond = !beyond && beyonded ? beyonded : beyond;
      intersect = !intersect && intersected ? intersected : intersect;
    });

    return beyond || intersect;
  }


  updatedScale(e: boolean, s: boolean, n: boolean, w: boolean, selection: PebSelectionBBox,
               selectionDeltaX: number, selectionDeltaY: number, screen: PebScreen, elements: PebElementDef[]) {
    const updatedDelta = elements.map(elm => {

      const element = this.tree.find(elm.id);
      const elmentBbox = this.tree.toBBox(element);

      let scaleX = 1;
      let scaleY = 1;
      let deltaX = selectionDeltaX;
      let deltaY = selectionDeltaY;

      let searchX1 = {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
      };

      let searchY1 = {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
      };


      if (deltaX > 0) {
        if ((selection.right - elmentBbox.maxX) > 0) {
          scaleX = e ? ((elmentBbox.maxX - selection.left) / (selection.width)) : ((selection.right - elmentBbox.maxX) / (selection.width));
        }

        deltaX = deltaX * scaleX ;
        searchX1 = {
          minX: elmentBbox.maxX,
          minY: elmentBbox.minY,
          maxX: elmentBbox.maxX + deltaX,
          maxY: elmentBbox.maxY,
        };

      } else {
        if ((elmentBbox.minX - selection.left) > 0) {
          scaleX = e ? ((elmentBbox.minX - selection.left) / (selection.width)) : ((selection.right - elmentBbox.minX) / (selection.width));
        }
        deltaX = deltaX * scaleX;

        searchX1 = {
          minX: elmentBbox.minX + deltaX,
          minY: elmentBbox.minY,
          maxX: elmentBbox.minX,
          maxY: elmentBbox.maxY,
        };
      }

      if (deltaY > 0) {
        // let scaledDeltaY = (elmentBbox.minY / (selection.width)) * deltaX;
        if ((selection.bottom - elmentBbox.maxY) > 0) {
          scaleY = s ? ((elmentBbox.maxY - selection.top) /
            (selection.height)) : ((selection.bottom - elmentBbox.maxY) /
            (selection.height));
        }
        deltaY = deltaY * scaleY;
        searchY1 = {
          minX: elmentBbox.minX,
          minY: elmentBbox.maxY,
          maxX: elmentBbox.maxX,
          maxY: elmentBbox.maxY + deltaY,
        };
      } else {
        if ((elmentBbox.minY - selection.top) > 0) {
          scaleY = s ? ((elmentBbox.minY - selection.top) /
            (selection.height)) : ((selection.bottom - elmentBbox.minY) /
            (selection.height));
        }
        deltaY = deltaY * scaleY;
        searchY1 = {
          minX: elmentBbox.minX,
          minY: elmentBbox.minY + deltaY,
          maxX: elmentBbox.maxX,
          maxY: elmentBbox.minY,
        };
      }

      if (element.element.type === PebElementType.Section) {
        let deltaX = selectionDeltaX;
        let deltaY = selectionDeltaY;
        const minX1 = (e ? selection.right : selection.left) + (deltaX > 0 ? 0 : deltaX);
        const minY1 = (s ? selection.bottom : selection.top) + (deltaY > 0 ? 0 : deltaY);
        const maxX1 = (w ? selection.left : selection.right) + (deltaX > 0 ? deltaX : 0);
        const maxY1 = (n ? selection.top : selection.bottom) + (deltaY > 0 ? deltaY : 0);

        searchX1 = {
          minX: minX1,
          minY: Math.min(minY1, selection.top),
          maxX: maxX1,
          maxY: Math.max(minY1, selection.bottom),
        };

        searchY1 = {
          minX: Math.min(minX1, selection.left),
          minY: minY1,
          maxX: Math.max(maxX1, selection.right),
          maxY: maxY1,
        };
      }

      const intersectsX = this.tree.search(searchX1);
      const intersectsY = this.tree.search(searchY1);

      const scaleAll = elements.length > 1 || elements[0].data?.meta?.scalable; // grid, group

      // if scaled outward, need to find limits for both cases, single element and multiply, except for sections
      if (element.element.type !== PebElementType.Section) {
        const pointsY = intersectsY.reduce((acc, elm) => {
          // intersection is children or parent of testing element
          if (elm !== element && (elm === element.parent || element.parent === elm.parent)) {
            const bb = this.tree.toBBox(elm);
            // --!!!! why X ?
            if (Math.abs(bb.minX - elmentBbox.maxX) > 0 && Math.abs(bb.maxX - elmentBbox.minX) > 0) {
              acc.push(bb.minY, bb.maxY);
            }
          }

          return acc;
        }, []);

        let emargin = 0.1; // Number.EPSILON;
        if (deltaY > 0 && !(n && ((selection.bottom - elmentBbox.maxY) < emargin))) {
          const limit = Math.min(...pointsY.filter(p => p >= (elmentBbox.maxY - emargin)));
          if (isFinite(limit)) {
            deltaY = Math.min(deltaY, limit - elmentBbox.maxY);
          }
        }

        if (deltaY < 0 && !(s && ((elmentBbox.minY - selection.top) < emargin))) {
          const limit = Math.max(...pointsY.filter(p => p <= (elmentBbox.minY + emargin)));
          if (isFinite(limit)) {
            deltaY = Math.max(deltaY, limit - elmentBbox.minY);
          }
        }

        const pointsX = intersectsX.reduce((acc, elm, i) => {
          if (elm !== element && (elm === element.parent || element.parent === elm.parent)) { //
            const bb = this.tree.toBBox(elm);
            let minX = bb.minX;
            let maxX = bb.maxX;
            // sections width does not fill whole document width, instead limited by content width for current screen
            if (elm.element.type === PebElementType.Section) {
              minX = (pebScreenDocumentWidthList[screen] - pebScreenContentWidthList[screen]) / 2;
              maxX = pebScreenDocumentWidthList[screen] - minX;
            }
            acc.push(minX, maxX);
          }

          return acc;
        }, []);

        if (deltaX > 0 && !(w && ((selection.right - elmentBbox.maxX) < emargin))) {
          const limit = Math.min(...pointsX.filter(p => p >= (elmentBbox.maxX - emargin)));
          if (isFinite(limit)) {
            deltaX = Math.min(deltaX, limit - elmentBbox.maxX);
          }
        }

        if (deltaX < 0 && !(e && ((elmentBbox.minX - selection.left) < emargin))) {
          const limit = Math.max(...pointsX.filter(p => p <= (elmentBbox.minX + emargin)));
          if (isFinite(limit)) {
            deltaX = Math.max(deltaX, limit - elmentBbox.minX);
          }
        }
      }


      if (scaleAll) {

      } else {

        let emargin = 0.1; //Number.EPSILON;
        const innerPointsX = intersectsX.reduce((acc, elm) => {
          if (element === elm.parent) {
            const bb = this.tree.toBBox(elm);
            acc.push(bb.minX, bb.maxX);
          }

          return acc;
        }, []);

        if (e && deltaX < 0) {
          let limit = Math.max(...innerPointsX.filter(p => p <= (elmentBbox.maxX + emargin)));
          if (isFinite(limit)) {
            deltaX = Math.max(deltaX, limit - elmentBbox.maxX);
          }
        }

        if (w && deltaX > 0) {
          const limit = Math.min(...innerPointsX.filter(p => p >= (elmentBbox.minX - emargin)));
          if (isFinite(limit)) {
            deltaX = Math.min(deltaX, limit - elmentBbox.minX);
          }
        }

        const innerPointsY = intersectsY.reduce((acc, elm) => {
          if (element === elm.parent) {
            const bb = this.tree.toBBox(elm);
            acc.push(bb.minY, bb.maxY);
          }

          return acc;
        }, []);

        if (s && deltaY < 0) {
          const limit = Math.max(...innerPointsY.filter(p => p <= (elmentBbox.maxY + emargin)));
          if (isFinite(limit)) {
            deltaY = Math.max(deltaY, limit - elmentBbox.maxY);

          }
        }

        if (n && deltaY > 0) {
          const limit = Math.min(...innerPointsY.filter(p => p >= (elmentBbox.minY - emargin)));
          if (isFinite(limit)) {
            deltaY = Math.min(deltaY, limit - elmentBbox.minY);
          }
        }
      }

      return { deltaX: round(deltaX / scaleX), deltaY: round(deltaY / scaleY) };
    });
    const allDeltaY = updatedDelta.map(d => d.deltaY);
    const allDeltaX = updatedDelta.map(d => d.deltaX);

    return { allDeltaX, allDeltaY };
  }
}
