import Delta from 'quill-delta';

import { PebScreen,PEB_DEFAULT_LINK_COLOR } from '../constants';
import { PebLanguage } from '../models/client';
import { PebElementType } from '../models/element';

import { PebMigration } from './migrations.interface';


export const linkColorReset: PebMigration = (page, element) => {
  if (element.type === PebElementType.Text) {
    Object.values(PebLanguage).forEach((language) => {
      Object.values(PebScreen).forEach((screen) => {
        const deltaObj = element.data.text?.[screen]?.[language];

        if (deltaObj) {
          const delta = new Delta(deltaObj);
          let index = 0;
          delta.ops.forEach((op) => {
            if (op.attributes && 'link' in op.attributes) {
              if (op.attributes.color === PEB_DEFAULT_LINK_COLOR) {

                const before = (delta as Delta).slice(0, index);
                const currentColor = before.reduce((acc, op) => {
                  if (op.attributes?.color && op.attributes.color !== PEB_DEFAULT_LINK_COLOR) {
                    return op.attributes.color;
                  }

                  return acc;
                }, undefined);

                op.attributes = {
                  ...op.attributes,
                  color: currentColor,
                };
              }
            }
            index += op.insert.toString().length;
          });
        }
      });
    });
  }

  return element;
};
