import Delta from 'quill-delta';

import { PebScreen } from '../constants';
import { PebLanguage } from '../models/client';
import { PebThemePageInterface } from '../models/database';
import { PebElementDef, PebElementType } from '../models/element';

import { PebMigration } from './migrations.interface';

export const removeBold: PebMigration = (page: PebThemePageInterface, elm: PebElementDef) => {
  if ([PebElementType.Text, PebElementType.Shape].includes(elm.type)) {
    Object.values(PebScreen).forEach((screen) => {
      Object.values(PebLanguage).forEach((language) => {
        if (!elm.data?.text?.[screen]?.[language]) {
          if (elm.data?.text?.[language]) {
            elm.data = {
              ...elm.data,
              text: {
                ...elm.data.text,
                [PebScreen.Desktop]: { [language]: cleanUpBoldAttribute(new Delta(elm.data.text[language])) },
              },
            };
          }
        } else {
          elm.data = {
            ...elm.data,
            text: {
              ...elm.data.text,
              [screen]: {
                ...elm.data.text?.[screen],
                [language]: cleanUpBoldAttribute(new Delta(elm.data.text[screen][language])),
              },
            },
          };
        }

        delete elm.data?.text?.[language];
      });

      delete page.stylesheets[screen]?.[elm.id]?.content;
    });
  }

  return elm;
}

export function cleanUpBoldAttribute(delta: Delta): Delta {
  const ops = delta.ops.map((op) => {
    if (op.attributes?.bold !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { bold, ...attributes } = op.attributes;
      op = { ...op, attributes }
    }

    return op;
  });

  return new Delta({ ops });
}
