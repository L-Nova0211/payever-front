import { PebMigration } from './migrations.interface';

export const removeLegacyElements: PebMigration = (page, element) => {
  return element;
}
