import { PebThemeDetailInterface, PebThemePageInterface } from '../models/database';
import { PebElementDef } from '../models/element';
import { PebApplicationLink } from '../models/client';

import { pebForEachObjectWithChildrenDeep } from './element-utils';
import { PebInteractionType } from './interactions';

export function aggregatePageLinks(page: PebThemePageInterface): { [url: string]: PebApplicationLink } {
  const result = {};
  pebForEachObjectWithChildrenDeep(page.template, (el: PebElementDef) => {
    if (el.data?.linkInteraction?.type) {
      const type = el.data.linkInteraction.type.split(':');
      if (type[0] === PebInteractionType.NavigateApplicationLink) {
        const payload = el.data.linkInteraction.payload;
        if (payload.url && payload.application) {
          result[payload.url] = {
            url: payload.url,
            application: payload.application,
            type: type[1],
          };
        }
      }
    }
  });

  return result;
}
