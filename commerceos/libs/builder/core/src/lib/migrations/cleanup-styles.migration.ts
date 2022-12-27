import { PebScreen } from '../constants';
import { PebElementDef } from '../models/element';

import { PebMigration } from './migrations.interface';

export const cleanUpStyles: PebMigration = (page, element) => {
  // Document
  if (element.type === 'document') {
    const duplicate = new Set();
    const getId = (elm: PebElementDef, acc = new Set()) => {
      if (elm) {
        if (acc.has(elm.id)) {
          duplicate.add(elm.id);
        }
        acc.add(elm.id);
        elm.children.forEach(e => getId(e, acc));
      }

      return acc;
    };
    const ids = getId(element);

    Object.values(PebScreen).forEach(screen => {
      // Document should always have styles and at least background color
      page.stylesheets[screen][element.id] = {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        ...page.stylesheets[screen][element.id],
      };

      Object.keys(page.stylesheets[screen]).forEach((id) => {
        if (!ids.has(id)) {
          delete page.stylesheets[screen][id];
        }
      })
    });

    Object.entries(page.context).forEach(([id, v]) => {
      if (v === null || Object.keys(v).length === 0) {
        delete page.context[id];
      }
    });
  }

  delete (element as any).styles;
  delete element.data?.variant;
  delete element.data?.elementType;

  if (element.motion === null) {
    delete element.motion;
  }

  Object.values(PebScreen).forEach(screen => {
    const styles = page.stylesheets[screen][element.id];
    if (styles) {
      // remove legacy styles
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        content,
        gridArea,
        gridColumn,
        gridRow,
        margin,
        marginBottom,
        marginLeft,
        marginRight,
        marginTop,
        position,
        transform,
        zIndex,
        ...cleanStyles
      } = page.stylesheets[screen][element.id];
      /* eslint-enable */

      if (element.parent?.type === 'grid') {
        delete cleanStyles.left;
        delete cleanStyles.top;
      }

      if (element.type !== 'grid') {
        delete cleanStyles.gridTemplateColumns;
        delete cleanStyles.gridTemplateRows;
      }

      if (cleanStyles.backgroundImage === '') {
        delete cleanStyles.backgroundImage;
        delete cleanStyles.backgroundSize;
        delete cleanStyles.backgroundPosition;
        delete cleanStyles.backgroundRepeat;
      }

      if ((cleanStyles as any).constrainProportions === null) {
        delete (cleanStyles as any).constrainProportions;
        delete (cleanStyles as any).proportionRatio;
      }

      if (cleanStyles.backgroundColor === '') {
        delete cleanStyles.backgroundColor;
      }

      if (cleanStyles.display && cleanStyles.display !== 'none') {
        delete cleanStyles.display;
      }

      if (cleanStyles.top === null) {
        delete cleanStyles.top;
      }

      page.stylesheets[screen][element.id] = { ...cleanStyles }
    }
  });

  return element;
}
