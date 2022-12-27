import { PebAction } from '../models/action';
import { PebThemeStateInterface } from '../models/client';
import {
  PebThemeDetailInterface,
  PebThemePageInterface,
} from '../models/database';

import {
  applyEffectsOnHandlerState,
  createInitialSnapshot,
  Dictionary,
  extractPagesFromHandlerState,
  getInitialHandlerState,
  getSnapshotFromHandlerState,
  HandlerState,
  hashObject,
  hashString,
  updateDictPagesAndSnapshotPagesLastActionId,
  updatePageHash,
} from './compiler.helpers';

export {
  hashObject,
  hashString,
  createInitialSnapshot as createInitialShopSnapshot,
};

export function pebActionHandler(
  currentState: PebThemeStateInterface,
  action: PebAction,
): PebThemeStateInterface {

  const initialHandlerState: HandlerState = getInitialHandlerState(currentState);

  const stateWithAppliedEffects: HandlerState = applyEffectsOnHandlerState(
    action.effects,
    initialHandlerState,
  );

  const statePagesDictionary: Dictionary<PebThemePageInterface> = extractPagesFromHandlerState(stateWithAppliedEffects);

  const snapshot: PebThemeDetailInterface = getSnapshotFromHandlerState(
    stateWithAppliedEffects,
    statePagesDictionary,
  );

  const { id, hash, ...inputAreas } = snapshot;

  updateDictPagesAndSnapshotPagesLastActionId(statePagesDictionary, inputAreas.pages, action);

  for (const page of Object.values(statePagesDictionary)) {
    updatePageHash(page);
  }

  return {
    pages: statePagesDictionary,
    snapshot: {
      id,
      hash: hashObject(inputAreas),
      ...inputAreas,
      updatedAt: (new Date()).toString(),
    },
  };
}

export const pebCompileActions = (actions: PebAction[]): PebThemeStateInterface =>
  actions.reduce(pebActionHandler, { snapshot: createInitialSnapshot(), pages: {} });
