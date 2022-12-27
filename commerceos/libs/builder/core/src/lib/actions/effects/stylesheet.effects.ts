import { omit } from 'lodash';

import { PebStylesheetEffect, PebStylesReplacePayload } from '../../models/action';
import { PebStylesheet, PebStylesheetId } from '../../models/client';

type PebStylesheetEffectPayload = PebStylesheet | string | PebStylesReplacePayload;

export const pebStylesheetEffectHandlers: {
  [effectName in PebStylesheetEffect]: (
    stylesheet: null | PebStylesheet,
    payload: PebStylesheetEffectPayload,
  ) => PebStylesheet | null
} = {
  [PebStylesheetEffect.Init]: pebStylesheetInitHandler,
  [PebStylesheetEffect.Update]: pebStylesheetUpdateHandler,
  [PebStylesheetEffect.Replace]: pebStylesheetReplaceHandler,
  [PebStylesheetEffect.Delete]: pebStylesheetDeleteHandler,
  [PebStylesheetEffect.Destroy]: pebStylesheetDestroyHandler,
};

function pebStylesheetInitHandler(stylesheet, payload: PebStylesheetEffectPayload): PebStylesheet {
  return payload as PebStylesheet;
}

function pebStylesheetUpdateHandler(prevState: PebStylesheet, payload: PebStylesheet): PebStylesheet {
  const currState = { ...prevState };

  Object.keys(payload).forEach((key: string) => {
    currState[key] = currState[key] ? { ...currState[key], ...payload[key] } : payload[key];
  });

  return currState;
}

function pebStylesheetReplaceHandler(prevState: PebStylesheet, payload: PebStylesheetEffectPayload): PebStylesheet {
  const { selector, styles } = payload as PebStylesReplacePayload;

  return {
    ...(omit(prevState, [selector])),
    [selector]: styles,
  };
}

function pebStylesheetDeleteHandler(prevState: PebStylesheet, payload: PebStylesheetEffectPayload): PebStylesheet {
  return omit(prevState, [payload as PebStylesheetId]);
}

function pebStylesheetDestroyHandler(): PebStylesheet {
  return null;
}
