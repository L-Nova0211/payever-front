import { PebPageVariant } from '../../models/client';
import { PebThemePageInterface } from '../../models/database';

import { pebPageEffectHandler } from './page.effects';

describe('Effects:Page', () => {

  const pebPageEffectCreateHandler = pebPageEffectHandler['page:init'];
  const pebPageEffectUpdateHandler = pebPageEffectHandler['page:update'];

  let payload: PebThemePageInterface;
  let prevPage: PebThemePageInterface;

  beforeEach(() => {

    payload = {
      name: 'Page 2',
      variant: PebPageVariant.Default,
      master: { id: 'master-002', idsMap: {} },
      data: { url: 'pages/p-002' },
      skip: false,
      parentId: 'parent-002',
    } as PebThemePageInterface;

    prevPage = {
      id: 'p-001',
      name: 'Page 1',
      variant: PebPageVariant.Front,
      master: { id: 'master-001' },
      data: { url: 'pages/p-001' },
      skip: true,
      parentId: 'parent-001',
    } as PebThemePageInterface;

  });

  it('should pebPageEffectCreateHandler', () => {

    expect(pebPageEffectCreateHandler(null, payload)).toEqual(payload);

  });

  it('should pebPageEffectUpdateHandler', () => {

    /**
     * arguments prevPage & payload are null
     */
    expect(pebPageEffectUpdateHandler(null, null)).toEqual({
      name: undefined,
      variant: undefined,
      master: {},
      data: {},
      skip: undefined,
      parentId: undefined,
    } as any);

    /**
     * argument prevPage is set
     */
    expect(pebPageEffectUpdateHandler(prevPage, null)).toEqual(prevPage);

    /**
     * argument payload is set
     */
    expect(pebPageEffectUpdateHandler(prevPage, payload)).toEqual({
      ...payload,
      id: prevPage.id,
    });

  });

});
