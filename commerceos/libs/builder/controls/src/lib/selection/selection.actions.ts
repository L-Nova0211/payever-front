import { PebSelectionBounding, PebSelectionDimensions, PebSelectionPosition } from './selection';

export class PebSetSelectionBBoxAction {
  static readonly type = '[Peb/SelectionBBox] Set BBox';

  constructor(public payload: PebSelectionPosition | PebSelectionDimensions | PebSelectionBounding) {
  }
}
