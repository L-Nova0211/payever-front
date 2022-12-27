import { PebShopEffect } from '../../models/action';
import { PebLanguage } from '../../models/client';

import { pebShopEffectHandlers } from './shop.effects';

describe('Effects:Shop', () => {

  let prevState: any;

  beforeEach(() => {

    prevState = {
      pages: [
        { id: 'p-001' },
        { id: 'p-002' },
        { id: 'p-003' },
      ],
      application: {
        id: 'app-001',
        productPages: '',
        categoryPages: '',
        routing: [
          {
            routeId: 'r-002',
            pageId: 'p-002',
            url: 'pages/p-002',
          },
          {
            routeId: 'r-003',
            pageId: 'p-003',
            url: 'pages/p-003',
          },
        ],
      },
      hash: btoa('test'),
      languageMaps: {
        [PebLanguage.German]: { locale: PebLanguage.German },
      },
      lastAction: null,
      lastPublishedActionId: null,
    };

  });

  it('should handle shop create effect', () => {

    const createHandler = pebShopEffectHandlers[PebShopEffect.Init];
    const payload = {
      pages: [],
      application: {
        data: {
          id: 'app-001',
          productPages: '/products/:productId',
        },
      },
    };

    expect(createHandler(null, payload)).toEqual(payload as any);

  });

  it('should handle update data effect', () => {

    const updateDataHandler = pebShopEffectHandlers[PebShopEffect.UpdateData];
    const payload = {
      productPages: '/products/:productId',
      categoryPages: '/category/:categoryId',
    };

    expect(updateDataHandler(prevState, payload)).toEqual({
      ...prevState,
      application: {
        ...prevState.application,
        data: {
          ...prevState.application.data,
          ...payload,
        },
      },
    });

  });

  it('should handle update routing effect', () => {

    const updateRoutingHandler = pebShopEffectHandlers[PebShopEffect.UpdateRouting];
    const payload = [{
      routeId: 'r-001',
      pageId: 'p-001',
      url: 'pages/p-001',
    }];

    /**
     * argument prevState is null
     */
    expect(updateRoutingHandler(null, payload)).toEqual({
      application: {
        routing: payload,
      },
    } as any);

    /**
     * argument prevState is set
     */
    expect(updateRoutingHandler(prevState, payload)).toEqual({
      ...prevState,
      application: {
        ...prevState.application,
        routing: payload,
      },
    } as any);

  });

  it('should handle patch routing effect', () => {

    const patchRoutingHandler = pebShopEffectHandlers[PebShopEffect.PatchRouting];
    const payload = [
      {
        routeId: 'r-001',
        pageId: 'p-001',
        url: 'pages/p-001',
      },
      {
        routeId: 'r-003',
        pageId: 'p-003',
        url: 'pages/p-003/new',
      },
    ];

    /**
     * argument prevState is null
     */
    expect(patchRoutingHandler(null, payload)).toEqual({
      application: {
        routing: payload,
      },
    } as any);

    /**
     * application in argument prevState is null
     */
    expect(patchRoutingHandler({ application: null } as any, payload)).toEqual({
      application: {
        routing: payload,
      },
    } as any);

    /**
     * application.routing in argument prevState is null
     */
    expect(patchRoutingHandler({ application: { routing: null } } as any, payload)).toEqual({
      application: {
        routing: payload,
      },
    } as any);

    /**
     * argument prevState fully mocked
     */
    expect(patchRoutingHandler(prevState, payload)).toEqual({
      ...prevState,
      application: {
        ...prevState.application,
        routing: [
          ...payload.reverse(),
          prevState.application.routing[0],
        ],
      },
    } as any);

  });

  it('should handle delete routes effect', () => {

    const deleteRoutesHandler = pebShopEffectHandlers[PebShopEffect.DeleteRoutes];
    const payload = [prevState.application.routing[0]];

    /**
     * argument prevState is null
     */
    expect(deleteRoutesHandler(null, payload)).toEqual({
      application: {
        routing: [],
      },
    } as any);

    /**
     * application in argument prevState is null
     */
    expect(deleteRoutesHandler({ application: null } as any, payload)).toEqual({
      application: {
        routing: [],
      },
    } as any);

    /**
     * argument prevState fully mocked
     */
    expect(deleteRoutesHandler(prevState, payload)).toEqual({
      ...prevState,
      application: {
        ...prevState.application,
        routing: [{
          routeId: 'r-003',
          pageId: 'p-003',
          url: 'pages/p-003',
        }],
      },
    });

  });

  it('should handle update pages effect', () => {

    const updatePagesHandler = pebShopEffectHandlers[PebShopEffect.UpdatePages];
    const payload: any[] = [{ id: 'p-001' }];

    expect(updatePagesHandler(prevState, payload)).toEqual({
      ...prevState,
      pages: payload,
    });

  });

  it('should handle append pages effect', () => {

    const appendPageHandler = pebShopEffectHandlers[PebShopEffect.AppendPage];
    const payload = {
      id: 'p-004',
      duplicatedPageId: null,
    };

    /**
     * argument prevState is null
     * payload.duplicatedPageId is null
     */
    expect(appendPageHandler(null, payload)).toEqual({
      pages: [payload],
    } as any);

    /**
     * argument prevState is set
     */
    expect(appendPageHandler(prevState, payload)).toEqual({
      ...prevState,
      pages: [...prevState.pages, payload],
    } as any);

    /**
     * payload.duplicatedPageId is 'p-005'
     */
    payload.duplicatedPageId = 'p-005';
    expect(appendPageHandler(prevState, payload)).toEqual({
      ...prevState,
      pages: [...prevState.pages.slice(0, 3), payload],
    } as any);

    /**
     * payload.duplicatedPageId is 'p-002'
     */
    prevState.pages.pop();
    payload.duplicatedPageId = 'p-002';
    expect(appendPageHandler(prevState, payload)).toEqual({
      ...prevState,
      pages: [
        { id: 'p-001' },
        { id: 'p-002' },
        payload,
        { id: 'p-003' },
      ],
    } as any);

  });

});
