import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { BBox } from 'rbush';
import { animationFrameScheduler, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap, throttleTime, withLatestFrom } from 'rxjs/operators';

import { PebElementDef, PebElementType } from '@pe/builder-core';
import { PebGridMakerElement } from '@pe/builder-elements';
import { PebAbstractElement, PebRTree } from '@pe/builder-renderer';
import { PebElementSelectionState, PebSelectAction } from '@pe/builder-state';

import { PebEvent, PebEventType, PebPointerEventsService } from '../pointer';

import { isAnchor } from './anchors';
import { PebContextGridService } from './context-grid.service';
import { PebControlsService } from './controls.service';
import { PebRadiusService } from './radius/radius.service';
import { findGroupedElements, findTotalArea, isContextGrid, isGridElement, PebSelectionError } from './selection';
import { PebSetSelectionBBoxAction } from './selection.actions';

@Injectable({ providedIn: 'any' })
export class PebSelectionService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebElementSelectionState.openGroup) openGroup$!: Observable<string>;

  constructor(
    private readonly tree: PebRTree<PebAbstractElement>,
    private readonly eventsService: PebPointerEventsService,
    private readonly controlsService: PebControlsService,
    private readonly contextGridService: PebContextGridService,
    private readonly store: Store,
    private readonly radiusService: PebRadiusService,
  ) {
  }

  mousedown$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mousedown && !isAnchor(ev.target)),
    withLatestFrom(this.selectedElements$, this.openGroup$),
    tap(([ev, selected, openGroup]) => {
      let target = ev.target as PebAbstractElement;

      /**
       * If event target is grid, it can be only context grid.
       * In this case need to find event target using columns and rows offset from first cell.
       */
      if (isContextGrid(target)) {
        target = this.contextGridService.getContextGridEventTarget(ev, target);
      }

      /** Prevent selection change if element already selected and no shift/meta key pressed */
      const isSelected = selected.some(elm => elm.id === target.element.id);
      if (!isSelected || ev.shiftKey || ev.metaKey) {
        const elements = this.updateSelection(ev, target, selected, openGroup);
        const controls = this.controlsService.createDefaultControlsSet(ev, elements, openGroup);
        this.controlsService.renderControls(controls);
        this.radiusService.renderRadius(controls);
      } else {
        /**
         * Need to update controls if target is inside context grid,
         * because selected element still is the same, but mousedown event can be in other cells
         */
        let elm = target;
        while (elm.parent && !isGridElement(elm)) {
          elm = elm.parent;
        }

        if (isContextGrid(elm)) {
          const controls = this.controlsService.createDefaultControlsSet(ev, selected.map(e => this.tree.find(e.id)), openGroup);
          this.controlsService.renderControls(controls);
        }
      }
    }),
  );

  mouseup$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mouseup)
  );

  mousemove$ = this.mousedown$.pipe(
    switchMap(([mousedown, selected, group]) => this.eventsService.events$.pipe(
      filter(ev => {
        /**
         * Can start drag selection only on Document or Section elements,
         * or on grid cells, if grid is only one currently selected element.
         */
        const target = mousedown.target as PebAbstractElement;
        const isGridCell = target.parent?.element.type === PebElementType.Grid;
        let allowSelectCells = false;
        if (isGridCell) {
          allowSelectCells = selected.some(elm => elm.id === target.parent?.element.id);
        }

        return ev.type === PebEventType.mousemove
          && (allowSelectCells || [PebElementType.Document, PebElementType.Section].includes(target.element.type));
      }),
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      tap((ev) => {
        const bbox = {
          minX: Math.min(mousedown.x, ev.x),
          minY: Math.min(mousedown.y, ev.y),
          maxX: Math.max(mousedown.x, ev.x),
          maxY: Math.max(mousedown.y, ev.y),
        };

        const intersects = this.tree.search(bbox);

        const elements = this.updateSelection(ev, intersects, selected, group);
        const controls = this.controlsService.createDefaultControlsSet(ev, elements, group);
        this.controlsService.renderControls(controls);
        this.radiusService.renderRadius(controls);
      }),
      map(({ x, y }) => ({ x1: mousedown.x, y1: mousedown.y, x2: x, y2: y })),
      takeUntil(this.mouseup$),
    )),
  );

  /**
   * Update elements selection
   * @param ev ShiftKey or MetaKey is pressed
   * @param value Elements to add or remove from selection - mousedown target or elements found in RTree by selection area
   * @param selected Already selected elements
   * @param openGroup Current selected (open on dblclick) group
   */
  updateSelection(ev: PebEvent, value: PebAbstractElement | PebAbstractElement[], selected: PebElementDef[], openGroup?: string) {
    let elements = Array.isArray(value) ? value : [value];

    /**
     * At least Document element should be always selected.
     * When no other elements selected, UI in editor show properties for a Document element.
     * As Document element dimensions are defined from -Infinity to Infinity it's always
     * should be present in mouse event target if no others elements at mouse position found
     * or by search in elements RTree.
     */
    if (elements.length === 0) {
      throw new PebSelectionError(`Elements array can't be empty`);
    }

    /**
     * If elements to select contains only Document element:
     * if no shift or meta key pressed - select Document element and return,
     * otherwise remove it from elements array.
     */
    if (elements.length === 1 && elements[0].element.type === PebElementType.Document) {
      if (!ev.shiftKey && !ev.metaKey) {
        this.store.dispatch(new PebSelectAction(elements[0].element.id));
        this.controlsService.renderControls([]);

        /** Set selection bounding to Document size */
        const bbox = this.getDocumentBBox();
        this.store.dispatch(new PebSetSelectionBBoxAction({
          left: bbox.minX,
          top: bbox.minY,
          right: bbox.maxX,
          bottom: bbox.maxY,
        }));

        return elements;
      }

      elements = [];
    }

    /** Calculate virtual cells offset inside grid */
    if (elements.length === 1) {
      const elm = elements[0];
      if (isContextGrid(elm)) {
        const target = this.contextGridService.getContextGridEventTarget(ev, elm);
        elements = [target];
      }
    }

    /**
     * By mousedown selection Grid can't be selected directly,
     * instead in elements will be cells shapes or nested elements.
     * If some Grid elements present, they only can be found in RTree by drag selection
     * In this case need to remove all grid cells and nested cells elements.
     */
    const grids = new Map<string, PebGridMakerElement>();
    elements.forEach((elm) => {
      if (!isGridElement(elm)) {
        let parent = elm.parent;
        while (parent && !isGridElement(parent)) {
          parent = parent.parent;
        }
      }

      if (isGridElement(elm) && !grids.has(elm.element.id)) {
        grids.set(elm.element.id, elm);
      }
    });

    if (grids.size) {
      const nestedElements = (elm: PebAbstractElement, acc: PebAbstractElement[] = []) => {
        elm.children.forEach((elm) => {
          acc.push(elm);

          nestedElements(elm, acc);
        })

        return acc;
      }

      const children = [...grids.values()].reduce<PebAbstractElement[]>((acc, elm) => acc.concat(nestedElements(elm)), []);
      elements = elements.filter(elm => !children.some(e => e.element.id === elm.element.id));
    }

    /** Check if element is inside grid */
    if (elements.length === 1) {

      let grid = elements[0];
      let cell = elements[0];
      while (!isGridElement(grid) && grid.parent) {
        cell = grid;
        grid = grid.parent;
      }

      if (isGridElement(grid)) {
        const isGridSelected = selected.some(elm => elm.id === grid.element.id);
        const isCellSelected = selected.some(elm => elm.id === cell.element.id);

        const isAnySelected = selected.map(elm => this.tree.find(elm.id)).some((elm) => {
          let parent = elm.parent;
          while (parent && parent.element.id !== grid.element.id) {
            parent = parent.parent;
          }

          return parent?.element.id === grid.element.id;
        });

        if (!isGridSelected && !isCellSelected && !isAnySelected) {
          elements = [grid];
        } else if (!isCellSelected && !isAnySelected) {
          elements = [cell];
        } else if (!isAnySelected) {
          elements = [grid];
        }
      }
    }

    /** Filter Document and Section elements */
    if (elements.every(elm => [PebElementType.Document, PebElementType.Section].includes(elm.element.type))) {
      elements = elements.filter(elm => elm.element.type === PebElementType.Section);
      /** Need to modify section sidebar forms to handle multiple selected sections, for now take only first */
      elements.splice(1);
    } else if (elements.length > 1) {
      elements = elements.filter(elm => ![PebElementType.Document, PebElementType.Section].includes(elm.element.type));
    }

    /** If any group is open, only elements having this group id can be selected */
    if (openGroup) {
      elements = elements.filter(elm => elm.data.groupId.includes(openGroup));
    }

    /** Find all grouped elements, keep each group items separately to render group controls */
    const groups = findGroupedElements(elements, openGroup);

    /** Add items for all groups found into elements */
    if (groups.size) {
      const groupedItems = [...groups.values()].reduce((acc, val) => acc.concat(val), []);
      elements = [...new Set<PebAbstractElement>([...elements, ...groupedItems])];
    }

    /** If shift or meta key pressed, selection is diff of new elements and already selected */
    if (ev.shiftKey || ev.metaKey) {
      const toAdd = elements.filter(elm => !selected.find(e => e.id === elm.element.id));
      const toKeep = selected.filter(elm => !elements.find(e => elm.id === e.element.id));
      elements = toAdd.concat(toKeep.map(elm => this.tree.find(elm.id)));
    }

    this.store.dispatch(new PebSelectAction(elements.map(e => e.element.id)));

    const bbox = elements.length
      ? findTotalArea(elements.map(elm => this.tree.toBBox(elm)))
      : this.getDocumentBBox();

    this.store.dispatch(new PebSetSelectionBBoxAction({
      left: bbox.minX,
      top: bbox.minY,
      right: bbox.maxX,
      bottom: bbox.maxY,
    }));

    return elements;
  }

  getDocumentBBox(): BBox {
    const [document] = [...this.tree.elements.values()].filter(elm => elm.element.type === PebElementType.Document);

    return document.children.map(section => this.tree.toBBox(section))
      .reduce((acc, section) => {
        return {
          minX: Math.min(acc.minX ?? section.minX, section.minX),
          minY: Math.min(acc.minY ?? section.minY, section.minY),
          maxX: Math.max(acc.maxX ?? section.maxX, section.maxX),
          maxY: Math.max(acc.maxY ?? section.maxY, section.maxY),
        }
      });
  }
}
