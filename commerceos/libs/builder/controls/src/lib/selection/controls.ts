/**
 * Available anchors types to render
 * @enum
 */
import { BBox } from 'rbush';

export enum PebControlAnchorType {
  /** Only borders visible, no anchors rendered. */
  None = 'none',
  /** 4 to 9 round resize anchors in the corners and on the edges, if there enough space */
  Default = 'default',
  /** Square resize anchors on top and the bottom of element */
  Section = 'section',
  /** 4 resize anchors in the middle of each edge */
  Text = 'text',
  /**
   * Columns and rows bars, with resize anchors between every column and row,
   * move handle in the top left corner, and proportional resize handles at the end of rulers
   */
  Grid = 'grid',
}

/**
 * Predefined colors for element controls
 */
export enum PebControlColor {
  Default = '#0371e2',
  Invalid = '#ff1744',
  Group = '#656565',
  Debug = '#00ff00',
}

/**
 * Grid nested controls
 */
export interface PebGridControlColumn {
  minX: number;
  maxX: number;
  selected: boolean;
  label: string
}

export interface PebGridControlRow {
  minY: number;
  maxY: number;
  selected: boolean;
  index: number;
}

/**
 * Base control interface - bounding, color and anchors type
 */
export interface PebBaseControl extends BBox {
  anchorType: PebControlAnchorType;
  color: PebControlColor;
}

/**
 * Extended elements controls interfaces with additional fields for strict typings.
 */
export interface PebDefaultControl extends PebBaseControl {
  anchorType: PebControlAnchorType.Default | PebControlAnchorType.Text | PebControlAnchorType.None;
}

export interface PebSectionControl extends PebBaseControl {
  anchorType: PebControlAnchorType.Section | PebControlAnchorType.None;
  label: string;
}

export interface PebGridControl extends PebBaseControl {
  anchorType: PebControlAnchorType.Grid | PebControlAnchorType.None;
  columns: PebGridControlColumn[];
  rows: PebGridControlRow[];
  gridColor?: string;
}

/** Generic elements control */
export type PebControlCommon = PebDefaultControl | PebSectionControl | PebGridControl;

/** Elements controls type guards */
export const isGridControl = (control: PebControlCommon): control is PebGridControl => {
  return control.anchorType === PebControlAnchorType.Grid;
}

export const isSectionControl = (control: PebControlCommon): control is PebSectionControl => {
  return control.anchorType === PebControlAnchorType.Section;
}

/**
 * Simplified interface to render controls and anchors
 */
export interface PebControlRect {
  x: number;
  y: number;
  width: number;
  height: number;
  color: PebControlColor;
}

export interface PebControl extends PebControlRect {
  anchorType: PebControlAnchorType;
  anchors: Array<PebControlRect & { label?: string; }>;
  label?: string;
  gridColor?: string;
}
