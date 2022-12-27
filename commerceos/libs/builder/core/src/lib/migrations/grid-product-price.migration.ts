import { PebIntegrationActionTag, PebIntegrationTag } from '../models/api';
import { PebThemePageInterface } from '../models/database';
import { isIntegrationAction, PebElementDef, PebElementType } from '../models/element';

import { PebMigration } from './migrations.interface';

export const gridProductPrice: PebMigration = (page: PebThemePageInterface, elementDef: PebElementDef) => {
  const functionLink = elementDef.data?.functionLink;
  const meta = page.context?.[elementDef.id]?.params?.[1]?.meta;
  if (
    elementDef.type === PebElementType.Grid &&
    functionLink?.integration?.tag === PebIntegrationTag.Products &&
    isIntegrationAction(functionLink) &&
    functionLink?.tags?.includes(PebIntegrationActionTag.GetList) &&
    meta && !meta.price
  ) {
    meta.price = {
      type: 'number',
      subtype: 'value',
    };
  }

  return elementDef;
};
