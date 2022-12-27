import { PebScreen } from '../constants';
import {
  HandlerStateEffect,
  PebContextSchemaEffect,
  PebEffectTarget,
  PebPageEffect,
  PebShopEffect,
} from '../models/action';
import { PebLanguage, PebPageVariant } from '../models/client';
import {
  applyEffectOnState,
  applyEffectsOnHandlerState,
  createInitialSnapshot,
  extractPagesFromHandlerState,
  getInitialHandlerState,
  getSnapshotFromHandlerState,
  updateDictPagesAndSnapshotPagesLastActionId,
  updatePageHash,
} from './compiler.helpers';

describe('Compiler:Helpers', () => {

  it('should create initial snapshot', () => {

    expect(createInitialSnapshot()).toEqual({
      id: null,
      hash: null,
      application: null,
      pages: [],
      updatedAt: null,
      languageMaps: [],
      lastAction: null,
      lastPublishedActionId: null,
    });

  });

  it('should get initial handler state', () => {

    const themeState = {
      snapshot: null,
      pages: {
        'p-001': {
          id: 'p-001',
          templateId: 'tpl-001',
          template: { id: 'tpl-001' },
          contextId: 'ctx-001',
          context: { id: 'ctx-001' },
          stylesheetIds: Object.values(PebScreen).reduce((acc, screen) => {
            acc[screen] = `${screen.charAt(0)}-001`;
            return acc;
          }, {}),
          stylesheets: Object.values(PebScreen).reduce((acc, screen) => {
            acc[screen] = { color: '#333333' };
            return acc;
          }, {}),
        },
      },
    };

    /**
     * themeState.snapshot is null
     */
    expect(getInitialHandlerState(themeState as any)).toEqual({
      snapshot: null,
      templates: {
        [themeState.pages['p-001'].templateId]: themeState.pages['p-001'].template,
      },
      stylesheets: Object.values(PebScreen).reduce((acc, screen) => {
        acc[`${screen.charAt(0)}-001`] = themeState.pages['p-001'].stylesheets[screen];
        return acc;
      }, {}),
      contextSchemas: {
        [themeState.pages['p-001'].contextId]: themeState.pages['p-001'].context,
      },
      pages: themeState.pages,
      languageMaps: {},
    } as any);

    /**
     * theme.snapshot.application is null
     * theme.snapshot.languageMaps is set
     */
    themeState.snapshot = {
      application: null,
      languageMaps: [
        { locale: PebLanguage.English },
        { locale: PebLanguage.German },
      ],
    };

    const state = getInitialHandlerState(themeState as any);
    expect(state.snapshot).toEqual(themeState.snapshot);
    expect(state.contextSchemas).toEqual({
      [themeState.pages['p-001'].contextId]: themeState.pages['p-001'].context,
    });
    expect(state.languageMaps).toEqual(themeState.snapshot.languageMaps.reduce((acc, lang) => {
      acc[lang.locale] = lang;
      return acc;
    }, {}));

    /**
     * theme.snapshot.application is set
     */
    themeState.snapshot.application = {
      contextId: 'ctx-app-001',
      context: { id: 'ctx-app-001' },
    };

    expect(getInitialHandlerState(themeState as any).contextSchemas).toEqual({
      [themeState.snapshot.application.contextId]: themeState.snapshot.application.context,
      [themeState.pages['p-001'].contextId]: themeState.pages['p-001'].context,
    });

  });

  it('should apply effect on state', () => {

    const effectMock = {
      type: '',
      target: '',
      payload: null,
    };
    const prevStateMock = {
      snapshot: {
        application: {
          data: { id: 'app-001' },
        },
        pages: [
          { id: 'p-001' },
          { id: 'p-002' },
        ],
      },
      pages: {
        'p-001': { id: 'p-001' },
        'p-002': { id: 'p-002' },
      },
      contextSchemas: {
        'ctxS-001': {
          'ctx-001': { id: 'ctx-001' },
        },
      },
    };

    /**
     * argument prevState is null
     * effect.type & target are null
     */
    expect(() => {
      applyEffectOnState(prevStateMock as any, effectMock as any);
    }).toThrowError('Invalid effect type');

    /**
     * effect.type is PebShopEffect.UpdateData
     * effect.target is 'test'
     */
    effectMock.type = PebShopEffect.UpdateData;
    effectMock.target = 'test';

    expect(() => {
      applyEffectOnState(prevStateMock as any, effectMock as any);
    }).toThrowError('Invalid effect target');

    /**
     * effect.target is PebEffectTarget.Shop
     */
    effectMock.target = `${PebEffectTarget.Shop}:${prevStateMock.snapshot.application.data.id}`;
    effectMock.payload = { test: 'shop.effect.payload' };

    expect(applyEffectOnState(prevStateMock as any, effectMock as any).snapshot.application.data).toEqual({
      ...prevStateMock.snapshot.application.data,
      ...effectMock.payload,
    });

    /**
     * effect.type is HandlerStateEffect.ReorderPages
     * effect.target is ''
     */
    effectMock.type = HandlerStateEffect.ReorderPages;
    effectMock.target = '';
    effectMock.payload = prevStateMock.snapshot.pages.map(p => p.id).reverse();

    expect(applyEffectOnState(prevStateMock as any, effectMock as any).snapshot.pages)
      .toEqual(prevStateMock.snapshot.pages.reverse() as any);

    /**
     * effect.type is PebContextSchemaEffect.Delete
     * effect.target is `${PebEffectTarget.ContextSchemas}:ctxS-001`
     */
    effectMock.type = PebContextSchemaEffect.Delete;
    effectMock.target = `${PebEffectTarget.ContextSchemas}:ctxS-001`;
    effectMock.payload = 'ctx-001';

    expect(applyEffectOnState(prevStateMock as any, effectMock as any).contextSchemas).toEqual({
      'ctxS-001': {},
    });

    /**
     * effect.type is PebContextSchemaEffect.Destroy
     */
    effectMock.type = PebContextSchemaEffect.Destroy;

    expect(applyEffectOnState(prevStateMock as any, effectMock as any).contextSchemas).toEqual({});

    /**
     * effect.type is PebContextSchemaEffect.Delete
     * effect.target is `${PebEffectTarget.Pages}:p-003`
     * page does NOT exist in prevState.snapshot.pages
     */
    effectMock.type = PebPageEffect.Update;
    effectMock.target = `${PebEffectTarget.Pages}:p-003`;
    effectMock.payload = { name: 'New Page' };

    expect(applyEffectOnState(prevStateMock as any, effectMock as any).pages).toEqual({
      ...prevStateMock.pages,
      'p-003': {
        name: effectMock.payload.name,
        variant: undefined,
        master: {},
        data: {},
        skip: undefined,
        parentId: undefined,
      },
    } as any);

    /**
     * page does exists in prevState.snapshot.pages
     */
    effectMock.target = effectMock.target.replace('p-003', 'p-001');
    effectMock.payload = {
      ...effectMock.payload,
      variant: PebPageVariant.Category,
    };

    expect(applyEffectOnState(prevStateMock as any, effectMock as any).pages['p-001']).toEqual({
      id: 'p-001',
      name: effectMock.payload.name,
      variant: effectMock.payload.variant,
      master: {},
      data: {},
      skip: undefined,
      parentId: undefined,
    } as any);

  });

  it('should apply effects on handler state', () => {

    const effectsMock = {
      reduce: jasmine.createSpy('reduce'),
    };
    const currentState: any = {
      pages: {
        'p-001': { id: 'p-001' },
      },
    };

    applyEffectsOnHandlerState(effectsMock as any, currentState);

    expect(effectsMock.reduce).toHaveBeenCalledWith(applyEffectOnState, currentState);

  });

  it('should extract pages from handler state', () => {

    const pages = {
      'p-001': null,
      'p-002': {
        id: 'p-002',
        templateId: 'tpl-002',
        contextId: 'ctx-002',
        stylesheetIds: Object.values(PebScreen).reduce((acc, screen) => {
          acc[screen] = screen === PebScreen.Desktop ? `${screen.charAt(0)}-002` : null;
          return acc;
        }, {}),
      },
      'p-003': {
        id: 'p-003',
        templateId: 'tpl-003',
        contextId: 'ctx-003',
        stylesheetIds: Object.values(PebScreen).reduce((acc, screen) => {
          acc[screen] = `${screen.charAt(0)}-003`;
          return acc;
        }, {}),
      },
    };
    const stateMock = {
      pages,
      templates: {
        'tpl-003': { id: 'tpl-003' },
      },
      stylesheets: {
        'd-002': { color: '#cccccc' },
        'd-003': { color: '#333333' },
        't-003': { color: '#222222' },
        'm-003': { color: '#111111' },
      },
      contextSchemas: {
        'ctx-003': { id: 'ctx-003' },
      },
    };

    expect(extractPagesFromHandlerState(stateMock as any)).toEqual({
      'p-003': {
        ...pages['p-003'],
        template: stateMock.templates['tpl-003'],
        stylesheets: {
          [PebScreen.Desktop]: { color: '#333333' },
          [PebScreen.Tablet]: { color: '#222222' },
          [PebScreen.Mobile]: { color: '#111111' },
        },
        context: stateMock.contextSchemas['ctx-003'],
      },
    } as any);

  });

  it('should get snapshot from handler state', () => {

    const stateMock = {
      snapshot: {
        application: null,
        pages: [
          { id: 'p-001', name: 'Page 1' },
          { id: 'p-002', name: 'Page 2' },
        ],
      },
      contextSchemas: null,
      languageMaps: {
        [PebLanguage.English]: null,
        [PebLanguage.German]: { locale: PebLanguage.German },
      },
    };
    const pagesMock = {
      'p-002': { id: 'p-002', name: 'Page 2 - Copy' },
    };

    /**
     * state.snapshot.application is null
     * state.contextSchemas is null
     */
    expect(getSnapshotFromHandlerState(stateMock as any, pagesMock as any)).toEqual({
      ...stateMock.snapshot,
      application: {
        contextId: undefined,
        context: {},
      },
      pages: [
        stateMock.snapshot.pages[0],
        pagesMock['p-002'],
      ],
      languageMaps: Object.values(stateMock.languageMaps).filter(Boolean),
    } as any);

    /**
     * state.contextSchemas is set
     */
    stateMock.contextSchemas = {
      'ctx-001': { id: 'ctx-001' },
    };

    expect(getSnapshotFromHandlerState(stateMock as any, pagesMock as any).application.context).toEqual({});

    /**
     * state.snapshot.application.contextId is set
     */
    stateMock.snapshot.application = {
      id: 'app-001',
      contextId: 'ctx-001',
    };

    expect(getSnapshotFromHandlerState(stateMock as any, pagesMock as any).application).toEqual({
      ...stateMock.snapshot.application,
      context: stateMock.contextSchemas[stateMock.snapshot.application.contextId],
    } as any);

  });

  it('should update last action id in dict pages and snapshot pages', () => {

    const pagesDictionary = {
      'p-001': {
        id: 'p-001',
        data: { test: 'data for p-001' },
        lastActionId: null,
      },
    };
    const snapshotPages = [{
      id: 'p-001',
      data: null,
      lastActionId: null,
    }];
    const actionMock: any = {
      id: 'a-001',
      affectedPageIds: ['p-001'],
    };

    /**
     * argument snapshotPages is null
     */
    updateDictPagesAndSnapshotPagesLastActionId(pagesDictionary as any, null, actionMock);

    expect(pagesDictionary['p-001'].lastActionId).toBeNull();
    expect(snapshotPages[0].lastActionId).toBeNull();

    /**
     * argument snapshotPages is set
     */
    updateDictPagesAndSnapshotPagesLastActionId(pagesDictionary as any, snapshotPages as any[], actionMock);

    expect(pagesDictionary['p-001'].lastActionId).toEqual(actionMock.id);
    expect(snapshotPages).toEqual([{
      id: 'p-001',
      data: { test: 'data for p-001' },
      lastActionId: actionMock.id,
    }]);

  });

  it('should update page hash', () => {

    const pageMock = {
      id: 'p-001',
      hash: 'test',
      name: 'Page 1',
    };

    updatePageHash(pageMock as any);

    expect(pageMock.hash).toEqual('79bb80ed');

  });

});
