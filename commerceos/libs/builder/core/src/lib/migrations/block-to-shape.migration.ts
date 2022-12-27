import { PebElementType } from '../models/element';

import { PebMigration } from './migrations.interface';


export const blockToShape: PebMigration = (page, element) => {
  if (element.type as string === 'block') {
    element.type = PebElementType.Shape;
  }

  return element;
};
