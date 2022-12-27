import { HandlerStateEffect, PebAction, PebPageType, PebPageVariant, PebScreen } from '@pe/builder-core';

import { PebActionType, pebCreateAction } from './action-creator.service';

describe('ActionCreatorService', () => {

  const page = {
    id: 'page',
    name: 'name',
    variant: PebPageVariant.Default,
    type: PebPageType.Master,
    master: {},
    data: {},
    templateId: 'template',
    template: {},
    stylesheetIds: {
      [PebScreen.Desktop]: 'd-001',
      [PebScreen.Tablet]: 't-001',
      [PebScreen.Mobile]: 'm-001',
    },
    stylesheets: {
      [PebScreen.Desktop]: {},
      [PebScreen.Tablet]: {},
      [PebScreen.Mobile]: {},
    },
    contextId: 'context',
    context: {},
  };

  it('should create page action', () => {

    let action: PebAction;

    action = pebCreateAction(PebActionType.CreatePage as any, page as any);
    expect(action.targetPageId).toEqual(page.id);
    expect(action.effects.length).toBe(7);

    // page type is replice
    page.type = PebPageType.Replica;

    action = pebCreateAction(PebActionType.CreatePage as any, page as any);
    expect(action.targetPageId).toEqual(page.id);
    expect(action.effects.length).toBe(8);

  });

  it('should delete page action', () => {

    const action = pebCreateAction(PebActionType.DeletePage as any, page as any);
    expect(action.targetPageId).toEqual(page.id);
    expect(action.effects.length).toBe(6);

  });

  it('should create page with ids', () => {

    const ids = {
      routeId: 'route',
      pageId: 'page',
      templateId: 'template',
      contextId: 'context',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
        [PebScreen.Tablet]: 't-001',
        [PebScreen.Mobile]: 'm-001',
      },
    };

    const action = pebCreateAction(PebActionType.CreatePageWithIds as any, { page, ids } as any);

    expect(action.targetPageId).toEqual(page.id);
    expect(action.effects.length).toBe(8);

  });

  it('should update page data action', () => {

    const action = pebCreateAction(PebActionType.UpdatePageData, page as any);

    expect(action.targetPageId).toEqual(page.id);
    expect(action.effects.length).toBe(1);

  });

  it('should update shop data action', () => {

    const action = pebCreateAction(PebActionType.UpdateShopData, page as any);

    expect(action.targetPageId).toBeNull();
    expect(action.effects.length).toBe(1);

  });

  it('should reorder pages action', () => {

    const action = pebCreateAction(PebActionType.ReorderPages, page as any);

    expect(action.targetPageId).toBeNull();
    expect(action.effects[0]).toEqual({
      payload: page,
      type: HandlerStateEffect.ReorderPages,
      target: '',
    });

  });

});
