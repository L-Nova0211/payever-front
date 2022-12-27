import { PebThemePageInterface } from '../models/database';
import { PebElementDef } from '../models/element';

export type PebMigration =
  (page: PebThemePageInterface, element: PebElementDef) => PebElementDef | Promise<PebElementDef>;
