import { BBox } from 'rbush';

import { PebElementContextState, PebElementType } from '@pe/builder-core';
import { PebGridMakerElement } from '@pe/builder-elements';
import { PebAbstractElement } from '@pe/builder-renderer';

export class PebSelectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PebSelectionError';
  }
}

/**
 * Find all elements which belongs to selected groups
 * @param elements
 * @param openGroup
 */
export const findGroupedElements = (elements: PebAbstractElement[], openGroup?: string) => {
  return elements.reduce((acc, elm) => {
    if (elm.data.groupId?.length) {
      const groupId = openGroup
        ? elm.data.groupId[Math.max(elm.data.groupId.indexOf(openGroup) - 1, 0)]
        : elm.data.groupId.slice(-1).pop();

      if (!acc.has(groupId)) {
        const siblings = elm.parent?.children.filter(elm => elm.data.groupId?.includes(groupId));
        acc.set(groupId, siblings);
      }
    }

    return acc;
  }, new Map<string, PebAbstractElement[]>());
}

export const isGridElement = (value: PebAbstractElement): value is PebGridMakerElement => {
  return value.element.type === PebElementType.Grid;
}

export function isContextGrid(elm: PebAbstractElement): elm is PebGridMakerElement {
  return elm.element.type === PebElementType.Grid && elm.context?.state === PebElementContextState.Ready;
}

export interface PebSelectionPosition {
  x: number;
  y: number;
}

export interface PebSelectionDimensions {
  width: number;
  height: number;
}

export interface PebSelectionBounding {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type PebSelectionBBox = PebSelectionPosition & PebSelectionDimensions & PebSelectionBounding;

export const isSelectionPosition = (value: Partial<PebSelectionBBox>): value is PebSelectionPosition => {
  return value.x !== undefined && value.y !== undefined;
}

export const isSelectionDimensions = (value: Partial<PebSelectionBBox>): value is PebSelectionDimensions => {
  return value.width !== undefined && value.height !== undefined;
}

export const isSelectionBounding = (value: Partial<PebSelectionBBox>): value is PebSelectionBounding => {
  return value.left !== undefined
    && value.top !== undefined
    && value.right !== undefined
    && value.bottom !== undefined;
}

/**
 * Find common bounding of passed items, mostly for calculating current selection dimensions
 */
export const findTotalArea = (items: BBox[]): BBox => {
  const bbox = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };

  return items.reduce((acc, { minX, minY, maxX, maxY }) => {
    return {
      minX: Math.min(acc.minX, minX),
      minY: Math.min(acc.minY, minY),
      maxX: Math.max(acc.maxX, maxX),
      maxY: Math.max(acc.maxY, maxY),
    };
  }, bbox);
}
