import { PebScreen } from '../constants';
import { PebLanguage } from '../models/client';
import { PebElementType } from '../models/element';
import { PebInteractionType } from '../utils/interactions';

import { PebMigration } from './migrations.interface';

export const elementLinkToObject: PebMigration = (page, element) => {
  if ([PebElementType.Shape, PebElementType.Text].includes(element.type)) {
    const { linkInteraction } = element.data || {};
    if (linkInteraction
      && ![PebInteractionType.NavigateEmail, 'none'].includes(linkInteraction?.type)) {
      if (linkInteraction.payload && (linkInteraction.payload?.id || typeof linkInteraction.payload === 'string')) {
        linkInteraction.payload = {
          url: linkInteraction.payload.id || linkInteraction.payload,
        };
      }
    }

    if (element.type === PebElementType.Text
      && element.data?.text
    ) {
      Object.values(PebScreen).forEach((screen) => {
        Object.values(PebLanguage).forEach((language) => {
          const text = element.data?.text[screen]?.[language];
          if (text) {
            text.ops.forEach(op => {
              const link = op.attributes?.link;
              if (link && ![PebInteractionType.NavigateEmail, 'none'].includes(link.type)
                && typeof (link.payload === 'string' || link.payload.url)
              ) {
                const url = typeof op.attributes.link.payload === 'string'
                  ? op.attributes.link.payload
                  : op.attributes.link.payload.id || op.attributes.link.payload.url;
                op.attributes = {
                  ...op.attributes,
                  link: {
                    ...op.attributes.link,
                    payload: {
                      url,
                    },
                  },
                };
              }
            });
          }
        });
      });
    }
  }

  return element;
};
