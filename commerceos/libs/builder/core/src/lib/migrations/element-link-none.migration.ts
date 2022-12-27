import { PebElementType } from '../models/element';

import { PebMigration } from './migrations.interface';

export const elementLinkNoneToObject: PebMigration = (page, element) => {
  if (
    [PebElementType.Shape, PebElementType.Text].includes(element.type)
    && element.data?.linkInteraction?.type as any === 'none'
  ) {
    delete element.data.linkInteraction;
  }

  return element;
};
