import { PebIntegrationActionTag, PebIntegrationTag } from '../models/api';
import { PebElementType, PebFunctionType } from '../models/element';

import { gridProductPrice } from './grid-product-price.migration';

describe('Migrations:grid-product-price', () => {

  it('should set grid product price', () => {

    const elementDef = {
      id: 'elem',
      type: PebElementType.Grid,
      data: null,
    };
    const page = {
      id: 'p-001',
      context: null,
    };

    /**
     * page.context is null
     * elementDef.data is null
     */
    expect(gridProductPrice(page as any, elementDef)).toEqual(elementDef);
    expect(page.context).toBeNull();

    /**
     * elementDef.data.functionLink.integration & tags are null
     * page.context.[elementDef.id] is null
     */
    elementDef.data = {
      functionLink: {
        functionType: PebFunctionType.Action,
        integration: null,
        tags: null,
      },
    };
    page.context = {
      [elementDef.id]: null,
    };

    expect(gridProductPrice(page as any, elementDef)).toEqual(elementDef);
    expect(page.context[elementDef.id]).toBeNull();

    /**
     * elementDef.data.functionLink.integration is set
     * page.context.[elementDef.id].params is null
     */
    elementDef.data.functionLink.integration = {
      tag: PebIntegrationTag.Products,
    };
    page.context[elementDef.id] = { params: null };

    expect(gridProductPrice(page as any, elementDef)).toEqual(elementDef);
    expect(page.context[elementDef.id].params).toBeNull();

    /**
     * elementDef.data.functionLink.tags is set
     * page.context.[elementDef.id].params[1] is null
     */
    elementDef.data.functionLink.tags = [PebIntegrationActionTag.GetList];
    page.context[elementDef.id].params = Array(2).fill(null);

    expect(gridProductPrice(page as any, elementDef)).toEqual(elementDef);
    expect(page.context[elementDef.id].params[1]).toBeNull();

    /**
     * page.context.[elementDef.id].params[1].meta.price is null
     */
    page.context[elementDef.id].params[1] = {
      meta: {
        price: null,
      },
    };

    expect(gridProductPrice(page as any, elementDef)).toEqual(elementDef);
    expect(page.context[elementDef.id].params[1].meta.price).toEqual({
      type: 'number',
      subtype: 'value',
    });

  });

});
