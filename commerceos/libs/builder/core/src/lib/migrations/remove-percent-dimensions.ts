import { PebScreen } from '../constants';

import { PebMigration } from './migrations.interface';


export const removePercentDimensions: PebMigration = (page, element) => {
  Object.values(PebScreen).forEach((screen) => {
    const style = page.stylesheets[screen]?.[element.id];
    if (style?.width === '100%') {
      delete page.stylesheets[screen]?.[element.id].width;
    }
    if (style?.height === '100%') {
      delete page.stylesheets[screen]?.[element.id].height;
    }
  });

  return element;
};
