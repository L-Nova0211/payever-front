import { BBox } from 'rbush';

import { PebAbstractElement } from '@pe/builder-renderer';

import { PebControlAnchorType, PebDefaultControl, PebGridControl, PebSectionControl } from './controls';

/**
 * Anchor types to choose appropriate event handler
 */
export enum PebAnchorType {
  N = 'n',
  NW = 'nw',
  W = 'w',
  SW = 'sw',
  S = 's',
  SE = 'se',
  E = 'e',
  NE = 'ne',
  EW = 'ew',
  NS = 'ns',
  Move = 'move',
  ColResize = 'col-resize',
  RowResize = 'row-resize',
  ColSelect = 'col-select',
  RowSelect = 'row-select',
  Radius = 'radius',
}

/**
 * Available CSS cursor types for anchors to set on document when interacting with anchor
 */
export enum CursorType {
  Default = 'default',
  Auto = 'auto',
  Text = 'text',
  Cell = 'cell',
  Pointer = 'pointer',
  Move = 'move',
  NotAllowed = 'not-allowed',
  Crosshair = 'crosshair',
  ColResize = 'col-resize',
  RowResize = 'row-resize',
  N_Resize = 'n-resize',
  E_Resize = 'e-resize',
  S_Resize = 's-resize',
  W_Resize = 'w-resize',
  NE_Resize = 'ne-resize',
  NW_Resize = 'nw-resize',
  SE_Resize = 'se-resize',
  SW_Resize = 'sw-resize',
  EW_Resize = 'ew-resize',
  NS_Resize = 'ns-resize',
  NESW_Resize = 'nesw-resize',
  NWSE_Resize = 'nwse-resize',
}

/**
 * Interface for anchors to use in RTree
 */
export interface PeAnchorType extends BBox {
  type: PebAnchorType;
  cursor: CursorType;
  selected?: boolean;
  index?: number;
}

/**
 * Minimal size of element to render middle anchor on the edges
 */
export const THREE_ANCHORS_MIN_SIZE = 20;

/**
 * Create array of anchors for elements depending on control type,
 * except grid, to insert into anchors RTree
 */
export function elementAnchors(control: PebDefaultControl | PebSectionControl, scale = 1, radius = 4): PeAnchorType[] {
  let anchors = [];
  const { minX, minY, maxX, maxY, anchorType } = control;

  if (anchorType === PebControlAnchorType.None) {
    return anchors;
  }

  const width = maxX - minX;
  const height = maxY - minY;

  if (anchorType === PebControlAnchorType.Section) {
    return [
      {
        type: PebAnchorType.N,
        ...anchorRect(minX + width / 2, minY, scale, 36, 18),
        cursor: CursorType.NS_Resize,
      },
      {
        type: PebAnchorType.S,
        ...anchorRect(minX + width / 2, maxY, scale, 36, 18),
        cursor: CursorType.NS_Resize,
      },
    ];
  }

  const n = {
    type: PebAnchorType.N,
    ...anchorRect(minX + width / 2, minY, scale, radius),
    cursor: CursorType.NS_Resize,
  };

  const s = {
    type: PebAnchorType.S,
    ...anchorRect(minX + width / 2, maxY, scale, radius),
    cursor: CursorType.NS_Resize,
  };

  const w = {
    type: PebAnchorType.W,
    ...anchorRect(minX, minY + height / 2, scale, radius),
    cursor: CursorType.EW_Resize,
  };

  const e = {
    type: PebAnchorType.E,
    ...anchorRect(maxX, minY + height / 2, scale, radius),
    cursor: CursorType.EW_Resize,
  };

  if (anchorType === PebControlAnchorType.Text || width >= THREE_ANCHORS_MIN_SIZE) {
    anchors = anchors.concat(n, s);
  }

  if (anchorType === PebControlAnchorType.Text || height >= THREE_ANCHORS_MIN_SIZE) {
    anchors = anchors.concat(w, e);
  }

  if (anchorType !== PebControlAnchorType.Text) {
    anchors = anchors.concat([
      {
        type: PebAnchorType.NW,
        ...anchorRect(minX, minY, scale, radius),
        cursor: CursorType.NWSE_Resize,
      },
      {
        type: PebAnchorType.NE,
        ...anchorRect(maxX, minY, scale, radius),
        cursor: CursorType.NESW_Resize,
      },
      {
        type: PebAnchorType.SE,
        ...anchorRect(maxX, maxY, scale, radius),
        cursor: CursorType.NWSE_Resize,
      },
      {
        type: PebAnchorType.SW,
        ...anchorRect(minX, maxY, scale, radius),
        cursor: CursorType.NESW_Resize,
      },
    ]);
  }

  return anchors;
}

/**
 * Create appropriate bounding box for anchors
 */
export function anchorRect(x: number, y: number, scale: number, radius: number): BBox;
export function anchorRect(x: number, y: number, scale: number, width: number, height: number): BBox;
export function anchorRect(...args: number[]): BBox {
  const [x, y, scale, w, h] = args;
  const hw = (h ? w / 2 : w) / scale;
  const hh = (h ? h / 2 : w) / scale;

  return {
    minX: x - hw,
    minY: y - hh,
    maxX: x + hw,
    maxY: y + hh,
  }
}

/**
 * Create RTree items for grid anchors
 * @param control Grid Control
 * @param scale Current Scale of editor
 * @param ruler Scale independent height of columns and width of rows rulers
 * @param separator width of columns and height of rows resize anchors
 */
export function gridAnchors(control: PebGridControl, scale = 1, ruler = 16, separator = 8): PeAnchorType[] {
  /** Half of resize anchor width */
  const hw = separator / 2 / scale;
  /** Scaled ruler size */
  const d = ruler / scale;

  const { minX, minY, maxX, maxY } = control;

  const anchors: PeAnchorType[] = [
    {
      type: PebAnchorType.Move,
      cursor: CursorType.Move,
      minX: minX - d,
      minY: minY - d,
      maxX: minX,
      maxY: minY,
    },
    {
      type: PebAnchorType.EW,
      cursor: CursorType.EW_Resize,
      minX: maxX + hw,
      minY: minY - d,
      maxX: maxX + (ruler - 3) / scale,
      maxY: minY,
    },
    {
      type: PebAnchorType.NS,
      cursor: CursorType.NS_Resize,
      minX: minX - d,
      minY: maxY + hw,
      maxX: minX,
      maxY: maxY + (ruler - 3) / scale,
    },
  ];

  control.columns.forEach((col, index) => {
    anchors.push(
      {
        index,
        type: PebAnchorType.ColSelect,
        cursor: CursorType.Cell,
        selected: col.selected,
        minX: minX + col.minX + (index === 0 ? 0 : hw),
        minY: minY - d,
        maxX: minX + col.maxX - hw,
        maxY: minY,
      },
      {
        index,
        type: PebAnchorType.ColResize,
        cursor: CursorType.ColResize,
        minX: minX + col.maxX - hw,
        minY: minY - d,
        maxX: minX + col.maxX + hw,
        maxY: minY,
      },
    );
  });

  control.rows.forEach((row, index) => {
    anchors.push(
      {
        index,
        type: PebAnchorType.RowSelect,
        cursor: CursorType.Default,
        selected: row.selected,
        minX: minX - d,
        minY: minY + row.minY + (index === 0 ? 0 : hw),
        maxX: minX,
        maxY: minY + row.maxY - hw,
      },
      {
        index,
        type: PebAnchorType.RowResize,
        cursor: CursorType.RowResize,
        minX: minX - d,
        minY: minY + row.maxY - hw,
        maxX: minX,
        maxY: minY + row.maxY + hw,
      },
    );
  });

  return anchors;
}

/** Type guard for event target */
export function isAnchor(item: PebAbstractElement | PeAnchorType): item is PeAnchorType {
  return (item as PeAnchorType).type !== undefined;
}

export function isAnchorRadius(item: PebAbstractElement | PeAnchorType): item is PeAnchorType {
  const type = (item as PeAnchorType).type;

  return (item as PeAnchorType).type !== undefined && type === PebAnchorType.Radius;
}
