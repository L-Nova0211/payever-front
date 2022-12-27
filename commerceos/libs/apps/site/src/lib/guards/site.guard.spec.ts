import { EMPTY, of, throwError } from 'rxjs';

import { PebSitesApi } from '../services/site/abstract.sites.api';

import { PebSiteGuard } from './site.guard';

describe('PebSiteGuard', () => {

  let guard: PebSiteGuard;
  let api: jasmine.SpyObj<PebSitesApi>;
  let envService: any;

  beforeEach(() => {

    api = jasmine.createSpyObj<PebSitesApi>('PebSitesApi', [
      'getSingleSite',
      'getSiteList',
      'createSite',
    ]);

    envService = {
      shopId: undefined,
      businessData: {
        name: 'Site',
      },
    };

    guard = new PebSiteGuard(api, envService);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    const route = {
      firstChild: undefined,
      data: undefined,
    } as any;
    const sitesList = [
      { id: 'site-001', isDefault: false },
      { id: 'site-002', isDefault: false },
      { id: 'site-003', isDefault: true },
    ];
    const site = {
      id: 'site-001',
      name: 'Site',
      isDefault: false,
    };

    // w/o route
    // w/o shops
    // w/ error
    api.getSingleSite.and.returnValue(EMPTY);
    api.getSiteList.and.returnValue(of([]));
    api.createSite.and.returnValue(throwError('test error'));

    (guard.canActivate(null, null) as any).subscribe(can => expect(can).toBe(false));
    expect(envService.shopId).toBeUndefined();

    // w/o firstChild
    // w/o error
    // isDefault = FALSE
    api.createSite.and.returnValue(of(site) as any);

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(site.id);
    expect(route.data).toEqual({ site });

    // w/o firstChild.firstChild
    // isDefault = TRUE
    route.firstChild = {
      firstChild: undefined,
    };
    site.isDefault = true;

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(site.id);
    expect(route.data).toEqual({ site });

    // w/ shops
    api.getSiteList.and.returnValue(of(sitesList) as any);

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(sitesList[2].id);
    expect(route.data).toEqual({ site: sitesList[2] });

    // w/ route.firstChild.firstChild.params.shopId
    route.firstChild.firstChild = {
      params: {
        siteId: 'site-001',
      },
    };

    api.getSingleSite.and.returnValue(of(site) as any);

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.shopId).toEqual(site.id);
    expect(route.data).toEqual({ site });

  });

});
