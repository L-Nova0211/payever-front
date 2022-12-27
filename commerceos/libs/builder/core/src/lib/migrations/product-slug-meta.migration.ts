import { PebThemePageInterface } from '../models/database';
import { PebElementDef } from '../models/element';

import { PebMigration } from './migrations.interface';

export const productSlugMetaMigration: PebMigration = (page: PebThemePageInterface, element: PebElementDef) => {
  const elementContext = page.context?.[element.id];
  if (
    elementContext?.method === 'fetchActionWithAdditional' &&
    elementContext.params?.length &&
    elementContext.params?.[1].method === 'getProductsForBuilder' &&
    elementContext.params[1].meta
  ) {
    elementContext.params[1].meta.slug = { type: 'string', subtype: 'value' };
  }

  return element;
};
