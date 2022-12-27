import { PebScreen } from '../constants';
import { PebIntegrationActionTag } from '../models/api';
import { PebLanguage } from '../models/client';
import { isIntegrationAction, PebElementType } from '../models/element';

import { PebMigration } from './migrations.interface';

export const gridAlignText: PebMigration = (page, element) => {
  if (element.type === PebElementType.Grid
    && isIntegrationAction(element.data?.functionLink)
    && element.data.functionLink.tags.includes(PebIntegrationActionTag.GetCategoriesByProducts)
  ) {
    if (element.data.text) {
      Object.values(PebScreen).forEach((screen) => {
        Object.values(PebLanguage).forEach((language) => {
          element.data.text[screen]?.[language]?.ops.forEach((op) => {
            if (op.attributes?.textJustify) {
              op.attributes = {
                ...op.attributes,
                ...(op.attributes.textJustify && { align: op.attributes.textJustify }),
              };

              delete op.attributes.textJustify;
            }
          });
        });
      });
    }
  }

  return element;
};
