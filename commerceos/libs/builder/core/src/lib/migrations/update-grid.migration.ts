
import { PebScreen } from '../constants';
import { PebThemePageInterface } from '../models/database';
import { PebElementDef, PebElementType } from '../models/element';

import { PebMigration } from './migrations.interface';


export const updateGrid: PebMigration = (page: PebThemePageInterface, elementDef: PebElementDef) => {
  removeGrid(page, elementDef);

  if (elementDef.type === PebElementType.Section) {
    setSectionHeight(page, elementDef);
  }

  return elementDef;
}

function removeGrid(page: PebThemePageInterface, elementDef: PebElementDef): void {
  Object.values(PebScreen).forEach((screen) => {
    recursive(elementDef, screen);
  });

  function recursive(element, screen) {
    const elementStyles = page.stylesheets[screen]?.[element.id];

    if (elementStyles && elementStyles.display !== 'none') {
      let left = elementStyles.left ?? 0;
      let top = elementStyles.top ?? 0;

      const parentStyles = page.stylesheets[screen][element.parent?.id];

      const gridTemplateColumns = typeof parentStyles?.gridTemplateColumns === 'string'
        ? (parentStyles?.gridTemplateColumns as any)?.split(' ') : parentStyles?.gridTemplateColumns;
      const gridTemplateRows = typeof parentStyles?.gridTemplateRows === 'string'
        ? (parentStyles?.gridTemplateRows as any)?.split(' ')
        : parentStyles?.gridTemplateRows;

      if (gridTemplateColumns && gridTemplateRows && elementStyles.gridColumn && elementStyles.gridRow) {
        let columnIndex = Number(elementStyles.gridColumn.split(' / ')[0]) - 1;
        if (elementStyles.gridArea) { columnIndex = Number(elementStyles.gridArea.split(' / ')[1]) - 1; }

        gridTemplateColumns.forEach((columnWidth, i) => left = i < columnIndex ? left + Number(columnWidth) : left);

        let rowIndex = Number(elementStyles.gridRow.split(' / ')[0]) - 1;
        if (elementStyles.gridArea) { rowIndex = Number(elementStyles.gridArea.split(' / ')[0]) - 1; }

        gridTemplateRows.forEach((rowHeight, i) => top = i < rowIndex ? top + Number(rowHeight) : top);

        if (element.type !== PebElementType.Section && element.type !== PebElementType.Document) {
          elementStyles.left = left + (elementStyles.marginLeft ?? 0);
          elementStyles.top = top + (elementStyles.marginTop ?? 0);
        }
      } else {
        if (element.type !== PebElementType.Section && element.type !== PebElementType.Document) {
          elementStyles.left = left + (elementStyles.marginLeft ?? 0);
          elementStyles.top = top + (elementStyles.marginTop ?? 0);
        }
      }
    }
  }
}

function setSectionHeight(page: PebThemePageInterface, elementDef: PebElementDef): void {
  Object.values(PebScreen).forEach((screen) => {
    const elementStyle = page.stylesheets[screen]?.[elementDef.id];

    if (elementStyle && elementStyle.display !== 'none') {
      const max = [elementStyle.height];

      const rows = (elementStyle.gridTemplateRows as any)?.split(' ').map(row => Number(row)).reduce((a, b) => a + b);

      if (rows) { max.push(rows); }

      const maxHeights = elementDef.children.reduce((acc, child) => {
        const childStyle = page.stylesheets[screen]?.[child.id];

        if (childStyle?.top !== undefined && childStyle?.height !== undefined) {
          acc.push(Number(childStyle.top) + Number(childStyle.height));
        }

        return acc;
      }, []);

      if (maxHeights.length) { max.push(...maxHeights); }

      elementStyle.height = Math.max(...max);
    }

  });
}
