import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { animationFrameScheduler, combineLatest, Observable, Subject } from 'rxjs';
import { map, tap, throttleTime } from 'rxjs/operators';

import { PebEvent } from '@pe/builder-controls';
import { PebElementType } from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';

import { elementAnchors, gridAnchors, PeAnchorType, PebAnchorType } from './anchors';
import { PebAnchorsService } from './anchors.service';
import { PebContextGridService } from './context-grid.service';
import {
  isGridControl,
  isSectionControl,
  PebControl,
  PebControlAnchorType,
  PebControlColor,
  PebControlCommon, PebGridControl, PebGridControlColumn, PebGridControlRow,
} from './controls';
import { findGroupedElements, findTotalArea, isContextGrid } from './selection';


@Injectable()
export class PebControlsService {

  @Select(PebEditorOptionsState.scale) scale$!: Observable<number>;

  anchorRadius = 4;
  gridRuler = 16;
  gridSeparator = 8;
  gridRulerColor = '#1c1c1e';

  controls$ = new Subject<PebControlCommon[]>();
  controlsData$: Observable<{ controls: PebControl[]; scale: number }> = combineLatest([
    this.controls$,
    this.scale$,
  ]).pipe(
    throttleTime(0, animationFrameScheduler, { trailing: true }),
    map(([controls, scale]) => {
      return controls.reduce((acc, control) => {
        const anchors = isGridControl(control)
          ? gridAnchors(control, scale, this.gridRuler, this.gridSeparator)
          : elementAnchors(control, scale, this.anchorRadius);

        acc.anchors.push(...anchors);

        acc.controls.push({
          anchorType: control.anchorType,
          x: control.minX,
          y: control.minY,
          width: control.maxX - control.minX,
          height: control.maxY - control.minY,
          color: control.color,
          ...({ gridColor: isGridControl(control) ? control.gridColor : undefined }),
          label: isSectionControl(control) ? control.label : undefined,
          anchors: anchors.reduce((acc, anchor) => {

            const width = anchor.maxX - anchor.minX;
            const height = anchor.maxY - anchor.minY;
            const hw = this.gridSeparator / 2 / scale;

            if (isGridControl(control)) {
              if (PebAnchorType.ColSelect === anchor.type) {
                acc.push({
                  width: width + (anchor.minX > control.minX ? hw * 2 : hw),
                  height,
                  x: anchor.minX > control.minX ? anchor.minX - hw : anchor.minX,
                  y: anchor.minY,
                  color: anchor.selected ? control.color : this.gridRulerColor,
                  label: String.fromCharCode('A'.charCodeAt(0) + anchor.index),
                });
              }

              if (PebAnchorType.RowSelect === anchor.type) {
                acc.push({
                  width,
                  height: height + (anchor.minY > control.minY ? hw * 2 : hw),
                  x: anchor.minX,
                  y: anchor.minY > control.minY ? anchor.minY - hw : anchor.minY,
                  color: anchor.selected ? control.color : this.gridRulerColor,
                  label: `${anchor.index + 1}`,
                });
              }

              return acc;
            }

            acc.push({
              width,
              height,
              x: anchor.minX + width / 2,
              y: anchor.minY + height / 2,
              color: control.color,
            });

            return acc;
          }, []),
        });

        return acc;
      }, { anchors: [] as PeAnchorType[], controls: [] as PebControl[], scale })
    }),
    tap(({ anchors }) => {
      this.anchorService.clear();
      this.anchorService.load(anchors);
    }),
    map(({ controls, scale }) => ({ controls, scale: scale > 0 ? 1 / scale : scale })),
  );

  constructor(
    private readonly tree: PebRTree<PebAbstractElement>,
    private readonly anchorService: PebAnchorsService,
    private readonly contextGridService: PebContextGridService,
  ) {
  }

  renderControls(items: PebControlCommon[]) {
    this.controls$.next(items);
  }

  /** Create default controls for selected elements */
  createDefaultControlsSet(elements: PebAbstractElement[], openGroup?: string): PebControlCommon[];
  createDefaultControlsSet(ev: PebEvent, elements: PebAbstractElement[], openGroup?: string): PebControlCommon[];
  createDefaultControlsSet() {
    let ev: PebEvent;
    let elements: PebAbstractElement[];
    let openGroup: string;

    if (Array.isArray(arguments[0])) {
      elements = arguments[0];
      openGroup = arguments[1];
    } else {
      ev = arguments[0];
      elements = arguments[1];
      openGroup = arguments[2];
    }

    /** Do not render controls if Document is only selected element */
    if (elements.length === 1 && elements[0].element.type === PebElementType.Document) {
      return [];
    }

    /** Skip controls rendering for grouped elements, use groups bounding instead */
    const selectedGroups = findGroupedElements(elements, openGroup);
    const controls = elements.reduce((acc, elm) => {
      if (elm.element.type !== PebElementType.Section) {
        const isGrouped = elm.data?.groupId?.some(id => selectedGroups.has(id))
        if (!isGrouped) {
          acc.push({
            anchorType: PebControlAnchorType.None,
            color: PebControlColor.Default,
            ...this.tree.toBBox(elm),
          });
        }
      }

      return acc;
    }, [] as PebControlCommon[]);

    selectedGroups.forEach((items) => {
      controls.push({
        anchorType: PebControlAnchorType.None,
        color: PebControlColor.Default,
        ...findTotalArea(items.map(elm => this.tree.toBBox(elm))),
      });
    });

    /**
     * Should render grid controls if all selected elements have same grid element as root parent.
     * If grid controls should be renderer, also selected cells controls should be rendered.
     */
    const grids = new Map<string, PebAbstractElement>();
    elements.forEach((elm) => {
      let root = elm;
      while (root.parent && root.element.type !== PebElementType.Grid) {
        root = root.parent;
      }
      if (root.element.type === PebElementType.Grid && !grids.has(root.element.id)) {
        grids.set(root.element.id, root);
      }
    });

    if (grids.size === 1) {
      const grid = [...grids.values()][0];

      const allElementsInsideGrid = elements.some((elm) => {
        let parent = elm.parent;
        while (parent && parent.element.id !== grid.element.id) {
          parent = parent.parent;
        }

        return parent?.element.id === grid.element.id;
      });

      if (allElementsInsideGrid || elements.length === 1) {
        controls.push(this.createGridControl(grid));

        if (isContextGrid(grid)) {
          controls.push(...this.contextGridService.createContextGridControls(ev, grid, elements));
        } else {
          const cells = elements.filter(elm => elm.parent?.element.id === grid.element.id);

          cells.forEach(elm => {
            controls.push({
              anchorType: PebControlAnchorType.None,
              color: PebControlColor.Default,
              ...this.tree.toBBox(elm),
            });
          });

          const nonCells = elements.filter(elm => ![elm.element.id, elm.parent?.element.id].includes(grid.element.id));

          if (nonCells.length) {
            controls.push({
              anchorType: PebControlAnchorType.Default,
              color: PebControlColor.Default,
              ...findTotalArea(nonCells.map(elm => this.tree.toBBox(elm))),
            });
          }
        }
      } else {
        controls.push({
          anchorType: PebControlAnchorType.Default,
          color: PebControlColor.Default,
          ...findTotalArea(elements.map(elm => this.tree.toBBox(elm))),
        });
      }
    } else if (elements.every(elm => elm.element.type === PebElementType.Section)) {
      elements.forEach((elm) => {
        controls.push({
          anchorType: PebControlAnchorType.Section,
          color: PebControlColor.Default,
          ...this.tree.toBBox(elm),
          label: elm.data?.name ?? 'Section',
        });
      });
    } else if (elements.length > 0) {
      controls.push({
        anchorType: PebControlAnchorType.Default,
        color: PebControlColor.Default,
        ...findTotalArea(elements.map(elm => this.tree.toBBox(elm))),
      });
    }

    return controls;
  }

  /** Create grid columns and rows controls */
  createGridControl(element: PebAbstractElement, color = PebControlColor.Default, gridColor?: string): PebGridControl {
    const firstLetter = 'A'.charCodeAt(0);
    const columns = element.styles.gridTemplateColumns.reduce<PebGridControlColumn[]>((acc, width, index) => {
      const minX = acc[acc.length - 1]?.maxX ?? 0;

      acc.push({
        minX,
        maxX: minX + width,
        label: String.fromCharCode(firstLetter + index),
        selected: false,
      });

      return acc;
    }, []);

    const rows = element.styles.gridTemplateRows.reduce<PebGridControlRow[]>((acc, height, index) => {
      const minY = acc[acc.length - 1]?.maxY ?? 0;

      acc.push({
        minY,
        index,
        maxY: minY + height,
        selected: false,
      });

      return acc;
    }, []);

    return {
      columns,
      rows,
      color,
      gridColor,
      anchorType: PebControlAnchorType.Grid,
      ...this.tree.toBBox(element),
    };
  }
}
