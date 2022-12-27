import { omit } from 'lodash';

import { PebAction, PebEffect, PebEffectTarget } from '../models/action';
import { PebContextSchema, PebStylesheet, PebTemplate, PebThemeStateInterface } from '../models/client';
import {
  PebThemeDetailInterface,
  PebThemeLanguageMapInterface,
  PebThemePageInterface,
  PebThemeShortPageInterface,
} from '../models/database';

import { pebContextSchemaEffectHandlers } from './effects/context-schema.effects';
import { pebPageEffectHandler } from './effects/page.effects';
import { pebShopEffectHandlers } from './effects/shop.effects';
import { handlerStateEffectHandlers } from './effects/state.effects';
import { pebStylesheetEffectHandlers } from './effects/stylesheet.effects';
import { pebLayoutEffectHandlers } from './effects/template.effects';

type THandler<T = any> = (target: T, ...args: any[]) => T;

export const effectHandlers: Dictionary<THandler> = {
  ...pebShopEffectHandlers,
  ...pebPageEffectHandler,
  ...pebLayoutEffectHandlers,
  ...pebStylesheetEffectHandlers,
  ...pebContextSchemaEffectHandlers,
  ...handlerStateEffectHandlers,
};

export type Dictionary<T> = {
  [key: string]: T;
};

export interface HandlerState {
  snapshot: PebThemeDetailInterface;
  templates: Dictionary<PebTemplate>;
  stylesheets: Dictionary<PebStylesheet>;
  contextSchemas: Dictionary<PebContextSchema>;
  pages: Dictionary<PebThemePageInterface>;
  languageMaps: Dictionary<PebThemeLanguageMapInterface>;
}

export const createInitialSnapshot = (): PebThemeDetailInterface => ({
  // TODO: is hash needed???
  id: null,
  hash: null,
  application: null,
  pages: [],
  updatedAt: null,
  languageMaps: [],
  lastAction: null,
  lastPublishedActionId: null,
});

export const getInitialHandlerState = (themeState: PebThemeStateInterface): HandlerState => {
  const initialHandlerState: HandlerState = {
    snapshot: themeState.snapshot,
    templates: {},
    stylesheets: {},
    contextSchemas: themeState.snapshot?.application?.contextId ?
      { [themeState.snapshot.application.contextId]: themeState.snapshot.application.context } : {},
    pages: themeState.pages,
    languageMaps: {},
  };
  for (const lang of themeState.snapshot?.languageMaps || []) {
    initialHandlerState.languageMaps[lang.locale] = lang;
  }
  for (const page of Object.values(themeState.pages)) {
    initialHandlerState.templates[page.templateId] = page.template;
    for (const [screen, stylesheetId] of Object.entries(page.stylesheetIds)) {
      initialHandlerState.stylesheets[stylesheetId] = page.stylesheets[screen];
    }
    initialHandlerState.contextSchemas[page.contextId] = page.context;
  }

  return initialHandlerState;
};

export const applyEffectOnState = (prevState: HandlerState, effect: PebEffect): HandlerState => {
  const [typeAreaName] = effect.type.split(':');
  const [areaName, areaId] = effect.target.split(':');
  const handler = effectHandlers[effect.type];
  if (!handler) {
    throw new Error('Invalid effect type');
  }

  // TODO: Check if Maps are deeply copied
  if (areaName === PebEffectTarget.Shop) {
    return {
      ...prevState,
      snapshot: handler(prevState.snapshot, effect.payload),
    };
  }

  // Full replacement of state object
  if (typeAreaName === 'state') {
    return handler(prevState, effect.payload);
  }

  if (areaName in prevState) {
    const handled = handler(prevState?.[areaName]?.[areaId], effect.payload);

    const newState = {
      ...prevState,
      [areaName]: handled ?
        { ...prevState[areaName], [areaId]: handled } :
        omit(prevState[areaName], areaId),
    };

    if (areaName === PebEffectTarget.Pages) {
      const snapshotPage = prevState.snapshot.pages.find(p => p.id === areaId);
      if (snapshotPage) {
        const handledSnapshotPage = handler(snapshotPage, effect.payload);
        newState.snapshot = {
          ...prevState.snapshot,
          pages: prevState.snapshot.pages.map(p => p.id === areaId ? handledSnapshotPage : p),
        };
      }
    }

    return newState;
  }
  throw new Error('Invalid effect target');
};

export const applyEffectsOnHandlerState = (effects: PebEffect[], currentState: HandlerState) => {
  return effects.reduce(
    applyEffectOnState,
    currentState,
  );
};

const extractStylesheetsFromHandlerState = (
  stylesheetIds: PebThemeShortPageInterface['stylesheetIds'],
  state: HandlerState,
): Dictionary<PebStylesheet> => {
  return Object.entries(stylesheetIds).reduce((
    accStylesheets: Dictionary<PebStylesheet>,
    [screen, stylesheetId],
  ) => {
    accStylesheets[screen] = state.stylesheets[stylesheetId];

    return accStylesheets;
  },
    {},
  );
};

export const extractPagesFromHandlerState = (state: HandlerState) => {
  const pagesDictionary: Dictionary<PebThemePageInterface> = {};
  for (const [pageId, page] of Object.entries(state.pages)) {
    if (
      page &&
      page.templateId &&
      page.contextId &&
      page.stylesheetIds &&
      Object.values(page.stylesheetIds).every(stylesheetId => !!stylesheetId)
    ) {
      pagesDictionary[pageId] = {
        ...page,
        templateId: page.templateId,
        template: state.templates[page.templateId],
        stylesheetIds: page.stylesheetIds,
        stylesheets: extractStylesheetsFromHandlerState(page.stylesheetIds, state),
        contextId: page.contextId,
        context: state.contextSchemas[page.contextId],
      };
    }
  }

  return pagesDictionary;
};

export const getSnapshotFromHandlerState = (
  stateWithAppliedEffects: HandlerState,
  pages: Dictionary<PebThemePageInterface>,
): PebThemeDetailInterface => {
  return {
    ...stateWithAppliedEffects.snapshot,
    application: {
      ...stateWithAppliedEffects.snapshot?.application,
      contextId: stateWithAppliedEffects.snapshot?.application?.contextId,
      context: stateWithAppliedEffects.contextSchemas?.[stateWithAppliedEffects.snapshot?.application?.contextId] ?? {},
    },
    pages: stateWithAppliedEffects.snapshot.pages
      .map(snapshotPage =>
      pages[snapshotPage.id] ? pages[snapshotPage.id] : snapshotPage,
    ),
    languageMaps: Object.values(stateWithAppliedEffects.languageMaps).filter(lang => Boolean(lang)),
  };
};

export const updateDictPagesAndSnapshotPagesLastActionId = (
  pagesDictionary: Dictionary<PebThemePageInterface>,
  snapshotPages: PebThemeShortPageInterface[],
  action: PebAction,
) => {
  for (const pageId of action.affectedPageIds) {
    const snapshotPage = snapshotPages?.find(p => p.id === pageId);
    const page = pagesDictionary[pageId];
    if (!page || !snapshotPage) {
      return;
    }

    page.lastActionId = action.id;
    snapshotPage.lastActionId = action.id;
    snapshotPage.data = page.data;
  }
};

export const updatePageHash = (page: PebThemePageInterface) => {
  const { id: pageId, hash: pageHash, ...inputPageAreas } = page;
  page.hash = hashObject(inputPageAreas);
};

export function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i = i + 1) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }

  return Math.abs(hash).toString(16).slice(-16).padStart(8, '0');
}

export function hashObject(obj: object) {
  return hashString(JSON.stringify(obj));
}
