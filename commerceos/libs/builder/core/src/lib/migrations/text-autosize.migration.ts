import { PebScreen } from '../constants';
import { PebThemePageInterface } from '../models/database';
import { PebElementDef, PebElementType } from '../models/element';

import { PebMigration } from './migrations.interface';

export const textAutosize: PebMigration = (page: PebThemePageInterface, elementDef: PebElementDef) => {
  const screen =
    Object.values(PebScreen).find(s => page.stylesheets[s]?.[elementDef.id]?.display !== 'none') ?? PebScreen.Desktop;

  if (elementDef.type === PebElementType.Text
    && page.stylesheets[screen]?.[elementDef.id]?.minHeight !== undefined
    && !elementDef.data?.textAutosize) {
    elementDef.data.textAutosize = { height: true, width: true };
  }

  return elementDef;
}
