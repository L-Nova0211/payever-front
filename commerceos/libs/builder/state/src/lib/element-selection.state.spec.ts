import { TestBed } from '@angular/core/testing';
import { PebElementType, PebFunctionType, PebIntegrationActionTag } from '@pe/builder-core';
import { PebEditorAccessorService } from '../services';
import { PebElementSelectionState } from './element-selection.state';

describe('PebElementSelectionState', () => {

  let state: PebElementSelectionState;
  let renderer: {
    elementRegistry: {
      get: jasmine.Spy;
    };
  };

  beforeEach(() => {

    renderer = {
      elementRegistry: {
        get: jasmine.createSpy('get').and.callFake((id: string) => ({ id })),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        PebElementSelectionState,
        { provide: PebEditorAccessorService, useValue: { renderer } },
      ],
    });

    state = TestBed.inject(PebElementSelectionState);

  });

  it('should be defined', () => {

    expect(state).toBeDefined();

  });

  it('should get id & elements', () => {

    const stateMock = {
      id: 'state-001',
      elements: [{ id: 'elem-001' }],
    };

    expect(PebElementSelectionState.id(stateMock as any)).toEqual(stateMock.id);
    expect(PebElementSelectionState.elements(stateMock as any)).toEqual(stateMock.elements as any);

  });

  it('should get text elements', () => {

    const stateMock = {
      elements: [
        {
          id: 'elem-001',
          type: PebElementType.Shape,
        },
        {
          id: 'elem-002',
          type: PebElementType.Grid,
          data: {
            functionLink: null,
          },
          children: [
            {
              id: 'child-001',
              type: PebElementType.Text,
            },
            {
              id: 'child-002',
              type: PebElementType.Button,
            },
          ],
        },
        {
          id: 'elem-003',
          type: PebElementType.Grid,
          data: {
            functionLink: null,
          },
          children: [],
        },
        {
          id: 'elem-004',
          type: PebElementType.Grid,
          data: {
            functionLink: {
              tags: null,
            },
          },
          children: [],
        },
        {
          id: 'elem-005',
          type: PebElementType.Grid,
          data: {
            functionLink: {
              functionType: PebFunctionType.Action,
              tags: [PebIntegrationActionTag.GetCategoriesByProducts],
            },
          },
          children: [],
        },
        {
          id: 'elem-006',
          type: PebElementType.Video,
        },
      ],
    };

    expect(PebElementSelectionState.textElements(stateMock as any)).toEqual([
      {
        id: 'elem-001',
        type: PebElementType.Shape,
      },
      {
        id: 'child-001',
        type: PebElementType.Text,
      },
      {
        id: 'elem-005',
        type: PebElementType.Grid,
        data: {
          functionLink: {
            functionType: PebFunctionType.Action,
            tags: [PebIntegrationActionTag.GetCategoriesByProducts],
          },
        },
        children: [],
      },
    ]);

  });

  it('should select', () => {

    const stateMock = {
      id: ['elem-001'],
    };
    const funcs = {
      getState: jasmine.createSpy('getState').and.returnValue(stateMock),
      setState: jasmine.createSpy('setState'),
    };
    const payload = 'elem-001';
    const elementMock = { id: 'elem-001' };

    /**
     * argument payload is typeof string
     * old state.id already includes 'elem-001'
     */
    state.select(funcs as any, { payload });

    expect(renderer.elementRegistry.get).not.toHaveBeenCalled();
    expect(funcs.getState).toHaveBeenCalled();
    expect(funcs.setState).not.toHaveBeenCalled();

    /**
     * old state.id is []
     */
    stateMock.id = [];
    state.select(funcs as any, { payload });

    expect(renderer.elementRegistry.get).toHaveBeenCalledOnceWith(payload);
    expect(funcs.setState).toHaveBeenCalledWith({
      id: [payload],
      elements: [elementMock],
    });

    /**
     * argument payload is typeof array
     */
    renderer.elementRegistry.get.calls.reset();
    funcs.setState.calls.reset();

    state.select(funcs as any, { payload: [payload] });

    expect(renderer.elementRegistry.get).toHaveBeenCalledOnceWith(payload);
    expect(funcs.setState).toHaveBeenCalledWith({
      id: [payload],
      elements: [elementMock],
    });

  });

  it('should add to selection', () => {

    const stateMock = {
      id: ['elem-001'],
    };
    const funcs = {
      getState: jasmine.createSpy('getState').and.returnValue(stateMock),
      setState: jasmine.createSpy('setState'),
    };
    let payload: string | string[] = 'elem-001';
    const elements = {
      'elem-001': { id: 'elem-001' },
      'elem-002': { id: 'elem-002' },
    };

    /**
     * old state already includes 'elem-001'
     * argument payload is typeof string
     */
    state.addToSelection(funcs as any, { payload });

    expect(funcs.getState).toHaveBeenCalled();
    expect(renderer.elementRegistry.get).not.toHaveBeenCalled();
    expect(funcs.setState).not.toHaveBeenCalled();

    /**
     * argument payload is typeof array
     */
    payload = ['elem-002'];
    state.addToSelection(funcs as any, { payload });

    expect(renderer.elementRegistry.get.calls.allArgs()).toEqual(Object.keys(elements).map(key => [key]));
    expect(funcs.setState).toHaveBeenCalledWith({
      id: ['elem-001', 'elem-002'],
      elements: Object.values(elements),
    });

  });

  it('shuld remove from selection', () => {

    const stateMock = {
      id: ['elem-001', 'elem-002', 'elem-003'],
    };
    const funcs = {
      getState: jasmine.createSpy('getState').and.returnValue(stateMock),
      setState: jasmine.createSpy('setState'),
    };
    const payload = 'elem-002';
    const elements = stateMock.id.filter(id => id !== payload).map(i => ({ id: i }));

    /**
     * argument payload is typeof string
     */
    state.removeFromSelection(funcs as any, { payload });

    expect(funcs.getState).toHaveBeenCalled();
    expect(renderer.elementRegistry.get.calls.allArgs()).toEqual(elements.map(elem => [elem.id]));
    expect(funcs.setState).toHaveBeenCalledWith({
      elements,
      id: stateMock.id.filter(id => id !== payload),
    });

    /**
     * argument payload is typeof array
     */
    renderer.elementRegistry.get.calls.reset();
    funcs.setState.calls.reset();
    state.removeFromSelection(funcs as any, { payload: [payload] });

    expect(renderer.elementRegistry.get.calls.allArgs()).toEqual(elements.map(elem => [elem.id]));
    expect(funcs.setState).toHaveBeenCalledWith({
      elements,
      id: stateMock.id.filter(id => id !== payload),
    });

  });

  it('should deselect', () => {

    const setStateSpy = jasmine.createSpy('setState');

    state.deselect({ setState: setStateSpy } as any);

    expect(setStateSpy).toHaveBeenCalledWith({
      id: [],
      elements: [],
    });

  });

});
