import { PebEffectTarget, PebPageEffect } from '../models/action';
import { PebLanguage } from '../models/client';
import { pebActionHandler, pebCompileActions } from './compiler';
import * as helpers from './compiler.helpers';

describe('Compiler:Action Handler', () => {

  beforeAll(() => {

    Object.defineProperties(helpers, {
      createInitialSnapshot: {
        value: helpers.createInitialSnapshot,
        writable: true,
      },
      getInitialHandlerState: {
        value: helpers.getInitialHandlerState,
        writable: true,
      },
      applyEffectsOnHandlerState: {
        value: helpers.applyEffectsOnHandlerState,
        writable: true,
      },
      extractPagesFromHandlerState: {
        value: helpers.extractPagesFromHandlerState,
        writable: true,
      },
      getSnapshotFromHandlerState: {
        value: helpers.getSnapshotFromHandlerState,
        writable: true,
      },
      updateDictPagesAndSnapshotPagesLastActionId: {
        value: helpers.updateDictPagesAndSnapshotPagesLastActionId,
        writable: true,
      },
      updatePageHash: {
        value: helpers.updatePageHash,
        writable: true,
      },
      hashObject: {
        value: helpers.hashObject,
        writable: true,
      },
    });

  });

  it('should handle action', () => {

    const currentState = { test: 'current.state' };
    const action = {
      id: 'a-001',
      effects: [{
        type: PebPageEffect.Update,
        target: `${PebEffectTarget.Pages}:p-001`,
        payload: { name: 'Page 1' },
      }],
    };
    const initialHandlerState = {
      snapshot: {
        application: {
          id: 'app-001',
          contextId: 'ctx-001',
        },
      },
      templates: {
        'tpl-001': { id: 'tpl-001' },
      },
      stylesheets: {
        'd-001': { color: '#333333' },
      },
      contextSchemas: {
        'ctxS-001': {
          'ctx-001': { id: 'ctx-001' },
        },
      },
      pages: {
        'p-001': { id: 'p-001', hash: btoa('Page 1') },
        'p-002': { id: 'p-002', hash: btoa('Page 2') },
      },
      languageMaps: {
        [PebLanguage.English]: { locale: PebLanguage.English },
      },
    };
    const snapshot = {
      id: 'snap-001',
      pages: Object.values(initialHandlerState.pages),
      application: initialHandlerState.snapshot.application,
      hash: btoa('test.hash'),
      languageMaps: initialHandlerState.languageMaps,
      lastAction: null,
      lastPublishedActionId: null,
    };
    const getInitialHandlerStateSpy = spyOn(helpers, 'getInitialHandlerState')
      .and.returnValue(initialHandlerState as any);
    const applyEffectsOnHandlerStateSpy = spyOn(helpers, 'applyEffectsOnHandlerState')
      .and.returnValue(initialHandlerState as any);
    const extractPagesSpy = spyOn(helpers, 'extractPagesFromHandlerState')
      .and.returnValue(initialHandlerState.pages as any);
    const getSnapshotSpy = spyOn(helpers, 'getSnapshotFromHandlerState').and.returnValue(snapshot as any);
    const updateLastActionIdSpy = spyOn(helpers, 'updateDictPagesAndSnapshotPagesLastActionId');
    const updatePageHashSpy = spyOn(helpers, 'updatePageHash').and.callFake(((page) => {
      page.hash = btoa('page.hashed');
    }));
    const hashObjectSpy = spyOn(helpers, 'hashObject').and.callFake((obj: Object) => {
      return btoa('object.hashed');
    });
    const { id, hash, ...inputAreas } = snapshot;

    const handled = pebActionHandler(currentState as any, action as any);
    delete handled.snapshot.updatedAt;
    Object.values(initialHandlerState.pages).forEach(page => expect(page.hash).toEqual(btoa('page.hashed')));
    expect(handled).toEqual({
      pages: initialHandlerState.pages,
      snapshot: {
        ...snapshot,
        hash: btoa('object.hashed'),
      },
    } as any);
    expect(getInitialHandlerStateSpy).toHaveBeenCalledWith(currentState as any);
    expect(applyEffectsOnHandlerStateSpy).toHaveBeenCalledWith(action.effects, initialHandlerState as any);
    expect(extractPagesSpy).toHaveBeenCalledWith(initialHandlerState as any);
    expect(getSnapshotSpy).toHaveBeenCalledWith(initialHandlerState as any, initialHandlerState.pages as any);
    expect(updateLastActionIdSpy)
      .toHaveBeenCalledWith(initialHandlerState.pages as any, snapshot.pages as any, action as any);
    expect(updatePageHashSpy.calls.allArgs())
      .toEqual(Object.values(initialHandlerState.pages).map(page => [page] as any));
    expect(hashObjectSpy).toHaveBeenCalledWith(inputAreas);

  });

  it('should compile actions', () => {

    const actionsMock = {
      reduce: jasmine.createSpy('reduce'),
    };
    const createSpy = spyOn(helpers, 'createInitialSnapshot').and.callThrough();

    pebCompileActions(actionsMock as any);

    expect(createSpy).toHaveBeenCalled();
    expect(actionsMock.reduce).toHaveBeenCalledWith(pebActionHandler, {
      snapshot: {
        id: null,
        hash: null,
        application: null,
        pages: [],
        updatedAt: null,
        languageMaps: [],
        lastAction: null,
        lastPublishedActionId: null,
      },
      pages: {},
    });

  });

});
