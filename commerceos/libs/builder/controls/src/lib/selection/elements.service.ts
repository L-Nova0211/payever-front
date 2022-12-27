import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { animationFrameScheduler, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap, throttleTime, withLatestFrom } from 'rxjs/operators';
import { applyToPoint, scale, translate } from 'transformation-matrix';

import {
  PebAction,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  PebElementType,
  pebGenerateId,
  PebScreen,
  PebStylesheetEffect,
} from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';

import { PebEventType, PebPointerEventsService } from '../pointer';

import { isAnchor, PeAnchorType, PebAnchorType } from './anchors';
import { PebControlsService } from './controls.service';
import { PebGridService } from './grid.service';
import { getMinElementsDimensions, round, finalizeWithValue } from './helpers';
import { PebMoveService } from './move.service';
import { PebRadiusService } from './radius/radius.service';
import { PebResizeService } from './resize.service';
import { findTotalArea, PebSelectionBBox } from './selection';
import { PebSetSelectionBBoxAction } from './selection.actions';
import { PebSelectionService } from './selection.service';
import { PebSelectionBBoxState } from './selection.state';

@Injectable({ providedIn: 'any' })
export class PebElementsService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebSelectionBBoxState.boundingBox) selection$!: Observable<PebSelectionBBox>;

  mousedown$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mousedown && isAnchor(ev.target)),
  );

  mouseup$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mouseup),
  );

  mousemove$ = this.mousedown$.pipe(
    switchMap(mousedown => this.eventsService.events$.pipe(
      // filter(ev => false),
      takeUntil(this.moveService.move$),
      filter(ev => ev.type === PebEventType.mousemove),
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      withLatestFrom(this.selection$, this.selectedElements$, this.screen$),
      map(([event, selection, elements, screen])=> {
        //check if any children of elements are in selection then skip them for scale because when we scale
        //any element its children scale recursively
        const childrenIds = [];
        elements.forEach(elm => {
          elm.children.forEach(ch=> childrenIds.push(ch.id));
        });

        return {
          event,
          elements: elements.filter(elm=> !childrenIds.includes(elm.id)),
          screen,
          selection,
        }
      }),
      filter(() => {
        const target = mousedown.target as PeAnchorType;
        const anchorType = target.type;

        return anchorType !== PebAnchorType.Radius
      }),
      map(({ event, selection, elements, screen }) => {
        const target = mousedown.target as PeAnchorType;
        const anchorType = target.type;

        let resultStyles = new Map<PebAbstractElement, {
          left: number; top: number; width: number; height: number;
          gridTemplateRows?: Array<number>; gridTemplateColumns?: Array<number>
        }>();

        const { s, w, n, e } = this.resizeService.getResizeDirection(anchorType);

        /** Offset for Virtual cells of context grids */
        let offsetX = 0;
        let offsetY = 0;

        const eventX = event.x - offsetX;
        const eventY = event.y - offsetY;

        let deltaX = eventX - (e ? selection.right : w ? selection.left : eventX);
        let deltaY = eventY - (s ? selection.bottom : n ? selection.top : eventY);

        if (elements.length === 1 && elements[0].type === PebElementType.Grid &&
          [PebAnchorType.ColResize, PebAnchorType.RowResize].includes(anchorType)) {
          let grid = this.tree.find(elements[0].id);
          const { gridTemplateColumns, gridTemplateRows } = this.resizeService.resizeGridColumnsRows(
            elements[0].id, target.index, target.type, event);

          resultStyles.set(grid, {
            left: grid.styles.left,
            top: grid.styles.top,
            width: gridTemplateColumns.reduce((acc, c) => acc + c, 0),
            height: gridTemplateRows.reduce((acc, r) => acc + r, 0),
            gridTemplateColumns: gridTemplateColumns,
            gridTemplateRows: gridTemplateRows,
          });

        } else {
          // get scaled value for change size for x/y direction for all selected elements(when selected fiw) with
          const updatedDelta = this.resizeService.updatedScale(e, s, n, w, selection, deltaX, deltaY, screen, elements);

          const minDeltaY = deltaY > 0 ? Math.min(...updatedDelta.allDeltaY) : Math.max(...updatedDelta.allDeltaY);
          const minDeltaX = deltaX > 0 ? Math.min(...updatedDelta.allDeltaX) : Math.max(...updatedDelta.allDeltaX);

          deltaX = minDeltaX;
          deltaY = minDeltaY;

          let sx = 1;
          let sy = 1;
          const transformOriginX = e ? selection.left : selection.right;
          const transformOriginY = s ? selection.top : selection.bottom;

          if (s) {
            sy = (deltaY > 0 && eventY > selection.bottom || deltaY < 0) ? (selection.height + deltaY) / selection.height : 1;
          }

          if (w) {
            sx = (deltaX < 0 && eventX < selection.left || deltaX > 0) ? (selection.width - deltaX) / selection.width : 1;
          }

          if (n) {
            sy = (deltaY < 0 && eventY < selection.top || deltaY > 0) ? (selection.height - deltaY) / selection.height : 1;
          }

          if (e) {
            sx = (deltaX > 0 && eventX > selection.right || deltaX < 0) ? (selection.width + deltaX) / selection.width : 1;
          }

          const matrix1 = scale(sx, sy, transformOriginX, transformOriginY);


          elements.map(elm => {
            const element = this.tree.find(elm.id);

            if (element.element.type === PebElementType.Section) {
              resultStyles = new Map([...resultStyles, ...this.resizeElement(element, matrix1)]);
            } else {
              resultStyles = new Map([...resultStyles, ...this.resizeElementRecursive(element, matrix1)]);
            }
            if (element.element.type === PebElementType.Text) {
              if (e||w) {
                element.data.textAutosize = { ...element.data.textAutosize, width: false };
              }
              if (n||s) {
                element.data.textAutosize = { ...element.data.textAutosize, height: false };
              }
            }
            // find if any elements dimensions is less than allowed
            // if found, take smallest and take diff between styles and min as new delta,
            // create new matrix and recalculate styles
            const updated1 = [...resultStyles].reduce((acc, [elm, { left, top, width, height }]) => {
              let dim = getMinElementsDimensions(elm);
              const grids = element.children.filter(elm => elm.element.type == PebElementType.Grid);

              if (grids.length > 0) {
                dim = { width: dim.width < 10 ? 10 : dim.width, height: dim.height < 10 ? dim.height : 10 }; // it shouldnt be hardcode,
              }

              if (width < dim.width) {
                acc.sx = Math.max(acc.sx ?? dim.width / elm.styles.width, dim.width / elm.styles.width);
              }

              if (height < dim.height) {
                acc.sy = Math.max(acc.sy ?? dim.height / elm.styles.height, dim.height / elm.styles.height);
              }

              return acc;
            }, {} as { sx: number; sy: number; });

            if (updated1?.sx || updated1?.sy) {
              const matrix3 = scale(updated1?.sx ?? sx, updated1?.sy ?? sy, transformOriginX, transformOriginY);
              if (element.element.type === PebElementType.Section) {
                resultStyles = new Map([...resultStyles, ...this.resizeElement(element, matrix3)]);
              } else {
                resultStyles = new Map([...resultStyles, ...this.resizeElementRecursive(element, matrix3)]);
              }
            }

          })
        }
        resultStyles.forEach((value, elm) => {
          elm.styles = { ...elm.styles, ...value };
          elm.element = {
            ...elm.element,
            data: { ...elm.data },
          };
          this.tree.insert(elm);
        });

        const controls = this.controlsService.createDefaultControlsSet(mousedown, elements.map(elm => this.tree.find(elm.id)));
        this.controlsService.renderControls(controls);
        this.radiusService.renderRadius(controls);

        return { anchorType, elements, screen };
      }),
      tap(({ elements }) => {
        const bbox = findTotalArea(elements.map(elm => this.tree.toBBox(this.tree.find(elm.id))));
        this.store.dispatch(new PebSetSelectionBBoxAction({
          left: bbox.minX,
          top: bbox.minY,
          right: bbox.maxX,
          bottom: bbox.maxY,
        }));
      }),
      map(({ elements, screen }) => {
        const elementsWithTheirChildren: PebAbstractElement[] = [];

        elements.map((elm) => this.tree.find(elm.id)).forEach(elm => {
          elementsWithTheirChildren.push(elm, ...elm.children);
        });

        return {
          elements: elementsWithTheirChildren,
          screen,
        }
      }),
      finalizeWithValue(({ elements, screen }) => {
        const page = this.editorStore.page;
        const effects: PebEffect[] = [];
        elements.forEach(element => {
          const { top, left, width, height, gridTemplateColumns, gridTemplateRows } = element.styles;

          if (element.element.type === PebElementType.Grid ){
            effects.push({
              type: PebStylesheetEffect.Update,
              target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
              payload: { [element.element.id]: {
                top: top,
                left: left,
                width: width,
                height: height,
                gridTemplateColumns: gridTemplateColumns,
                gridTemplateRows: gridTemplateRows,
              } },
            });
          } else {
            effects.push({
              type: PebStylesheetEffect.Update,
              target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
              payload: { [element.element.id]: { top, left, width, height } },
            });
          }
        });

        const action: PebAction = {
          effects,
          id: pebGenerateId('action'),
          targetPageId: this.editorStore.page.id,
          affectedPageIds: [this.editorStore.page.id],
          createdAt: new Date(),
        };

        this.editorStore.commitAction(action);
      }),
      takeUntil(this.mouseup$),
    )),
  );


  resizeElmRecursive(element: PebAbstractElement, matrix, styles, deltaLeft = 0, deltaTop = 0) {

  }

  resizeElm(element: PebAbstractElement, matrix, styles = new Map(), deltaLeft = 0, deltaTop = 0) {

  }

  resizeElement(element: PebAbstractElement, matrix, translateChildren = true) {
    let styles = new Map<PebAbstractElement, { left: number; top: number; width: number; height: number;
      gridTemplateRows?: Array<number>; gridTemplateColumns?: Array<number> }>();
    const { minX, minY, maxX, maxY } = this.tree.toBBox(element);
    const [x1, y1] = applyToPoint(matrix, [minX, minY]);
    const [x2, y2] = applyToPoint(matrix, [maxX, maxY]);

    // skip for sections
    // if (translateChildren && element.element.type !== PebElementType.Section) {
    if (translateChildren) {
      const tx = minX - x1;
      const ty = minY - y1;

      const tm = translate(tx, ty);
      for (const elm of element.children) {
        const res = this.resizeElement(elm, tm, false);
        styles = new Map([...styles, ...res]);
      }
    }

    const { left, top } = element.styles;

    styles.set(element, {
      left: round(left + (x1 - minX)),
      top: round(top + (y1 - minY)),
      width: round(x2 - x1),
      height: round(y2 - y1),
    });

    return styles;
  }

  resizeElementRecursive(element: PebAbstractElement, matrix, deltaLeft = 0, deltaTop = 0) {
    let styles = new Map<PebAbstractElement, { left: number; top: number; width: number; height: number;
      gridTemplateRows?: Array<number>; gridTemplateColumns?: Array<number> }>();

    const { minX, minY, maxX, maxY } = this.tree.toBBox(element);

    const [x1, y1] = applyToPoint(matrix, [minX, minY]);
    const [x2, y2] = applyToPoint(matrix, [maxX, maxY]);

    if (element.element.type !== PebElementType.Section){
      for (const elm of element.children) {

        const res = this.resizeElementRecursive(elm, matrix, x1 - minX, y1 - minY);
        styles = new Map([...styles, ...res]);
      }
    }

    const { left, top } = element.styles;
    const isGrid = element.element.type == PebElementType.Grid;

    if (isGrid) {
      const columns = [...element.styles.gridTemplateColumns];
      const w = round(x2 - x1);
      const ratioW = element.styles.width / w;
      const rows = [...element.styles.gridTemplateRows];
      const h = round(y2 - y1);
      const ratioH = element.styles.height / h;
      const min = getMinElementsDimensions(element);

      const gridTemplateColumns = columns.map(c => c / ratioW).map(el => el > min.width ? el : min.width);
      const gridTemplateRows = rows.map(c => c / ratioH).map(el => el > min.height ? el : min.height);

      styles.set(element, {
        left: round(left + (x1 - deltaLeft - minX)),
        top: round(top + (y1 - deltaTop - minY)),
        width: gridTemplateColumns.reduce((acc, c) => acc + c, 0),
        height: gridTemplateRows.reduce((acc, r) => acc + r, 0),
        gridTemplateColumns: gridTemplateColumns,
        gridTemplateRows: gridTemplateRows,
      });

    } else {
      styles.set(element, {
        left: round(left + (x1 - deltaLeft - minX)),
        top: round(top + (y1 - deltaTop - minY)),
        width: round(x2 - x1),
        height: round(y2 - y1),
      });
   }

    return styles;
  }

  constructor(
    private readonly tree: PebRTree<PebAbstractElement>,
    private readonly store: Store,
    private readonly eventsService: PebPointerEventsService,
    private readonly controlsService: PebControlsService,
    private readonly resizeService: PebResizeService,
    private readonly selectionService: PebSelectionService,
    private readonly moveService: PebMoveService,
    private readonly gridService: PebGridService,
    private readonly editorStore: PebEditorStore,
    private readonly radiusService: PebRadiusService,

  ) {
    this.mousemove$.subscribe();
    this.moveService.move$.subscribe();
  }

  resize({ width, height }): boolean {
    // this.setSelection$.next({ width, height });

    return true;
  }

  move({ x, y }): boolean {
    // this.setSelection$.next({ left: x, top: y });

    return true;
  }
}

