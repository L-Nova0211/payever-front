import { assign } from 'lodash';

import { PebContextSchemaEffect } from '../../models/action';
import { PebContextSchema, PebContextSchemaId } from '../../models/client';

export const pebContextSchemaEffectHandlers: {
  [effectName in PebContextSchemaEffect]:
  (schema: null | PebContextSchema, payload: PebContextSchema | string) => PebContextSchema | null
} = {
  [PebContextSchemaEffect.Init]: pebContextSchemaEffectInitHandler,
  [PebContextSchemaEffect.Update]: pebContextSchemaEffectUpdateHandler,
  [PebContextSchemaEffect.Delete]: pebContextSchemaEffectDeleteHandler,
  [PebContextSchemaEffect.Destroy]: pebContextSchemaEffectDestroyHandler,
};

function pebContextSchemaEffectInitHandler(
  schema: PebContextSchema | null,
  payload: PebContextSchema | string
): PebContextSchema {
  return payload as PebContextSchema;
}

function pebContextSchemaEffectUpdateHandler(
  prevSchema: PebContextSchema | null,
  payload: PebContextSchema | string,
): PebContextSchema {
  return assign({}, prevSchema, payload);
}

function pebContextSchemaEffectDeleteHandler(
  prevSchema: PebContextSchema | null,
  payload: PebContextSchema | PebContextSchemaId,
): PebContextSchema {
  if (prevSchema[payload as PebContextSchemaId]) {
    delete prevSchema[payload as PebContextSchemaId];
  }

  return prevSchema;
}

function pebContextSchemaEffectDestroyHandler(): PebContextSchema {
  return null;
}
