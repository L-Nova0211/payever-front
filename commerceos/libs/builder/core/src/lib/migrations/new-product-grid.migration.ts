import { PebScreen } from '../constants';
import { isIntegrationAction, PebElementType } from '../models/element';
import { pebGenerateId } from '../utils';

import { getShapeFunctionLink } from './generate-product-grid.migration';
import { loader } from './integration.loader';


export const newProductGrid = async (page, element) => {

  const integrations = await loader.integrations;

  if (element.type === PebElementType.Grid
    && isIntegrationAction(element.data?.functionLink)
    && element.data?.functionLink?.method === 'getProductsForBuilder'
    && !element.children.length) {
    for (const screen of Object.values(PebScreen)) {
      const styles = page.stylesheets[screen][element.id];

      styles.gridTemplateRows = Array.from({ length: element.data.rowCount })
        .map(() => styles.height / element.data.rowCount);

      if (styles.display !== 'none') {
        const cellId = pebGenerateId();
        const imageId = pebGenerateId();
        const titleId = pebGenerateId();
        const priceId = pebGenerateId();

        const integration = integrations.find(i => i.tag === 'products');

        const imageFunctionLink = getShapeFunctionLink(integrations, integration, 'imagesUrl.0');
        const titleFunctionLink = getShapeFunctionLink(integrations, integration, 'title');
        const priceFunctionLink = getShapeFunctionLink(integrations, integration, 'priceAndCurrency');

        element.children.push({
          id: cellId,
          type: PebElementType.Shape,
          data: {},
          parent: { id: element.id, slot: 'host', type: PebElementType.Grid },
          index: 0,
          children: [
            {
              id: imageId,
              type: PebElementType.Shape,
              data: {
                functionLink: imageFunctionLink,
              },
              children: [],
              parent: { id: cellId, slot: 'host', type: PebElementType.Shape },
              index: 0,
            }, {
              id: titleId,
              type: PebElementType.Shape,
              data: {
                functionLink: titleFunctionLink,
                text: {
                  desktop: {
                    generic: {
                      ops: [
                        {
                          insert: 'title',
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
              index: 0,
            }, {
              id: priceId,
              type: PebElementType.Shape,
              data: {
                functionLink: priceFunctionLink,
                text: {
                  desktop: {
                    generic: {
                      ops: [
                        {
                          insert: 'price',
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
              index: 0,
            },
          ],
        });

        const cellHeight = styles.gridTemplateRows[0];
        const cellWidth = styles.gridTemplateColumns[0];

        const textHeight = 17;

        const gap = 8;

        page.stylesheets[screen] = {
          ...page.stylesheets[screen],
          ...{
            [cellId]: { backgroundColor: 'rgba(0,162,255,0)' },
            [imageId]: {
              height: cellHeight - (textHeight * 2) - (gap * 2) - (gap / 2),
              left: gap / 2,
              top: gap / 2,
              width: cellWidth - gap,
            },
            [titleId]: {
              height: textHeight,
              left: gap / 2,
              top: cellHeight - (textHeight * 2) - gap,
              width: cellWidth - gap,
            },
            [priceId]: {
              height: textHeight,
              left: gap / 2,
              top: cellHeight - textHeight - gap,
              width: cellWidth - gap,
            },
          },
        };
      }
    }
  }

  return element;
}
