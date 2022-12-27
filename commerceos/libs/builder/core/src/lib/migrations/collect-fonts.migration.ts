import Delta from 'quill-delta';

import { PebScreen } from '../constants';
import { pebFontFamilies } from '../fonts';
import { PebLanguage } from '../models/client';
import { PebThemePageInterface } from '../models/database';
import { PebElementDef } from '../models/element';

import { PebMigration } from './migrations.interface';


export const collectFonts: PebMigration = (page: PebThemePageInterface, elementDef: PebElementDef): PebElementDef => {
  const text = elementDef.data?.text;

  if (text) {
    Object.values(PebScreen).forEach((screen) => {
      if (text[screen]) {
        Object.values(PebLanguage).forEach((language) => {
          if (text[screen][language]) {
            const delta = new Delta(text[screen][language]);
            const fonts = [];

            delta.eachLine((line: Delta) => {
              line.ops.forEach((op) => {
                const family = op.attributes?.fontFamily ?? 'Roboto';
                const weight = `${op.attributes?.fontWeight ?? 400}${op.attributes?.italic ? 'i' : ''}`;
                const index = fonts.findIndex(f => f.name === family);
                if (index === -1) {
                  if (validateFont(family)) {
                    fonts.push({ name: family, weights: [weight] });
                  }
                } else {
                  if (!fonts[index].weights.includes(weight)) {
                    fonts[index].weights.push(weight);
                  }
                }
              });
            });

            if (!page.data) {
              page.data = {};
            }

            if (!page.data.fonts) {
              page.data.fonts = {};
            }

            if (!page.data?.fonts?.[screen]) {
              page.data.fonts[screen] = {};
            } else {
              if (!page.data?.fonts[screen]?.[language]) {
                page.data.fonts[screen][language] = [];
              }
            }

            if (page.data?.fonts?.[screen]?.[language]?.length) {
              fonts.forEach((font) => {
                const index = page.data?.fonts?.[screen][language].findIndex(f => f.name === font.name);

                if (index === -1) {
                  page.data.fonts[screen][language].push(font);
                } else {
                  page.data.fonts[screen][language][index].weights = [
                    ...new Set([
                      ...font.weights,
                      ...page.data?.fonts[screen][language][index].weights.map(weight => weight.toString()),
                    ]),
                  ];

                  delete page.data.fonts[screen][language][index].italic;
                }
              });
            } else {
              page.data.fonts[screen][language] = fonts;
            }
          }
        });
      }
    });

    return elementDef;

    function validateFont(familyName: string) {
      return pebFontFamilies.some(family => family.name.toLowerCase() === familyName.toLowerCase());
    }
  }

  Object.values(PebScreen).forEach((screen) => {
    Object.values(PebLanguage).forEach((language) => {
      if (page.data?.fonts?.[screen]?.[language]) {
        page.data.fonts[screen][language].forEach((font) => {
          font.weights.forEach(weight => weight.toString());

          delete font.italic;
        });
      }
    });
  });

  return elementDef;
};
