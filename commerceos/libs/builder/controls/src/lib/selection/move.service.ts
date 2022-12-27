import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { BBox } from 'rbush';
import { animationFrameScheduler, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap, throttleTime, withLatestFrom } from 'rxjs/operators';
import { applyToPoint, translate } from 'transformation-matrix';

import { PebAbstractTextElement } from '@pe/builder-abstract';
import {
  PebAction,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  PebElementType,
  pebGenerateId,
  PebScreen,
  pebScreenContentWidthList,
  pebScreenDocumentWidthList,
  PebStylesheetEffect,
  PebTemplateEffect,
} from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState, PebSelectAction } from '@pe/builder-state';

import { PebEvent, PebEventType, PebPointerEventsService } from '../pointer';

import { isAnchor, PebAnchorType } from './anchors';
import { PebControlAnchorType, PebControlColor, PebControlCommon } from './controls';
import { PebControlsService } from './controls.service';
import { PebGridService } from './grid.service';
import { finalizeWithValue, round } from './helpers';
import { PebRadiusService } from './radius/radius.service';
import { findTotalArea, isContextGrid, isGridElement, PebSelectionBBox } from './selection';
import { PebSetSelectionBBoxAction } from './selection.actions';
import { PebSelectionBBoxState } from './selection.state';

@Injectable()
export class PebMoveService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebSelectionBBoxState.boundingBox) selection$!: Observable<PebSelectionBBox>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  constructor(
    private readonly eventsService: PebPointerEventsService,
    private readonly controlsService: PebControlsService,
    private readonly tree: PebRTree<PebAbstractElement>,
    private readonly gridService: PebGridService,
    private readonly store: Store,
    private readonly editorStore: PebEditorStore,
    private readonly radiusService: PebRadiusService,
  ) {
  }

  mouseup$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mouseup),
  );

  move$ = this.selectedElements$.pipe(
    switchMap(selected => this.eventsService.events$.pipe(
      filter(ev => ev.type === PebEventType.mousedown),
      filter((ev) => {
        const target = ev.target;

        return !isAnchor(target)
          && !ev.metaKey
          && !ev.shiftKey
          && ![PebElementType.Document, PebElementType.Section].includes(target.element.type)
          && selected.some(elm => elm.id === target.element.id)
          && !isGridElement(target.parent)
          && !(target as PebAbstractTextElement)?.editorEnabled
          || isAnchor(target) && target.type === PebAnchorType.Move;
      }),
      map((ev) => {
        const elements = new Map<string, PebAbstractElement>();
        const styles = new Map<string, { left: number; top: number; }>();
        if (isAnchor(ev.target)) {
          const grid = this.gridService.getGridByAnchor(ev.target);
          elements.set(grid.element.id, grid);
          styles.set(grid.element.id, { left: grid.styles.left, top: grid.styles.top });
          this.store.dispatch(new PebSelectAction(grid.element.id));
        } else {
          selected.forEach((elm) => {
            const element = this.tree.find(elm.id);
            elements.set(elm.id, element);
            /** Skip grid cells */
            if (!isGridElement(element.parent)) {
              const { left, top } = element.styles;
              styles.set(elm.id, { left, top });
            }
          });
        }

        const selection = findTotalArea(Array.from(elements, ([, elm]) => this.tree.toBBox(elm)));
        const offset = {
          x: ev.x - selection.minX,
          y: ev.y - selection.minY,
        };

        return { ev, offset, elements, styles };
      }),
      switchMap(({ ev, offset, elements, styles }) => this.eventsService.events$.pipe(
        filter(ev => ev.type === PebEventType.mousemove),
        throttleTime(0, animationFrameScheduler, { trailing: true }),
        filter(event => Math.abs(ev.x - event.x) > Number.EPSILON
          && Math.abs(ev.y - event.y) > Number.EPSILON),
        withLatestFrom(this.selection$, this.screen$, this.editorStore.page$),
        tap(([event, selection, screen]) => {
          const deltaX = event.x - selection.left;
          const deltaY = event.y - selection.top;
          const matrix = translate(deltaX, deltaY);

          elements.forEach((element) => {
            /** Skip nested elements */
            let parent = element;
            while (parent && !elements.has(parent.element.parent?.id)) {
              parent = parent.parent;
            }

            if (!parent) {
              const { left, top } = element.styles;
              const [x1, y1] = applyToPoint(matrix, [left, top]);

              element.styles = {
                ...element.styles,
                left: round(x1) - offset.x,
                top: round(y1) - offset.y,
                zIndex: 100,
              };

              /** Disable Virtual cells content if drag out of cell */
              let cell = element;
              while (cell.parent && cell.parent.element.type !== PebElementType.Grid) {
                cell = cell.parent;
              }

              if (cell.parent && isContextGrid(cell.parent)) {
                const cellBBox = this.tree.toBBox(cell);
                const elmBBox = this.tree.toBBox(element);
                const show = cellBBox.minX <= elmBBox.minX
                  && cellBBox.minY <= elmBBox.minY
                  && cellBBox.maxX >= elmBBox.maxX
                  && cellBBox.maxY >= elmBBox.maxY;

                /** Find indexes of children elements */
                const index = cell.children.findIndex(elm => elm.element.id === element.element.id);
                cell.parent.showVirtualElements(show, index);
              }
            }
          });

          const bbox = findTotalArea([...elements.values()].map(elm => this.tree.toBBox(elm)));
          this.store.dispatch(new PebSetSelectionBBoxAction({
            left: bbox.minX,
            top: bbox.minY,
            right: bbox.maxX,
            bottom: bbox.maxY,
          }));

          const position = this.validateElementsPosition([...elements.values()], bbox, screen);
          const controls = this.createControls(event, position);


          /** Hilight grid if is under cursor */
          const [grid] = this.tree.search({
            minX: event.x,
            minY: event.y,
            maxX: event.x,
            maxY: event.y,
          }).filter(elm => isGridElement(elm));

          if (grid) {
            const gridColor = '#999999';
            controls.push(this.controlsService.createGridControl(grid, PebControlColor.Default, gridColor));
          }

          /** Hilight container */
          if (position.container && !position.invalid.length) {
            controls.push({
              anchorType: PebControlAnchorType.None,
              color: PebControlColor.Default,
              ...this.tree.toBBox(position.container),
            });
          }

          this.controlsService.renderControls(controls);
          this.radiusService.renderRadius([]);
        }),
        takeUntil(this.mouseup$),
        finalizeWithValue(([event, selection, screen, page]) => {
          /** Commit action or revert positions */
          const selected = [...elements.values()];
          let bbox = findTotalArea(selected.map(elm => this.tree.toBBox(elm)));

          const position = this.validateElementsPosition(selected, bbox, screen);
          if (position.invalid.length) {
            elements.forEach((element) => {
              element.styles.zIndex = null;
              if (styles.has(element.element.id)) {
                const { left, top } = styles.get(element.element.id);
                element.styles.left = left;
                element.styles.top = top;
              }
            });
          } else {
            const effects: PebEffect[] = [];

            /** Skip any nested elements */
            const movable = selected.filter(elm => !selected.some(e => e === elm.parent));

            movable.forEach((element) => {
              element.styles.zIndex = null;

              if (element.element.type === PebElementType.Text) {
                // prevent auto resize for text after move
                element.data.textAutosize = { height: false, width: false };
                element.element = { ...element.element, data: { ...element.data } };
              }

              if (position.container && element.parent !== position.container) {
                const index = element.parent.children.findIndex(elm => elm.element.id === element.element.id);
                const viewRef = element.parent.childrenSlot.detach(index);
                element.viewRef = viewRef;
                position.container.childrenSlot.insert(viewRef);
                element.parent.children = element.parent.children.filter(elm => elm.element.id !== element.element.id);
                position.container.children.push(element);

                const origin = this.tree.toBBox(position.container);
                if (position.container.element.type === PebElementType.Section) {
                  origin.minX += (pebScreenDocumentWidthList[screen] - pebScreenContentWidthList[screen]) / 2;
                }

                const elmBBox = this.tree.toBBox(element);

                element.styles.left = elmBBox.minX - origin.minX;
                element.styles.top = elmBBox.minY - origin.minY;

                element.element = {
                  ...element.element,
                  parent: {
                    id: position.container.element.id,
                    type: position.container.element.type,
                  },
                };

                effects.push({
                  target: `${PebEffectTarget.Templates}:${page.templateId}`,
                  type: PebTemplateEffect.RelocateElement,
                  payload: {
                    nextParentId: position.container.element.id,
                    elementId: element.element.id,
                  },
                });
              }

              effects.push({
                target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
                type: PebStylesheetEffect.Update,
                payload: {
                  [element.element.id]: {
                    left: element.styles.left,
                    top: element.styles.top,
                  },
                },
              });

              this.tree.insert(element);
            });

            const action: PebAction = {
              effects,
              id: pebGenerateId('action'),
              targetPageId: page.id,
              affectedPageIds: [page.id],
              createdAt: new Date(),
            };

            this.editorStore.commitAction(action);
          }

          bbox = findTotalArea(selected.map(elm => this.tree.toBBox(elm)));
          this.store.dispatch(new PebSetSelectionBBoxAction({
            left: bbox.minX,
            top: bbox.minY,
            right: bbox.maxX,
            bottom: bbox.maxY,
          }));

          const controls = this.controlsService.createDefaultControlsSet(event, selected);
          this.controlsService.renderControls(controls);
          this.radiusService.renderRadius(controls);
        }),
      )),
    )),
  );

  private collectChildren = (elm: PebAbstractElement, children: Set<string>) => {
    elm.children.forEach((child) => {
      children.add(child.element.id);
      this.collectChildren(child, children);
    });

    return children;
  }

  private validateElementsPosition(elements: PebAbstractElement[], selection: BBox, screen: PebScreen): PebMoveStatus {
    /** Check if whole selection fits inside single element which can have children */
    const elementsToSkip = [];
    const container = this.findContainer(elements, selection);
    if (container) {
      let parent = container.parent;
      while (parent) {
        elementsToSkip.push(parent.element.id);
        parent = parent.parent;
      }
    }

    const children = new Set<string>();
    elements.forEach((element) => {
      this.collectChildren(element, children);
    });

    const valid = [];
    const invalid = [];
    elements.filter(elm => !children.has(elm.element.id)).forEach((element) => {
      const bbox = this.tree.toBBox(element);

      const intersects = this.tree.search(bbox).filter(elm => {
        return elm.element.type !== PebElementType.Document
          && element.element.id !== elm.element.id
          /** Skip all children elements */
          && !children.has(elm.element.id)
          /** If a new container is found, skip it and all its parents */
          && !elementsToSkip.includes(elm.element.id);
      });

      if (intersects.length === 1) {
        /** Check if not crossing section borders and margins */
        if (intersects[0].element.type === PebElementType.Section) {
          const containerBBbox = this.tree.toBBox(intersects[0]);
          const margin = (pebScreenDocumentWidthList[screen] - pebScreenContentWidthList[screen]) / 2;
          containerBBbox.minX += margin;
          containerBBbox.maxX -= margin;
          const contains = containerBBbox.minX <= bbox.minX
            && containerBBbox.minY <= bbox.minY
            && containerBBbox.maxX >= bbox.maxX
            && containerBBbox.maxY >= bbox.maxY;

          if (contains) {
            valid.push(element);
          } else {
            invalid.push(element);
          }
        } else {
          valid.push(element);
        }
      } else {
        invalid.push(element);
      }
    });

    return { valid, invalid, container };
  }

  private createControls(ev: PebEvent, position: PebMoveStatus) {
    const controls: PebControlCommon[] = [];

    position.valid.forEach((elm) => {
      controls.push({
        anchorType: PebControlAnchorType.None,
        color: PebControlColor.Default,
        ...this.tree.toBBox(elm),
      });
    });

    position.invalid.forEach((elm) => {
      controls.push({
        anchorType: PebControlAnchorType.None,
        color: PebControlColor.Invalid,
        ...this.tree.toBBox(elm),
      });
    });

    controls.push({
      anchorType: PebControlAnchorType.Default,
      color: position.invalid.length ? PebControlColor.Invalid : PebControlColor.Default,
      ...findTotalArea(controls),
    });

    return controls;
  }

  findContainer(elements: PebAbstractElement[], bbox: BBox): PebAbstractElement | undefined {
    const children = new Set<string>();
    elements.forEach((element) => {
      this.collectChildren(element, children);
    });

    const [container] = this.tree.search(bbox)
      .map(value => ({ element: value, ...this.tree.toBBox(value) }))
      .filter(value => {
        return !children.has(value.element.element.id)
          && value.element.element.type !== PebElementType.Document
          && value.element.element.type !== PebElementType.Grid
          && value.element.element.type !== PebElementType.Text
          && elements.every(e => e.element.id !== value.element.element.id)
          && value.minX <= bbox.minX
          && value.minY <= bbox.minY
          && value.maxX >= bbox.maxX
          && value.maxY >= bbox.maxY
      })
      .sort((a, b) => (a.maxX - a.minX) - (b.maxX - b.minX) || (a.maxY - a.minY) - (b.maxY - b.minY));

    return container?.element;
  }
}

export interface PebMoveStatus<T = PebAbstractElement> {
  valid: T[],
  invalid: T[],
  container: T | undefined
}
