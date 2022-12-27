import { PebThemePageInterface } from '../models/database';
import { PebElementDef } from '../models/element';

import { PebMigration } from './migrations.interface';


export const fixParent: PebMigration = (page: PebThemePageInterface, elementDef: PebElementDef) => {
  recursive(page.template);

  function recursive(element) {
    element?.children?.forEach((child) => {
      if (child?.parent) {
        child.parent.id = element.id;
        child.parent.type = element.type;
      } else if (child) {
        child.parent = {
          id: element.id,
          type: element.type,
        }
      }

      recursive(child);
    });
  }

  return elementDef;
};
