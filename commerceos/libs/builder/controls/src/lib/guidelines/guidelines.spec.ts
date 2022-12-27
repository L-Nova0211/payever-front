import { PebElementType, PebScreen } from '@pe/builder-core';
import {
  createDistancesGuidelinesRTree,
  createDocumentRTree,
  createGuidelinesRTree,
  getChildren,
  getDistancesGuidelines,
  getGeneralRect,
  getGuidelines,
  getMagnetizedGuidelines,
  getMagnetizingThreshold,
  getMovementCandidates,
  getParentSection,
} from './guidelines';

describe('Plugins:Guidelines', () => {

  it('should create guidelines r tree', () => {

    const rendererMock = {
      options: {
        screen: PebScreen.Desktop,
        scale: 2,
      },
      getElementComponent: jasmine.createSpy('getElementComponent'),
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect'),
    };
    const elementIds = ['elem-001'];
    const elementRectMock = {
      width: 100,
      height: 100,
    };
    const treeMock = {
      search: jasmine.createSpy('search'),
    };
    const childMock = {
      id: 'child-001',
      definition: {
        id: 'child-001',
        type: PebElementType.Button,
        children: [],
      },
      nativeElement: {
        getBoundingClientRect: () => ({
          top: 120,
          left: 120,
          bottom: 220,
          right: 320,
        }),
      },
      getAbsoluteElementRect: () => ({
        width: 200,
        height: 100,
        top: 120,
        left: 120,
        bottom: 220,
        right: 320,
      }),
    };
    const elementsMock = {
      'elem-001': {
        id: 'elem-001',
        definition: {
          id: 'elem-001',
          type: PebElementType.Shape,
          children: [{ id: 'child-002' }],
        },
        nativeElement: {
          getBoundingClientRect: () => ({
            top: 100,
            left: 100,
            bottom: 900,
            right: 1100,
          }),
        },
        getAbsoluteElementRect: () => ({
          width: 100,
          height: 800,
          top: 100,
          left: 100,
          bottom: 900,
          right: 1100,
        }),
      },
      'elem-002': {
        id: 'elem-002',
        definition: {
          id: 'elem-002',
          type: PebElementType.Shape,
          children: [childMock],
        },
        nativeElement: {
          getBoundingClientRect: () => ({
            top: 100,
            left: 100,
            bottom: 900,
            right: 1100,
          }),
        },
        getAbsoluteElementRect: () => ({
          width: 100,
          height: 800,
          top: 100,
          left: 100,
          bottom: 900,
          right: 1100,
        }),
      },
    };
    const sectionMock = {
      id: 's-001',
      definition: {
        id: 's-001',
        type: PebElementType.Section,
        children: Object.values(elementsMock),
      },
      getAbsoluteElementRect: () => ({
        width: 100,
        height: 800,
        top: 100,
        left: 100,
        bottom: 900,
        right: 1100,
      }),
    };

    rendererMock.getElementComponent.and.callFake((id: string) => {
      switch (id) {
        case 's-001': return sectionMock;
        case 'child-001': return childMock;
        default: return elementsMock[id];
      }
    });
    rendererMock.getAbsoluteElementRect.and.returnValue({
      top: 100,
      left: 100,
      bottom: 900,
      right: 1100,
    });
    treeMock.search.and.returnValue([sectionMock]);

    const result = createGuidelinesRTree(rendererMock as any, elementIds, elementRectMock as any, treeMock as any);

    expect(result.all().length).toBe(12);
    expect(result.toJSON().children.length).toBe(2);
    expect(result.toJSON().minX).toBe(-4);
    expect(result.toJSON().minY).toBe(96);
    expect(result.toJSON().maxX).toBe(1104);
    expect(result.toJSON().maxY).toBe(904);

  });

  it('should create distance guidelines r tree', () => {

    const rendererMock = {
      getElementComponent: jasmine.createSpy('getElementComponent'),
    };
    const currentRectMock = {
      top: 100,
      left: 100,
      right: 1100,
      bottom: 900,
    };
    const elementIds = ['elem-001'];
    const elementMock = {
      id: 'elem-002',
      type: PebElementType.Shape,
      children: [],
      getAbsoluteElementRect: () => ({
        width: 200,
        height: 100,
        top: 450,
        left: 670,
        right: 870,
        bottom: 540,
      }),
    };
    const parentElements = {
      's-001': {
        id: 's-001',
        definition: {
          id: 's-001',
          type: PebElementType.Section,
          children: [{
            id: 'elem-001',
            type: PebElementType.Shape,
            children: [],
          }],
        },
        getAbsoluteElementRect: () => ({
          width: 500,
          height: 300,
          top: 120,
          left: 120,
          right: 620,
          bottom: 420,
        }),
      },
      's-002': {
        id: 's-002',
        definition: {
          id: 's-002',
          type: PebElementType.Section,
          children: [elementMock],
        },
        getAbsoluteElementRect: () => ({
          width: 260,
          height: 110,
          top: 440,
          left: 640,
          right: 900,
          bottom: 550,
        }),
      },
    };

    rendererMock.getElementComponent.and.callFake((id: string) => {
      switch (id) {
        case 'elem-002': return elementMock;
        default: return parentElements[id];
      }
    });

    const result = createDistancesGuidelinesRTree(
      rendererMock as any,
      elementIds,
      currentRectMock as any,
      Object.values(parentElements) as any[],
    );

    expect(result.all()).toEqual([
      {
        minX: currentRectMock.left,
        minY: currentRectMock.top,
        maxX: currentRectMock.right,
        maxY: currentRectMock.bottom,
      },
      {
        minX: 670,
        minY: 450,
        maxX: 870,
        maxY: 540,
      },
    ]);
    expect(result.toJSON().minX).toBe(currentRectMock.left);
    expect(result.toJSON().minY).toBe(currentRectMock.top);
    expect(result.toJSON().maxX).toBe(currentRectMock.right);
    expect(result.toJSON().maxY).toBe(currentRectMock.bottom);

  });

  it('should get guidelines', () => {

    const rendererMock = {
      options: {
        screen: PebScreen.Desktop,
        scale: 2,
      },
      getElementComponent: jasmine.createSpy('getElementComponent'),
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect'),
    };
    const parentRectMock = {
      top: 0,
      bottom: 1000,
      left: 0,
      right: 1200,
    };
    const currentRectMock = {
      width: 300,
      height: 300,
      top: 200,
      left: 600,
      right: 900,
      bottom: 500,
    };
    const nextRectMock = {
      width: 1200,
      height: 900,
      top: 0,
      left: 0,
      right: 1200,
      bottom: 900,
    };
    const treeMock = {
      search: jasmine.createSpy('search').and.returnValue([]),
    };

    /**
     * argument nextRect is set
     * tree.search returns []
     */
    let result = getGuidelines(
      rendererMock as any,
      treeMock as any,
      parentRectMock as any,
      currentRectMock as any,
      nextRectMock as any,
    );

    expect(result).toEqual({
      left: null,
      center: null,
      right: null,
      top: null,
      middle: null,
      bottom: null,
    });

    /**
     * tree.search returns mocked data
     */
    treeMock.search.and.returnValues(
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: -4,
        maxX: 4,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 596,
        maxX: 604,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1196,
        maxX: 1204,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1196,
        maxX: 1204,
        minY: -4,
        maxY: 4,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1196,
        maxX: 1204,
        minY: 446,
        maxY: 454,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1196,
        maxX: 1204,
        minY: 896,
        maxY: 904,
      }],
    );

    result = getGuidelines(
      rendererMock as any,
      treeMock as any,
      parentRectMock as any,
      currentRectMock as any,
      nextRectMock as any,
    );

    expect(result).toEqual({
      left: {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 900,
        position: 'left',
      },
      center: {
        minX: 600,
        minY: 0,
        maxX: 600,
        maxY: 900,
      },
      right: {
        minX: 1200,
        minY: 0,
        maxX: 1200,
        maxY: 900,
        position: 'right',
      },
      top: {
        minX: 1200,
        minY: 0,
        maxX: 1200,
        maxY: 0,
        position: 'top',
      },
      middle: {
        minX: 1200,
        minY: 450,
        maxX: 1200,
        maxY: 450,
      },
      bottom: {
        minX: 1200,
        minY: 900,
        maxX: 1200,
        maxY: 900,
        position: 'bottom',
      },
    });

    /**
     * argument nextRect is undefined as default
     * tree.search returns []
     */
    treeMock.search.and.returnValue([]);

    result = getGuidelines(
      rendererMock as any,
      treeMock as any,
      parentRectMock as any,
      currentRectMock as any,
    );

    expect(result).toEqual({
      left: null,
      center: null,
      right: null,
      top: null,
      middle: null,
      bottom: null,
    });

    /**
     * tree.search returns mocked data
     * guidelines.center & middle are set
     * the others are null
     */
    treeMock.search.and.returnValues(
      [],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 746,
        maxX: 754,
        minY: 300,
        maxY: 304,
      }], // for center
      [],
      [],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1200,
        maxX: 1300,
        minY: 346,
        maxY: 354,
      }], // for middle
      [],
    );

    result = getGuidelines(
      rendererMock as any,
      treeMock as any,
      parentRectMock as any,
      currentRectMock as any,
    );

    expect(result).toEqual({
      left: null,
      center: {
        minX: 750,
        minY: 200,
        maxX: 750,
        maxY: 500,
      },
      right: null,
      top: null,
      middle: {
        minX: 0,
        minY: 350,
        maxX: 900,
        maxY: 350,
      },
      bottom: null,
    });

    /**
     * guidelines.left & top are also set
     * right & bottom are null
     */
    treeMock.search.and.returnValues(
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 596,
        maxX: 604,
        minY: 300,
        maxY: 304,
      }], // for left
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 746,
        maxX: 754,
        minY: 300,
        maxY: 304,
      }], // for center
      [],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1200,
        maxX: 1300,
        minY: 196,
        maxY: 204,
      }], // for top
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1200,
        maxX: 1300,
        minY: 346,
        maxY: 354,
      }], // for middle
      [],
    );

    result = getGuidelines(
      rendererMock as any,
      treeMock as any,
      parentRectMock as any,
      currentRectMock as any,
    );

    expect(result).toEqual({
      left: {
        minX: 600,
        minY: 200,
        maxX: 600,
        maxY: 500,
        position: 'left',
      },
      center: {
        minX: 750,
        minY: 200,
        maxX: 750,
        maxY: 500,
      },
      right: null,
      top: {
        minX: 0,
        minY: 200,
        maxX: 900,
        maxY: 200,
        position: 'top',
      },
      middle: {
        minX: 0,
        minY: 350,
        maxX: 900,
        maxY: 350,
      },
      bottom: null,
    });

    /**
     * guidelines.right & bottom also set
     */
    treeMock.search.and.returnValues(
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 596,
        maxX: 604,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 746,
        maxX: 754,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 896,
        maxX: 904,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1200,
        maxX: 1300,
        minY: 196,
        maxY: 204,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1200,
        maxX: 1300,
        minY: 346,
        maxY: 354,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 896,
        maxX: 904,
        minY: 496,
        maxY: 504,
      }],
    );

    result = getGuidelines(
      rendererMock as any,
      treeMock as any,
      parentRectMock as any,
      currentRectMock as any,
    );

    expect(result).toEqual({
      left: {
        minX: 600,
        minY: 200,
        maxX: 600,
        maxY: 500,
        position: 'left',
      },
      center: {
        minX: 750,
        minY: 200,
        maxX: 750,
        maxY: 500,
      },
      right: {
        minX: 900,
        minY: 200,
        maxX: 900,
        maxY: 500,
        position: 'right',
      },
      top: {
        minX: 0,
        minY: 200,
        maxX: 900,
        maxY: 200,
        position: 'top',
      },
      middle: {
        minX: 0,
        minY: 350,
        maxX: 900,
        maxY: 350,
      },
      bottom: {
        minX: 900,
        minY: 500,
        maxX: 900,
        maxY: 500,
        position: 'bottom',
      },
    });

    /**
     * center is integer
     * middle is integer
     * center line is NOT integer
     * middle line is NOT integer
     */
    treeMock.search.and.returnValues(
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 596,
        maxX: 604,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 746.5,
        maxX: 754.5,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 896,
        maxX: 904,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1200,
        maxX: 1300,
        minY: 196,
        maxY: 204,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1200,
        maxX: 1300,
        minY: 346.5,
        maxY: 354.5,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 896,
        maxX: 904,
        minY: 496,
        maxY: 504,
      }],
    );

    result = getGuidelines(
      rendererMock as any,
      treeMock as any,
      parentRectMock as any,
      currentRectMock as any,
    );

    expect(result.center).toBeNull();
    expect(result.middle).toBeNull();

    /**
     * center is NOT integer
     * middle is NOT integer
     * center line is integer
     * middle line is integer
     */
    treeMock.search.and.returnValues(
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 596,
        maxX: 604,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 746,
        maxX: 754,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 896,
        maxX: 904,
        minY: 300,
        maxY: 304,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1200,
        maxX: 1300,
        minY: 196,
        maxY: 204,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 1200,
        maxX: 1300,
        minY: 346,
        maxY: 354,
      }],
      [{
        elementRect: {
          top: 300,
          bottom: 304,
          left: 0,
          right: 4,
        },
        minX: 896,
        maxX: 904,
        minY: 496,
        maxY: 504,
      }],
    );
    currentRectMock.left = 600.5;
    currentRectMock.top = 200.5;

    result = getGuidelines(
      rendererMock as any,
      treeMock as any,
      parentRectMock as any,
      currentRectMock as any,
    );

    expect(result.center).toEqual({
      minX: 750,
      minY: 200.5,
      maxX: 750,
      maxY: 500,
    });
    expect(result.middle).toEqual({
      minX: 0,
      minY: 350,
      maxX: 900,
      maxY: 350,
    });

  });

  it('should get magnetized guidelines', () => {

    const rendererMock = {
      options: {
        screen: PebScreen.Desktop,
        scale: 2,
      },
      getElementComponent: jasmine.createSpy('getElementComponent'),
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect'),
    };
    const parentRectMock = {
      top: 0,
      bottom: 1000,
      left: 0,
      right: 1200,
    };
    const initialRectMock = {
      width: 600,
      height: 350,
      top: 100,
      left: 150,
      right: 750,
      bottom: 450,
    };
    const currentRectMock = {
      width: 300,
      height: 300,
      top: 200,
      left: 600,
      right: 900,
      bottom: 500,
    };
    const newRectMock = {
      width: 1200,
      height: 900,
      top: 200,
      left: 100,
      right: 1300,
      bottom: 1100,
    };
    const movementMock = {
      dx: 100,
      dy: 150,
    };
    const treeMock = {
      search: jasmine.createSpy('search').and.returnValue([]),
    };

    /**
     * argument newRect is undefined as default
     */
    treeMock.search.and.returnValue([{
      elementRect: {
        top: 300,
        bottom: 304,
        left: 0,
        right: 4,
      },
      minX: 246,
      maxX: 254,
      minY: 246,
      maxY: 254,
    }]);

    let result = getMagnetizedGuidelines(
      rendererMock as any,
      treeMock as any,
      parentRectMock as any,
      initialRectMock as any,
      currentRectMock as any,
      movementMock,
    );

    expect(result).toEqual({
      left: {
        minX: 250,
        minY: 250,
        maxX: 250,
        maxY: 250,
        position: 'left',
        dx: movementMock.dx,
        dy: null,
      },
      top: {
        minX: 250,
        minY: 250,
        maxX: 250,
        maxY: 250,
        position: 'top',
        dx: null,
        dy: movementMock.dy,
      },
    });

    /**
     * argument newRect is set
     */
    treeMock.search.and.returnValue([{
      elementRect: {
        top: 300,
        bottom: 304,
        left: 0,
        right: 4,
      },
      minX: 96,
      maxX: 104,
      minY: 196,
      maxY: 204,
    }]);

    result = getMagnetizedGuidelines(
      rendererMock as any,
      treeMock as any,
      parentRectMock as any,
      initialRectMock as any,
      currentRectMock as any,
      movementMock,
      newRectMock as any,
    );

    expect(result).toEqual({
      left: {
        minX: 100,
        minY: 200,
        maxX: 100,
        maxY: 200,
        position: 'left',
        dx: movementMock.dx,
        dy: null,
      },
      top: {
        minX: 100,
        minY: 200,
        maxX: 100,
        maxY: 200,
        position: 'top',
        dx: null,
        dy: movementMock.dy,
      },
    });

  });

  it('should get distances guidelines', () => {

    const rendererMock = {
      options: {
        scale: 2,
      },
      getElementComponent: jasmine.createSpy('getElementComponent'),
    };
    const currentRectMock = {
      width: 400,
      height: 300,
      top: 20,
      left: 20,
      right: 420,
      bottom: 320,
    };
    const parentRectMock = {
      width: 1200,
      height: 900,
      top: 20,
      left: 20,
      right: 1220,
      bottom: 920,
    };
    const initialCoords = {
      top: 250,
      left: 250,
      right: 300,
      bottom: 350,
    };
    const movementMock = {
      dx: 100,
      dy: 150,
    };
    const treeMock = {
      search: jasmine.createSpy('search'),
    };
    const elementsMock = {
      'elem-001': {
        id: 'elem-001',
        definition: {
          id: 'elem-001',
          type: PebElementType.Shape,
        },
        nativeElement: {
          getBoundingClientRect: () => ({
            width: 400,
            height: 300,
            top: 20,
            left: 20,
            right: 420,
            bottom: 320,
          }),
        },
        getAbsoluteElementRect: () => ({
          width: 400,
          height: 300,
          top: 20,
          left: 20,
          right: 420,
          bottom: 320,
        }),
      },
      'elem-002': {
        id: 'elem-002',
        definition: {
          id: 'elem-002',
          type: PebElementType.Shape,
        },
        nativeElement: {
          getBoundingClientRect: () => ({
            width: 400,
            height: 300,
            top: 20,
            left: 420,
            right: 820,
            bottom: 320,
          }),
        },
        getAbsoluteElementRect: () => ({
          width: 400,
          height: 300,
          top: 20,
          left: 420,
          right: 820,
          bottom: 320,
        }),
      },
      'elem-003': {
        id: 'elem-003',
        definition: {
          id: 'elem-003',
          type: PebElementType.Shape,
        },
        nativeElement: {
          getBoundingClientRect: () => ({
            width: 400,
            height: 300,
            top: 20,
            left: 820,
            right: 1220,
            bottom: 320,
          }),
        },
        getAbsoluteElementRect: () => ({
          width: 400,
          height: 300,
          top: 20,
          left: 820,
          right: 1220,
          bottom: 320,
        }),
      },
      'elem-004': {
        id: 'elem-004',
        definition: {
          id: 'elem-004',
          type: PebElementType.Shape,
        },
        nativeElement: {
          getBoundingClientRect: () => ({
            width: 400,
            height: 300,
            top: 320,
            left: 20,
            right: 420,
            bottom: 620,
          }),
        },
        getAbsoluteElementRect: () => ({
          width: 400,
          height: 300,
          top: 320,
          left: 20,
          right: 420,
          bottom: 620,
        }),
      },
      'elem-005': {
        id: 'elem-005',
        definition: {
          id: 'elem-005',
          type: PebElementType.Shape,
        },
        nativeElement: {
          getBoundingClientRect: () => ({
            width: 400,
            height: 300,
            top: 320,
            left: 420,
            right: 820,
            bottom: 620,
          }),
        },
        getAbsoluteElementRect: () => ({
          width: 400,
          height: 300,
          top: 320,
          left: 420,
          right: 820,
          bottom: 620,
        }),
      },
      'elem-006': {
        id: 'elem-006',
        definition: {
          id: 'elem-006',
          type: PebElementType.Shape,
        },
        nativeElement: {
          getBoundingClientRect: () => ({
            width: 400,
            height: 300,
            top: 320,
            left: 820,
            right: 1220,
            bottom: 620,
          }),
        },
        getAbsoluteElementRect: () => ({
          width: 400,
          height: 300,
          top: 320,
          left: 820,
          right: 1220,
          bottom: 620,
        }),
      },
      'elem-007': {
        id: 'elem-007',
        definition: {
          id: 'elem-007',
          type: PebElementType.Shape,
        },
        nativeElement: {
          getBoundingClientRect: () => ({
            width: 400,
            height: 300,
            top: 620,
            left: 20,
            right: 420,
            bottom: 920,
          }),
        },
        getAbsoluteElementRect: () => ({
          width: 400,
          height: 300,
          top: 620,
          left: 20,
          right: 420,
          bottom: 920,
        }),
      },
      'elem-008': {
        id: 'elem-008',
        definition: {
          id: 'elem-008',
          type: PebElementType.Shape,
        },
        nativeElement: {
          getBoundingClientRect: () => ({
            width: 400,
            height: 300,
            top: 620,
            left: 420,
            right: 820,
            bottom: 920,
          }),
        },
        getAbsoluteElementRect: () => ({
          width: 400,
          height: 300,
          top: 620,
          left: 420,
          right: 820,
          bottom: 920,
        }),
      },
      'elem-009': {
        id: 'elem-009',
        definition: {
          id: 'elem-009',
          type: PebElementType.Shape,
        },
        nativeElement: {
          getBoundingClientRect: () => ({
            width: 400,
            height: 300,
            top: 620,
            left: 820,
            right: 1220,
            bottom: 920,
          }),
        },
        getAbsoluteElementRect: () => ({
          width: 400,
          height: 300,
          top: 620,
          left: 820,
          right: 1220,
          bottom: 920,
        }),
      },
    };
    const parentMock = {
      id: 'p-001',
      definition: {
        id: 'p-001',
        type: PebElementType.Section,
        children: Object.values(elementsMock),
      },
    };

    rendererMock.getElementComponent.and.callFake((id: string) => {
      switch (id) {
        case 'p-001': return parentMock;
        default: return elementsMock[id];
      }
    });
    treeMock.search.and.returnValue([parentMock]);

    /**
     * arguments initialCoords & movement are undefined as default
     */
    let result = getDistancesGuidelines(
      rendererMock as any,
      [],
      currentRectMock as any,
      parentRectMock as any,
      treeMock as any,
    );

    expect((result as any[]).length).toBe(13);
    expect(result).toEqual([
      {
        minX: 420,
        minY: 320,
        maxX: 420,
        maxY: 320,
        width: 0,
        isDimension: true,
      },
      {
        minX: 820,
        minY: 170,
        maxX: 820,
        maxY: 170,
        width: 0,
        isDimension: true,
      },
      {
        minX: 420,
        minY: 170,
        maxX: 420,
        maxY: 170,
        width: 0,
        isDimension: true,
      },
      {
        minX: 420,
        minY: 470,
        maxX: 420,
        maxY: 470,
        width: 0,
        isDimension: true,
      },
      {
        minX: 420,
        minY: 770,
        maxX: 420,
        maxY: 770,
        width: 0,
        isDimension: true,
      },
      {
        minX: 220,
        minY: 320,
        maxX: 220,
        maxY: 320,
        height: 0,
        isDimension: true,
      },
      {
        minX: 220,
        minY: 620,
        maxX: 220,
        maxY: 620,
        height: 0,
        isDimension: true,
      },
      {
        minX: 220,
        minY: 320,
        maxX: 220,
        maxY: 320,
        height: 0,
        isDimension: true,
      },
      {
        minX: 620,
        minY: 320,
        maxX: 620,
        maxY: 320,
        height: 0,
        isDimension: true,
      },
      {
        minX: 1020,
        minY: 320,
        maxX: 1020,
        maxY: 320,
        height: 0,
        isDimension: true,
      },
      {
        minX: 220,
        minY: 620,
        maxX: 220,
        maxY: 620,
        height: 0,
        isDimension: true,
      },
      {
        minX: 820,
        minY: 170,
        maxX: 820,
        maxY: 170,
        width: 0,
        isDimension: true,
      },
      {
        minX: 420,
        minY: 170,
        maxX: 420,
        maxY: 170,
        width: 0,
        isDimension: true,
      },
    ]);

    /**
     * arguments initialCoords & movement are set
     */
    result = getDistancesGuidelines(
      rendererMock as any,
      [],
      currentRectMock as any,
      parentRectMock as any,
      treeMock as any,
      initialCoords as any,
      movementMock,
    );

    expect(result).toEqual({
      left: undefined,
      top: undefined,
    });

    /**
     * update initialCoords & movement
     */
    initialCoords.left = 622;
    initialCoords.top = 422;
    initialCoords.right = 222;
    initialCoords.bottom = 122;
    movementMock.dx = 200;
    movementMock.dy = 200;

    result = getDistancesGuidelines(
      rendererMock as any,
      [],
      currentRectMock as any,
      parentRectMock as any,
      treeMock as any,
      initialCoords as any,
      movementMock,
    );

    expect(result).toEqual({
      left: { dx: 198 },
      top: { dy: 198 },
    });

    /**
     * update initialCoords & movement
     */
    initialCoords.left = 222;
    initialCoords.top = 122;

    result = getDistancesGuidelines(
      rendererMock as any,
      [],
      currentRectMock as any,
      parentRectMock as any,
      treeMock as any,
      initialCoords as any,
      movementMock,
    );

    expect(result).toEqual({
      left: { dx: 198 },
      top: { dy: 198 },
    });

  });

  it('should get parent section', () => {

    const rendererMock = {
      getElementComponent: jasmine.createSpy('getElementComponent'),
    };
    const treeMock = {
      search: jasmine.createSpy('search'),
    };
    const elementIds = ['elem-001', 'elem-002'];
    const parentMock = {
      id: 'p-001',
      definition: {
        id: 'p-001',
        type: PebElementType.Section,
      },
    };
    const elementsMock = {
      'elem-001': {
        id: 'elem-001',
        type: PebElementType.Shape,
        nativeElement: {
          getBoundingClientRect: () => ({
            top: 100,
            left: 50,
            right: 150,
            bottom: 200,
          }),
        },
      },
      'elem-002': {
        id: 'elem-002',
        type: PebElementType.Shape,
        nativeElement: {
          getBoundingClientRect: () => ({
            top: 200,
            left: 30,
            right: 100,
            bottom: 110,
          }),
        },
      },
    };

    rendererMock.getElementComponent.and.callFake((id: string) => {
      switch (id) {
        case 'p-001': return parentMock;
        default: return elementsMock[id];
      }
    });
    treeMock.search.and.returnValue([parentMock]);

    expect(getParentSection(rendererMock as any, treeMock as any, elementIds)).toEqual([parentMock.definition]);
    expect(rendererMock.getElementComponent.calls.allArgs()).toEqual([
      ['elem-001'],
      ['elem-002'],
      ['p-001'],
    ]);
    expect(treeMock.search).toHaveBeenCalledWith({
      minX: 30,
      minY: 101,
      maxX: 150,
      maxY: 199,
    });

  });

  it('should get magnetizing treshold', () => {

    const rendererMock = {
      options: {
        scale: .25,
      },
    };
    const elementRectMock = {
      width: 100,
      height: 120,
    };

    /**
     * renderer.options.scale is 0.25
     */
    expect(getMagnetizingThreshold(rendererMock as any, elementRectMock as any)).toBe(18);

    /**
     * renderer.options.scale is 2
     * elementRect.width is more than 18
     * elementRect.height is more than 18
     */
    rendererMock.options.scale = 2;
    expect(getMagnetizingThreshold(rendererMock as any, elementRectMock as any)).toBe(4);

    /**
     * elementRect.width is less than 18
     * elementRect.height is less than 18
     * elementRect.width is more than elementRect height
     */
    elementRectMock.width = 10;
    elementRectMock.height = 8;
    expect(getMagnetizingThreshold(rendererMock as any, elementRectMock as any)).toBe(2);

    /**
     * renderer.options.scale is .75
     * elementRect.width is less than elementRect height
     */
    rendererMock.options.scale = .75;
    elementRectMock.height = 12;
    expect(getMagnetizingThreshold(rendererMock as any, elementRectMock as any)).toBe(2);

  });

  it('should get movement candidates', () => {

    const guidelines = {
      left: null,
      center: { minX: 100 },
      right: { minX: 200 },
      top: { minY: 0 },
      middle: { minY: 100 },
      bottom: { minY: 200 },
      test: { minY: 200 }, // added to cover else branch
    };
    const movementMock = {
      dx: 100,
      dy: 150,
    };
    const nextRectMock = {
      width: 100,
      height: 400,
      top: 120,
      left: 240,
      right: 340,
      bottom: 520,
    };

    const result = getMovementCandidates(guidelines, movementMock, nextRectMock);

    expect(result).toEqual({
      left: {
        minX: 100,
        dx: -90,
        dy: null,
      },
      top: {
        minY: 200,
        dx: null,
        dy: -170,
      },
    });

  });

  it('should get general rect', () => {

    const rendererMock = {
      getElementComponent: jasmine.createSpy('getElementComponent'),
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect'),
    };
    const elementDefs = [
      { id: 'elem-001' },
      { id: 'elem-002' },
    ];
    const elementsMock = {
      'elem-001': {
        id: 'elem-001',
        type: PebElementType.Shape,
      },
      'elem-002': {
        id: 'elem-002',
        type: PebElementType.Shape,
      },
    };

    rendererMock.getElementComponent.and.callFake((id: string) => {
      return elementsMock[id];
    });
    rendererMock.getAbsoluteElementRect.and.callFake((elem: any) => {
      if (elem.id === 'elem-001') {
        return {
          top: 100,
          left: 50,
          right: 150,
          bottom: 250,
        };
      }
      return {
        top: 50,
        left: 300,
        right: 250,
        bottom: 150,
      };
    });

    expect(getGeneralRect(rendererMock as any, elementDefs as any)).toEqual({
      left: 50,
      right: 250,
      top: 50,
      bottom: 250,
      width: 200,
      height: 200,
    } as any);

  });

  it('should create document r tree', () => {

    const pageMock = {
      template: { id: 'tpl-001' },
    };
    const rendererMock = {
      getElementComponent: jasmine.createSpy('getElementComponent'),
    };
    const elementsMock = {
      'elem-001': {
        id: 'elem-001',
        definition: { id: 'elem-001' },
        children: [],
        nativeElement: {
          getBoundingClientRect: () => ({
            top: 0,
            left: 0,
            right: 250,
            bottom: 500,
          }),
        },
      },
      'elem-002': {
        id: 'elem-002',
        definition: { id: 'elem-002' },
        children: [],
        nativeElement: {
          getBoundingClientRect: () => ({
            top: 500,
            left: 250,
            right: 500,
            bottom: 1000,
          }),
        },
      },
    };
    const childMock = {
      id: 'child-001',
      definition: { id: 'child-001' },
      nativeElement: {
        getBoundingClientRect: () => ({
          top: 500,
          left: 250,
          right: 500,
          bottom: 750,
        }),
      },
    };
    const documentMock = {
      children: Object.values(elementsMock),
    };

    elementsMock['elem-002'].children.push(childMock, { id: 'child-002' });
    rendererMock.getElementComponent.and.callFake((id: string) => {
      switch (id) {
        case 'tpl-001': return documentMock;
        case 'child-001': return childMock;
        default: return elementsMock[id] ?? null;
      }
    });

    /**
     * arguments onlySections & onlyChildren are FALSE as default
     */
    let result = createDocumentRTree(pageMock as any, rendererMock as any);

    expect(result.all().length).toBe(0);

    /**
     * arguments onlySections & onlyChildren are TRUE
     */
    result = createDocumentRTree(pageMock as any, rendererMock as any, true, true);

    expect(result.all()).toEqual([
      {
        id: 'elem-001',
        minX: 0,
        minY: 0,
        maxX: 250,
        maxY: 500,
        zIndex: 0,
      },
      {
        id: 'elem-002',
        minX: 250,
        minY: 500,
        maxX: 500,
        maxY: 1000,
        zIndex: 0,
      },
      {
        id: 'child-001',
        minX: 250,
        minY: 500,
        maxX: 500,
        maxY: 750,
        zIndex: 1,
      },
    ] as any);

  });

  it('should get children', () => {

    const childrenMock = [
      {
        definition: { id: 'child-001' },
        children: null,
      },
      {
        definition: { id: 'child-002' },
        children: [{
          definition: { id: 'child-003' },
          children: null,
        }],
      },
    ];
    const elementDef = {
      id: 'elem-001',
      children: null,
    };

    /**
     * elementDef.children is null
     * argument zIndex is 0 as default
     */
    expect(getChildren(elementDef as any)).toBeUndefined();

    /**
     * elementDef.children is set
     */
    elementDef.children = childrenMock;
    expect(getChildren(elementDef as any)).toEqual([
      ...childrenMock.map(child => ({ ...child.definition, zIndex: 0 })),
      ...childrenMock[1].children.map(child => ({ ...child.definition, zIndex: 1 })),
    ] as any[]);

    /**
     * argument zIndex is set
     */
    expect(getChildren(elementDef as any, 5)).toEqual([
      ...childrenMock.map(child => ({ ...child.definition, zIndex: 5 })),
      ...childrenMock[1].children.map(child => ({ ...child.definition, zIndex: 6 })),
    ] as any[]);

  });

});
