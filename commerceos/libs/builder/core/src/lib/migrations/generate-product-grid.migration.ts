import { PebScreen } from '../constants';
import { PebIntegrationActionQueryType, PebIntegrationActionResponseType, PebIntegrationDataType } from '../models/api';
import { PebElementContextState, PebElementType, PebFunctionType } from '../models/element';
import { pebGenerateId } from '../utils/generate-id';

import { loader } from './integration.loader';


export async function generateProductGrid(albumId: string, environment: any) {
  const integrations = await loader.integrations;
  const integration = integrations.find(i => i.tag === 'products');

  const gridFunctionLink = getGridFunctionLink(integrations, integration);
  const imageFunctionLink = getShapeFunctionLink(integrations, integration, 'imagesUrl.0');
  const titleFunctionLink = getShapeFunctionLink(integrations, integration, 'title');
  const priceFunctionLink = getShapeFunctionLink(integrations, integration, 'priceAndCurrency');

  const gridContextSchema = {
    params: [
      { ...gridFunctionLink.integration },
      { ...integration.actions.find(a => a.method === 'getProductsForBuilder') },
      [],
      [],
      { offset: 0, limit: 6 },
      { contextParameterType: 'dynamic', value: '@product-filters.data' },
      { contextParameterType: 'dynamic', value: '@product-sort.data' },
    ],
    service: 'integrations',
    method: 'fetchActionWithAdditional',
  };

  const gridId = pebGenerateId();
  const cellId = pebGenerateId();

  return {
    album: albumId,
    id: pebGenerateId(),
    basic: true,
    title: 'Product Table',
    screen: PebScreen.Desktop,
    elementKit: {
      element: {
        id: gridId,
        type: PebElementType.Grid,
        data: {
          colCount: 3,
          rowCount: 2,
          functionLink: gridFunctionLink,
          spacing: 5,
        },
        children: [],
      },
      styles: {
        [PebScreen.Desktop]: {
          width: 300,
          height: 300,
          gridTemplateColumns: [100, 100, 100],
          gridTemplateRows: [150, 150],
        },
      },
      context: { state: PebElementContextState.Empty },
      contextSchema: gridContextSchema,
      children: [
        {
          element: {
            id: cellId,
            type: PebElementType.Shape,
            data: {},
            children: [],
            parent: { id: gridId, slot: 'host', type: PebElementType.Grid },
            index: 0,
          },
          styles: { [PebScreen.Desktop]: { backgroundColor: 'rgba(0,162,255,0)' } },
          context: { state: PebElementContextState.Empty },
          children: [
            {
              element: {
                id: pebGenerateId(),
                type: PebElementType.Shape,
                data: {
                  functionLink: imageFunctionLink,
                },
                children: [],
                parent: { id: cellId, slot: 'host', type: PebElementType.Shape },
                index: 0,
              },
              styles: {
                [PebScreen.Desktop]: {
                  height: 100,
                  left: 0,
                  position: 'absolute',
                  top: 0,
                  width: 100,
                },
              },
              context: { state: PebElementContextState.Empty },
              children: [],
            },
            {
              element: {
                id: pebGenerateId(),
                type: PebElementType.Shape,
                data: {
                  functionLink: titleFunctionLink,
                  text: {
                    desktop: {
                      generic: {
                        ops: [
                          {
                            insert: '',
                            attributes: {
                              align: 'left',
                              fontSize: 15,
                              verticalAlign: 'top',
                            },
                          },
                        ],
                      },
                    },
                  } as any,
                },
                children: [],
                parent: { id: cellId, slot: 'host', type: PebElementType.Shape },
                index: 1,
              },
              styles: {
                [PebScreen.Desktop]: {
                  height: 17,
                  left: 0,
                  position: 'absolute',
                  top: 108,
                  width: 100,
                },
              },
              context: { state: PebElementContextState.Empty },
              children: [],
            },
            {
              element: {
                id: pebGenerateId(),
                type: PebElementType.Shape,
                data: {
                  functionLink: priceFunctionLink,
                  text: {
                    desktop: {
                      generic: {
                        ops: [
                          {
                            insert: '',
                            attributes: {
                              align: 'left',
                              color: '#a5a5a5',
                              fontSize: 12,
                              verticalAlign: 'top',
                            },
                          },
                        ],
                      },
                    },
                  } as any,
                },
                children: [],
                parent: { id: cellId, slot: 'host', type: PebElementType.Shape },
                index: 2,
              },
              styles: {
                [PebScreen.Desktop]: {
                  height: 17,
                  left: 0,
                  position: 'absolute',
                  top: 125,
                  width: 100,
                },
              },
              context: { data: {}, state: PebElementContextState.Empty },
              children: [],
            },
          ],
        },
      ],
    },
    generated: true,
  };
}


function getGridFunctionLink(integrations, integration) {
  const functionLink = { ...integration.actions.find(a => a.method === 'getProductsForBuilder') };

  functionLink.functionType = PebFunctionType.Action;
  functionLink.integration = { ...integrations.find(i => i.id === functionLink.integration) };
  functionLink.integration.actions = functionLink.integration.actions
    .filter(i => i.queryType === PebIntegrationActionQueryType.Query
      && i.responseType === PebIntegrationActionResponseType.List
      && i.url === '/products');
  functionLink.integration.data = [];

  return functionLink;
}

export function getShapeFunctionLink(integrations, integration, property) {
  const functionLink = { ...integration.data.find(data => data.property === property) };

  functionLink.functionType = PebFunctionType.Data;
  functionLink.integration = { ...integrations.find(i => i.id === functionLink.integration) };
  functionLink.integration.actions = [];
  functionLink.integration.data = functionLink.integration.data
    .filter(d => d.dataType === PebIntegrationDataType.Text);

  return functionLink;
}
