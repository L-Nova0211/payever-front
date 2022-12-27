import { PebScreen } from '../constants';
import { PebElementType } from '../models/element';

import { PebMigration } from './migrations.interface';

export const gridTemplatesToNumberArray: PebMigration = (page, element) => {
  if (element.type === PebElementType.Grid) {
    Object.values(PebScreen).forEach(screen => {
      const style = page.stylesheets[screen][element.id];
      if (!!style && style.display !== 'none') {
        const { colCount = 1, rowCount = 1 } = element.data;
        const { width, height } = style;
        const gridTemplateColumns = style.gridTemplateColumns
          ? typeof style.gridTemplateColumns === 'string'
            ? parseGridTemplate(style.gridTemplateColumns as any as string, style.width)
            : style.gridTemplateColumns
          : Array.from({ length: colCount }, () => width / colCount);

        const gridTemplateRows = style.gridTemplateRows
          ? typeof style.gridTemplateRows === 'string'
            ? parseGridTemplate(style.gridTemplateRows as any as string, style.height)
            : style.gridTemplateRows
          : Array.from({ length: rowCount }, () => height / rowCount);

        page.stylesheets[screen][element.id] = {
          ...style,
          gridTemplateColumns,
          gridTemplateRows,
        }
      }
    });
  }

  return element;
}

export const parseGridTemplate = (template: string, total: number) => {
  const items = template.split(' ').map(v => parseFloat(v))
  items.splice(-1, 1);

  return items.concat(total - items.reduce((acc, v) => acc + v, 0));
}
