import { PebScreen } from '../constants';
import { PebIntegrationActionTag } from '../models/api';
import { PebElementType } from '../models/element';
import { pebGenerateId } from '../utils';

import { PebMigration } from './migrations.interface';


export const updateFilterSort: PebMigration = (page, element) => {
  const grids = element.children.filter(elm => elm.type === PebElementType.Grid
    && (elm.data?.functionLink as any)?.tags.includes(PebIntegrationActionTag.GetFilters));

  grids.forEach((grid) => {
    const colCount = grid.data.colCount;
    const rowCount = grid.data.rowCount;

    const shapes = [];

    if (!(grid.data?.functionLink as any)?.actionData && (colCount * rowCount > 1)) {
      shapes.push(getShape(element, getFilterPriceFunctionLink(grid.data.functionLink)));
      shapes.push(getShape(element, getFilterTypeFunctionLink(grid.data.functionLink)));
    } else {
      shapes.push(getShape(element, grid.data.functionLink));
    }

    const children = element.children.filter(elm => elm.id !== grid.id);

    element.children = [ ...children, ...shapes];

    Object.values(PebScreen).forEach(screen => {
      const gridStyle = page.stylesheets[screen][grid.id];

      if (gridStyle.display !== 'none') {
        shapes.forEach((shape, index) => {
          const shapeStyle = {
            left: gridStyle.left,
            top: gridStyle.top,
            height: gridStyle.height,
            width: gridStyle.width,
          };

          if (colCount > rowCount) {
            shapeStyle.left += (index > 0 ? gridStyle.gridTemplateColumns[index - 1] : 0);
            shapeStyle.height = gridStyle.gridTemplateRows[0];
            shapeStyle.width = gridStyle.gridTemplateColumns[index];
          } else {
            shapeStyle.top += (index > 0 ? gridStyle.gridTemplateRows[index - 1] : 0);
            shapeStyle.height = gridStyle.gridTemplateRows[index];
            shapeStyle.width = gridStyle.gridTemplateColumns[0];
          }

          page.context[shape.id] = { ...page.context[grid.id] };
          page.stylesheets[screen][shape.id] = {
            ...shapeStyle,
            backgroundColor: 'rgba(0,162,255,0)',
          };
        })
      }

      delete page.stylesheets[screen][grid.id];
    });
  });

  return element;
}

const getShape = (parent, functionLink) => {
  const shape = {
    id: pebGenerateId(),
    type: PebElementType.Shape,
    data: {
      functionLink: functionLink,
      text: {
        desktop: {
          generic: {
            ops: [
              {
                attributes: {
                  fontSize: 13,
                },
                insert: '',
              },
            ],
          },
        },
      },
    },
    children: [],
    parent: {
      id: parent.id,
      slot: 'host',
      type: parent.type,
    },
    index: parent.children.length,
  } as any;

  return shape;
}

const getFilterPriceFunctionLink = (functionLink) => {
  return {
    ...functionLink,
    actionData: {
      field: 'price',
      title: 'renderer.grid-filter.price',
      type: 'sort-select',
      options: [
        {
          label: 'renderer.grid-filter.price_asc',
          value: 'asc',
          field: 'price',
        },
        {
          label: 'renderer.grid-filter.price_desc',
          value: 'desc',
          field: 'price',
        },
      ],
    },
  }
}

const getFilterTypeFunctionLink = (functionLink) => {
  return {
    ...functionLink,
    actionData: {
      field: 'type',
      title: 'renderer.grid-filter.type',
      type: 'select',
      options: [
        {
          label: 'renderer.grid-filter.physical',
          value: 'physical',
          field: null,
        },
        {
          label: 'renderer.grid-filter.digital',
          value: 'digital',
          field: null,
        },
        {
          label: 'renderer.grid-filter.service',
          value: 'service',
          field: null,
        },
      ],
    },
  }
}
