import { PebContextSchemaEffect } from '../../models/action';

import { pebContextSchemaEffectHandlers } from './context-schema.effects';

describe('Effects:Context Schema', () => {

  let payload: any;

  beforeEach(() => {

    payload = {
      data: { id: '000' },
    };

  });

  it('should handle effect init', () => {

    const initHandler = pebContextSchemaEffectHandlers[PebContextSchemaEffect.Init];

    expect(initHandler(null, payload)).toEqual(payload);

  });

  it('should handle effect update pebContextSchemaEffectUpdateHandler', () => {

    const updateHandler = pebContextSchemaEffectHandlers[PebContextSchemaEffect.Update];
    const prevSchema = { test: 'prev' };

    expect(updateHandler(prevSchema, payload)).toEqual({
      ...prevSchema,
      ...payload,
    });

  });

  it('should handle effect delete', () => {

    const deleteHandler = pebContextSchemaEffectHandlers[PebContextSchemaEffect.Delete];

    expect(deleteHandler({}, 'payload')).toEqual({});
    expect(deleteHandler({ payload }, 'payload')).toEqual({});

  });

  it('should handle effect destroy', () => {

    const destroyHandler = pebContextSchemaEffectHandlers[PebContextSchemaEffect.Destroy];

    expect(destroyHandler(null, null)).toBeNull();

  });

});
