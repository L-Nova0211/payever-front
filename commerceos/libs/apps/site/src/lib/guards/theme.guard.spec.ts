import { of } from 'rxjs';

import { PebEditorApi, PebThemesApi } from '@pe/builder-api';

import { SiteEnvService } from '../services/site-env.service';

import { SiteThemeGuard } from './theme.guard';


describe('SiteThemeGuard', () => {

  let guard: SiteThemeGuard;
  let api: jasmine.SpyObj<PebEditorApi>;
  let themesApi: jasmine.SpyObj<PebThemesApi>;
  let envService: jasmine.SpyObj<SiteEnvService>;

  beforeEach(() => {

    api = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', ['getShopActiveTheme']);

    themesApi = jasmine.createSpyObj<PebThemesApi>('PebThemesApi', ['createApplicationTheme']) as jasmine.SpyObj<PebThemesApi>;

    envService = {
      siteId: undefined,
    } as jasmine.SpyObj<SiteEnvService>;

    guard = new SiteThemeGuard(api, themesApi, envService);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    const route = {
      parent: {
        params: {
          siteId: undefined,
        },
      },
    } as any;
    const activeTheme = {
      id: 'theme-001',
      theme: {},
      isActive: true,
      isDestroyed: false,
    };

    // w/o shopId
    expect(() => {
      guard.canActivate(route, null)
    }).toThrowError();

    // w/ shopId
    // w/ result.id
    route.parent.params.siteId = 'shop-001';

    api.getShopActiveTheme.and.returnValue(of(activeTheme) as any);

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(api.getShopActiveTheme).toHaveBeenCalledWith('shop-001');
    expect(themesApi.createApplicationTheme).not.toHaveBeenCalled();

    // w/o result.id
    activeTheme.id = undefined;
    themesApi.createApplicationTheme.and.returnValue(of({ ...activeTheme, id: 'created.theme' }));

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(themesApi.createApplicationTheme).toHaveBeenCalled();

  });

});
