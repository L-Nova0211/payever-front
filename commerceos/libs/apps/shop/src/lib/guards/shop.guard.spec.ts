import { EMPTY, of, throwError } from 'rxjs';

import { PebShopsApi } from '@pe/builder-api';
import { PebEnvService } from '@pe/builder-core';

import { PebShopGuard } from './shop.guard';

describe('PebShopGuard', () => {

  let guard: PebShopGuard;
  let api: jasmine.SpyObj<PebShopsApi>;
  let envService: jasmine.SpyObj<PebEnvService>;

  beforeEach(() => {

    api = jasmine.createSpyObj<PebShopsApi>('PebShopsApi', [
      'getSingleShop',
      'getShopsList',
      'createShop',
    ]);

    envService = {
      shopId: undefined,
      businessData: {
        name: 'Shop',
      },
    } as jasmine.SpyObj<PebEnvService>;

    guard = new PebShopGuard(api, envService);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    const route = {
      firstChild: undefined,
      data: undefined,
    } as any;
    const shopsList = [
      { id: 'shop-001', isDefault: false },
      { id: 'shop-002', isDefault: false },
      { id: 'shop-003', isDefault: true },
    ];
    const shop = {
      id: 'shop-001',
      name: 'Shop',
      isDefault: false,
    };

    // w/o route
    // w/o shops
    // w/ error
    api.getSingleShop.and.returnValue(EMPTY);
    api.getShopsList.and.returnValue(of([]));
    api.createShop.and.returnValue(throwError('test error'));

    (guard.canActivate(null, null) as any).subscribe(can => expect(can).toBe(false));
    expect(envService.shopId).toBeUndefined();

    // w/o firstChild
    // w/o error
    // isDefault = FALSE
    api.createShop.and.returnValue(of(shop));

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(shop.id);
    expect(route.data).toEqual({ shop });

    // w/o firstChild.firstChild
    // isDefault = TRUE
    route.firstChild = {
      firstChild: undefined,
    };
    shop.isDefault = true;

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(shop.id);
    expect(route.data).toEqual({ shop });

    // w/ shops
    api.getShopsList.and.returnValue(of(shopsList));

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(shopsList[2].id);
    expect(route.data).toEqual({ shop: shopsList[2] });

    // w/ route.firstChild.firstChild.params.shopId
    route.firstChild.firstChild = {
      params: {
        shopId: 'shop-001',
      },
    };

    api.getSingleShop.and.returnValue(of(shop) as any);

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(shop.id);
    expect(route.data).toEqual({ shop });

  });

});
