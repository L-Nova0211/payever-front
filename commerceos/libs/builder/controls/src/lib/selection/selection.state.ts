import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { isSelectionBounding, isSelectionDimensions, isSelectionPosition, PebSelectionBBox } from './selection';
import { PebSetSelectionBBoxAction } from './selection.actions';


/**
 *
 */
@State<PebSelectionBBox>({
  name: 'selectionBBox',
  defaults: undefined,
})
@Injectable({ providedIn: 'any' })
export class PebSelectionBBoxState {

  @Selector()
  static boundingBox(state: PebSelectionBBox) {
    return state;
  }

  @Action(PebSetSelectionBBoxAction)
  setSelectionBBox({ getState, patchState }: StateContext<PebSelectionBBox>, { payload }: PebSetSelectionBBoxAction) {
    let bbox = getState();
    if (isSelectionDimensions(payload)) {
      patchState({
        ...payload,
        right: bbox.x + payload.width,
        bottom: bbox.y + payload.height,
      });
    } else if (isSelectionPosition(payload)) {
      patchState({
        ...payload,
        left: payload.x,
        top: payload.y,
      });
    } else if (isSelectionBounding(payload)) {
      patchState({
        ...payload,
        x: payload.left,
        y: payload.top,
        width: payload.right - payload.left,
        height: payload.bottom - payload.top,
      });
    }
  }
}
