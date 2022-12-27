import { PebContextSchemaEffect, PebPageEffect, PebShopEffect, PebStylesheetEffect, PebTemplateEffect } from '@pe/builder-core';

import { pebCreateEffect } from './effect-creator.service';

describe('EffectCreator', () => {

  it('should get target type', () => {

    // null
    expect(pebCreateEffect('test_type' as any, null, null).target).toEqual('null');

    // shop
    expect(pebCreateEffect(PebShopEffect.Init as any, 'target', 'payload').target).toEqual('shop:target');

    // pages
    expect(pebCreateEffect(PebPageEffect.Create as any, 'target', 'payload').target).toEqual('pages:target');

    // template
    expect(pebCreateEffect(PebTemplateEffect.Init as any, 'target', 'payload').target).toEqual('templates:target');

    // stylesheet
    expect(pebCreateEffect(PebStylesheetEffect.Init as any, 'target', 'payload').target).toEqual('stylesheets:target');

    // schema
    expect(pebCreateEffect(PebContextSchemaEffect.Init as any, 'target', 'payload').target).toEqual('contextSchemas:target');

  });

});
